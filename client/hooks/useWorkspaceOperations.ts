'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { unwrap } from '@/lib/api';
import { Workspace } from '@/types/workspace';

export const useWorkspaceOperations = () => {
  const [loading, setLoading] = useState(false);

  const createWorkspace = async (formData: { name: string; slug: string }): Promise<Workspace> => {
    setLoading(true);
    try {
      const response = await api.post('/api/workspaces', formData);
      return unwrap<{ workspace: Workspace }>(response).workspace;
    } finally {
      setLoading(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    const response = await api.get(`/api/workspaces/check-slug/${slug}`);
    return unwrap<{ available: boolean; slug: string }>(response);
  };

  return {
    createWorkspace,
    checkSlugAvailability,
    loading,
  };
};
