import api from '@/lib/axios'
import { unwrap } from '@/lib/api'
import { Issue, CreateIssueData, UpdateIssueData } from '@/types/issue'

export const issueService = {
  getIssuesByWorkspace: async (workspaceId: string): Promise<Issue[]> => {
    const response = await api.get(`/api/workspaces/${workspaceId}/issues`)
    return unwrap<{ issues: Issue[] }>(response).issues
  },

  getIssueById: async (issueId: string): Promise<Issue> => {
    const response = await api.get(`/api/issues/${issueId}`)
    return unwrap<{ issue: Issue }>(response).issue
  },

  getIssuesByTeam: async (teamId: string): Promise<Issue[]> => {
    const response = await api.get(`/api/teams/${teamId}/issues`)
    return unwrap<{ issues: Issue[] }>(response).issues
  },

  createIssue: async (issueData: CreateIssueData): Promise<Issue> => {
    const response = await api.post(`/api/teams/${issueData.teamId}/issues`, issueData)
    return unwrap<{ issue: Issue }>(response).issue
  },

  updateIssue: async (issueId: string, issueData: UpdateIssueData): Promise<Issue> => {
    const filteredData = Object.fromEntries(
      Object.entries(issueData).filter(([, value]) => value != null && value !== '')
    )
    const response = await api.put(`/api/issues/${issueId}`, filteredData)
    return unwrap<{ issue: Issue }>(response).issue
  },

  deleteIssue: async (issueId: string): Promise<void> => {
    await api.delete(`/api/issues/${issueId}`)
  },

  assignIssue: async (issueId: string, assigneeId: string | null): Promise<Issue> => {
    const response = await api.put(`/api/issues/${issueId}`, { assigneeId })
    return unwrap<{ issue: Issue }>(response).issue
  },

  updateNotes: async (issueId: string, notes: string): Promise<Issue> => {
    const response = await api.put(`/api/issues/${issueId}`, { notes })
    return unwrap<{ issue: Issue }>(response).issue
  },

  getComments: async (issueId: string): Promise<Comment[]> => {
    const response = await api.get(`/api/issues/${issueId}/comments`)
    return unwrap<{ comments: Comment[] }>(response).comments || []
  },

  createComment: async (issueId: string, content: string): Promise<Comment> => {
    const response = await api.post(`/api/issues/${issueId}/comments`, { content })
    return unwrap<{ comment: Comment }>(response).comment
  },

  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    const response = await api.put(`/api/comments/${commentId}`, { content })
    return unwrap<{ comment: Comment }>(response).comment
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/api/comments/${commentId}`)
  }
}
