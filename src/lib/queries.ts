import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];
type Link = Database['public']['Tables']['links']['Row'];
type LinkClick = Database['public']['Tables']['link_clicks']['Row'];
type ProfileForm = Database['public']['Tables']['profile_forms']['Row'];
type FormSubmission = Database['public']['Tables']['form_submissions']['Row'];

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
    onSuccess: () => {
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

export const useLinkClicks = ({
  userId,
  from,
  to,
  linkId,
}: {
  userId: string | null;
  from?: string | null;
  to?: string | null;
  linkId?: string | null;
}) => {
  return useQuery({
    queryKey: ['link-clicks', userId, from, to, linkId],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('link_clicks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);
      if (linkId) query = query.eq('link_id', linkId);

      const { data } = await query;
      return (data as LinkClick[]) || [];
    },
    enabled: !!userId,
    refetchInterval: 10_000,
  });
};

export const useProfileForm = (userId: string | null) => {
  return useQuery({
    queryKey: ['profile-form', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data } = await supabase
        .from('profile_forms')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      return (data as ProfileForm) || null;
    },
    enabled: !!userId,
  });
};

export const usePublicProfileForm = (userId: string | null) => {
  return useQuery({
    queryKey: ['public-profile-form', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data } = await supabase
        .from('profile_forms')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true)
        .maybeSingle();

      return (data as ProfileForm) || null;
    },
    enabled: !!userId,
  });
};

export const useUpsertProfileForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: Partial<ProfileForm> & { user_id: string }) => {
      const { data, error } = await supabase
        .from('profile_forms')
        .upsert(
          {
            ...form,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as ProfileForm;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile-form', data.user_id] });
      queryClient.invalidateQueries({
        queryKey: ['public-profile-form', data.user_id],
      });
    },
  });
};

export const useFormSubmissions = ({
  userId,
  formId,
  from,
  to,
}: {
  userId: string | null;
  formId: string | null;
  from?: string | null;
  to?: string | null;
}) => {
  return useQuery({
    queryKey: ['form-submissions', userId, formId, from, to],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('form_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (formId) query = query.eq('form_id', formId);
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data } = await query;
      return (data as FormSubmission[]) || [];
    },
    enabled: !!userId,
    refetchInterval: 10_000,
  });
};

export const useUpdateSubmissionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      userId,
    }: {
      id: string;
      status: 'baru' | 'diproses' | 'selesai';
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from('form_submissions')
        .update({ status } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as FormSubmission;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['form-submissions', variables.userId],
      });
    },
  });
};
