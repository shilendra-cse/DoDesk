import { create } from 'zustand'
import { Workspace, Team, TeamMember } from '@/types/workspace'
import api from '@/lib/axios'
import { unwrap } from '@/lib/api'

interface WorkspaceStoreState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  lastActiveWorkspaceId: string | null
  isLoading: boolean
  hasWorkspaces: boolean
  teams: Team[]
  members: TeamMember[]
  currentUser: { id: string; email: string; name?: string } | null
  // Actions
  fetchWorkspaces: () => Promise<void>
  fetchTeams: () => Promise<void>
  fetchMembers: () => Promise<void>
  switchWorkspace: (slug: string) => Promise<void>
  addWorkspace: (workspace: Workspace) => Promise<void>
  getWorkspaceBySlug: (slug: string) => Workspace | null
  setCurrentWorkspaceBySlug: (slug: string) => void
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  lastActiveWorkspaceId: null,
  isLoading: true,
  hasWorkspaces: false,
  teams: [],
  members: [],
  currentUser: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true })
    try {
      const [userResponse, workspacesResponse] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/workspaces')
      ])
      const workspaces: Workspace[] = unwrap<{ workspaces: Workspace[] }>(workspacesResponse).workspaces || []
      const lastActiveWorkspaceId = unwrap<{ user: { lastActiveWorkspaceId: string | null } }>(userResponse).user.lastActiveWorkspaceId || null
      const currentUser = unwrap<{ user: { id: string; email: string; name?: string } }>(userResponse).user

      // Set current workspace based on last active, or fallback to first
      let current: Workspace | null = null
      if (lastActiveWorkspaceId) {
        current = workspaces.find(w => w.id === lastActiveWorkspaceId) || null
      } else if (workspaces.length > 0) {
        current = workspaces[0]
      }

      set({
        workspaces,
        lastActiveWorkspaceId,
        currentWorkspace: current,
        hasWorkspaces: workspaces.length > 0,
        teams: current?.teams || [],
        members: [],
        currentUser,
        isLoading: false
      })
    } catch (error) {
      set({
        workspaces: [],
        lastActiveWorkspaceId: null,
        currentWorkspace: null,
        hasWorkspaces: false,
        teams: [],
        members: [],
        currentUser: null,
        isLoading: false
      })
      console.error('Failed to fetch workspaces:', error)
    }
  },

  fetchTeams: async () => {
    const currentWorkspace = get().currentWorkspace
    if (!currentWorkspace) return
    try {
      const res = await api.get(`/api/workspaces/${currentWorkspace.id}/teams`)
      const teams = unwrap<{ teams: Team[] }>(res).teams || []
      set({ teams })
    } catch (error) {
      set({ teams: [] })
      console.error('Failed to fetch teams:', error)
    }
  },

  fetchMembers: async () => {
    const currentWorkspace = get().currentWorkspace
    if (!currentWorkspace) return
    try {
      const res = await api.get(`/api/workspaces/${currentWorkspace.id}/members/unique`)
      const backendMembers = unwrap<{ members: Array<{ id: string; user_id: string; name?: string; email: string }> }>(res).members || []
      const transformedMembers = backendMembers.map((member) => ({
        id: member.id,
        userId: member.user_id,
        role: 'member' as const,
        user: {
          id: member.user_id,
          name: member.name ?? '',
          email: member.email
        }
      }))
      set({ members: transformedMembers })
    } catch (error) {
      set({ members: [] })
      console.error('Failed to fetch members:', error)
    }
  },

  switchWorkspace: async (slug: string) => {
    const workspace = get().getWorkspaceBySlug(slug)
    if (workspace) {
      try {
        await api.patch('/api/users/me/active-workspace', { workspaceId: workspace.id })
        set({
          currentWorkspace: workspace,
          lastActiveWorkspaceId: workspace.id,
          teams: workspace.teams || [],
          members: []
        })
      } catch (error) {
        console.error('Failed to switch workspace:', error)
      }
    }
  },

  addWorkspace: async (workspace: Workspace) => {
    try {
      set(state => {
        const exists = state.workspaces.some(w => w.id === workspace.id)
        if (exists) return state
        return { workspaces: [...state.workspaces, workspace] }
      })

      set({
        currentWorkspace: workspace,
        lastActiveWorkspaceId: workspace.id,
        teams: workspace.teams || [],
        members: []
      })

      try {
        await api.patch('/api/users/me/active-workspace', { workspaceId: workspace.id })
      } catch (error) {
        console.error('Failed to set last active workspace:', error)
      }

    } catch (error) {
      console.error('Error adding workspace:', error)
      throw error
    }
  },

  getWorkspaceBySlug: (slug: string) => {
    const { workspaces } = get()
    return workspaces.find(w => w.slug === slug) || null
  },

  setCurrentWorkspaceBySlug: (slug: string) => {
    const workspace = get().workspaces.find(w => w.slug === slug)
    const currentState = get()

    if (currentState.currentWorkspace?.id === workspace?.id) {
      return
    }

    set({
      currentWorkspace: workspace || null,
      teams: workspace?.teams || [],
      members: []
    })
  }
}))
