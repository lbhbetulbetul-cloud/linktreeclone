import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];
type Link = Database['public']['Tables']['links']['Row'];

export const useAuthenticatedUser = () => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return data as User | null;
    },
  });
};

export const useUserGroups = (userId: string | null) => {
  return useQuery({
    queryKey: ['groups', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      return (data as Group[]) || [];
    },
    enabled: !!userId,
  });
};

export const useUserLinks = (userId: string | null) => {
  return useQuery({
    queryKey: ['links', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      return (data as Link[]) || [];
    },
    enabled: !!userId,
  });
};

export const usePublicUserByUsername = (username: string) => {
  return useQuery({
    queryKey: ['public-user', username],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      return data as User | null;
    },
  });
};

export const usePublicUserLinks = (userId: string | null) => {
  return useQuery({
    queryKey: ['public-links', userId],
    queryFn: async () => {
      if (!userId) return [];

      const now = new Date().toISOString();

      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'aktif')
        .or(
          `and(start_date.is.null,end_date.is.null),and(start_date.lte.${now},end_date.is.null),and(start_date.is.null,end_date.gte.${now}),and(start_date.lte.${now},end_date.gte.${now})`
        )
        .order('order', { ascending: true });

      return (data as Link[]) || [];
    },
    enabled: !!userId,
  });
};

export const usePublicUserGroups = (userId: string | null) => {
  return useQuery({
    queryKey: ['public-groups', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      return (data as Group[]) || [];
    },
    enabled: !!userId,
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: Omit<Link, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('links')
        .insert([link])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['links', variables.user_id] });
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Link> & { id: string }) => {
      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['links', data.user_id] });
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from('links').delete().eq('id', linkId);

      if (error) throw error;
    },
    onSuccess: (_, linkId) => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
};

export const useReorderLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      linkIds,
    }: {
      userId: string;
      linkIds: string[];
    }) => {
      const { data, error } = await supabase.rpc('reorder_links', {
        p_user_id: userId,
        p_link_ids: linkIds,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['links', variables.userId] });
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('groups')
        .insert([group])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.user_id] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Group> & { id: string }) => {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups', data.user_id] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from('groups').delete().eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useReorderGroups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      groupIds,
    }: {
      userId: string;
      groupIds: string[];
    }) => {
      const { data, error } = await supabase.rpc('reorder_groups', {
        p_user_id: userId,
        p_group_ids: groupIds,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.userId] });
    },
  });
};
