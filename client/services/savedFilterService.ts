import api from '@/lib/axios'
import { unwrap } from '@/lib/api'
import { SavedFilter, CreateFilterData } from '@/types/filter'

export const savedFilterService = {
  getSavedFilters: async (workspaceId: string): Promise<SavedFilter[]> => {
    const response = await api.get(`/api/workspaces/${workspaceId}/filters`)
    return unwrap<{ filters: SavedFilter[] }>(response).filters || []
  },

  createFilter: async (workspaceId: string, filterData: CreateFilterData): Promise<SavedFilter> => {
    const response = await api.post(`/api/workspaces/${workspaceId}/filters`, filterData)
    return unwrap<{ filter: SavedFilter }>(response).filter
  },

  deleteFilter: async (_workspaceId: string, filterId: string): Promise<void> => {
    await api.delete(`/api/filters/${filterId}`)
  },

  setDefaultFilter: async (_workspaceId: string, filterId: string): Promise<SavedFilter> => {
    const response = await api.put(`/api/filters/${filterId}`, { isDefault: true })
    return unwrap<{ filter: SavedFilter }>(response).filter
  },

  getDefaultFilter: async (workspaceId: string): Promise<SavedFilter | null> => {
    const response = await api.get(`/api/workspaces/${workspaceId}/filters/default`)
    return unwrap<{ filter: SavedFilter | null }>(response).filter
  },
}
