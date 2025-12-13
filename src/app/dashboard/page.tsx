'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { i18n } from '@/lib/i18n';
import { Modal } from '@/components/Modal';
import { QrCodeCard } from '@/components/QrCodeCard';
import { LinkForm } from '@/components/LinkForm';
import { LinkItem } from '@/components/LinkItem';
import { GroupForm } from '@/components/GroupForm';
import { ImportExportPanel } from '@/components/ImportExportPanel';
import { DraggableList } from '@/components/DraggableList';
import { Database } from '@/types/database.types';
import {
  useAuthenticatedUser,
  useUserGroups,
  useUserLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  useReorderLinks,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '@/lib/queries';
import { LinkFormData, GroupFormData } from '@/lib/validation';
import { Plus, Settings, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type Link = Database['public']['Tables']['links']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

export default function DashboardPage() {
  const { data: user, isPending: userLoading } = useAuthenticatedUser();
  const { data: groups = [] } = useUserGroups(user?.id || null);
  const { data: links = [] } = useUserLinks(user?.id || null);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const createLinkMutation = useCreateLink();
  const updateLinkMutation = useUpdateLink();
  const deleteLinkMutation = useDeleteLink();
  const reorderLinksMutation = useReorderLinks();

  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const queryClient = useQueryClient();

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{i18n.loading}</p>
      </div>
    );
  }

  const filteredLinks = selectedGroup
    ? links.filter((link) => link.group_id === selectedGroup)
    : links;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicProfileUrl = `${origin}/u/${user.username}`;
  const publicProfileQrUrl = `${publicProfileUrl}?utm_source=qr&utm_medium=profil`;

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 2000);
  };

  const handleCreateLink = useCallback(
    async (data: LinkFormData) => {
      if (!user) return;

      await createLinkMutation.mutateAsync({
        ...data,
        id: uuidv4(),
        user_id: user.id,
        group_id: data.group_id || null,
        order: links.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      setLinkModalOpen(false);
      setEditingLink(null);
    },
    [user, createLinkMutation, links.length]
  );

  const handleUpdateLink = useCallback(
    async (data: LinkFormData) => {
      if (!editingLink) return;

      await updateLinkMutation.mutateAsync({
        ...data,
        id: editingLink.id,
        user_id: editingLink.user_id,
        order: editingLink.order,
        created_at: editingLink.created_at,
        updated_at: new Date().toISOString(),
        group_id: data.group_id || null,
      } as any);

      setLinkModalOpen(false);
      setEditingLink(null);
    },
    [editingLink, updateLinkMutation]
  );

  const handleDeleteLink = useCallback(
    async (linkId: string) => {
      await deleteLinkMutation.mutateAsync(linkId);
    },
    [deleteLinkMutation]
  );

  const handleReorderLinks = useCallback(
    async (reorderedLinks: Link[]) => {
      if (!user) return;

      const linkIds = reorderedLinks.map((l) => l.id);
      await reorderLinksMutation.mutateAsync({
        userId: user.id,
        linkIds,
      });
    },
    [user, reorderLinksMutation]
  );

  const handleCreateGroup = useCallback(
    async (data: GroupFormData) => {
      if (!user) return;

      await createGroupMutation.mutateAsync({
        ...data,
        id: uuidv4(),
        user_id: user.id,
        order: groups.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      setGroupModalOpen(false);
      setEditingGroup(null);
    },
    [user, createGroupMutation, groups.length]
  );

  const handleUpdateGroup = useCallback(
    async (data: GroupFormData) => {
      if (!editingGroup) return;

      await updateGroupMutation.mutateAsync({
        ...data,
        id: editingGroup.id,
        user_id: editingGroup.user_id,
        order: editingGroup.order,
        created_at: editingGroup.created_at,
        updated_at: new Date().toISOString(),
      } as any);

      setGroupModalOpen(false);
      setEditingGroup(null);
    },
    [editingGroup, updateGroupMutation]
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      await deleteGroupMutation.mutateAsync(groupId);
      setSelectedGroup(null);
    },
    [deleteGroupMutation]
  );

  const handleImport = useCallback(
    async (data: any[]) => {
      if (!user) return;

      for (const item of data) {
        const groupId = item.groupName
          ? groups.find((g) => g.name === item.groupName)?.id
          : null;

        await supabase.from('links').insert({
          id: uuidv4(),
          user_id: user.id,
          title: item.title,
          url: item.url,
          deskripsi: item.deskripsi || null,
          icon: item.icon || null,
          warna_tombol: item.warna_tombol || '#3b82f6',
          gaya_tombol: item.gaya_tombol || 'solid',
          status: item.status || 'aktif',
          group_id: groupId || null,
          order: links.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      queryClient.invalidateQueries({ queryKey: ['links', user.id] });
    },
    [user, groups, links.length, queryClient]
  );

  const groupMap = new Map(groups.map((g) => [g.id, g]));

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">{i18n.dashboard}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingLink(null);
                setLinkModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              {i18n.addLink}
            </button>
            <button
              onClick={() => setShowGroupPanel(!showGroupPanel)}
              className="flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2 font-medium text-white hover:bg-purple-600"
            >
              <Settings className="h-4 w-4" />
              {i18n.manageGroups}
            </button>
          </div>
        </div>

        {/* QR Profil */}
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">{i18n.publicProfile}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {i18n.publicProfileHint}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={publicProfileUrl}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
              />
              <button
                type="button"
                onClick={handleCopyProfile}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                {copiedProfile ? (
                  <>
                    <Check className="h-4 w-4" />
                    {i18n.copiedToClipboard}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {i18n.copyProfileLink}
                  </>
                )}
              </button>
            </div>
          </div>

          <QrCodeCard
            title={i18n.qrProfile}
            description={i18n.qrProfileHint}
            value={publicProfileQrUrl}
            filename={`qr-profil-${user.username}`}
          />
        </div>

        {/* Import/Export */}
        <div className="mb-8">
          <ImportExportPanel
            links={links}
            groups={groups}
            onImport={handleImport}
          />
        </div>

        {/* Group Management Panel */}
        {showGroupPanel && (
          <div className="mb-8 space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{i18n.manageGroups}</h2>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setGroupModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                {i18n.addGroup}
              </button>
            </div>

            <div className="grid gap-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    selectedGroup === group.id
                      ? 'bg-blue-50 border-l-4 dark:bg-blue-950'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <button
                    onClick={() =>
                      setSelectedGroup(
                        selectedGroup === group.id ? null : group.id
                      )
                    }
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{group.icon}</span>
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-gray-500">
                          {links.filter((l) => l.group_id === group.id).length}{' '}
                          {i18n.links}
                        </p>
                      </div>
                    </div>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGroup(group);
                        setGroupModalOpen(true);
                      }}
                      className="rounded px-2 py-1 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {i18n.edit}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(i18n.confirmDelete)) {
                          handleDeleteGroup(group.id);
                        }
                      }}
                      className="rounded px-2 py-1 text-sm font-medium text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      {i18n.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {selectedGroup
                ? groupMap.get(selectedGroup)?.name || i18n.links
                : i18n.links}
            </h2>
            {selectedGroup && (
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {i18n.cancel}
              </button>
            )}
          </div>

          {filteredLinks.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
              <p className="text-gray-500">{i18n.noLinks}</p>
            </div>
          ) : (
            <DraggableList<Link>
              items={filteredLinks}
              onReorder={handleReorderLinks}
              renderItem={(link, isDragging) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  group={groupMap.get(link.group_id || '')}
                  onEdit={(link) => {
                    setEditingLink(link);
                    setLinkModalOpen(true);
                  }}
                  onDelete={handleDeleteLink}
                  isDragging={isDragging}
                />
              )}
            />
          )}
        </div>
      </div>

      {/* Link Modal */}
      <Modal
        isOpen={linkModalOpen}
        title={editingLink ? i18n.editLink : i18n.addLink}
        onClose={() => {
          setLinkModalOpen(false);
          setEditingLink(null);
        }}
        size="lg"
      >
        <LinkForm
          onSubmit={editingLink ? handleUpdateLink : handleCreateLink}
          initialData={editingLink}
          groups={groups}
          isLoading={
            createLinkMutation.isPending || updateLinkMutation.isPending
          }
        />
      </Modal>

      {/* Group Modal */}
      <Modal
        isOpen={groupModalOpen}
        title={editingGroup ? i18n.groups : i18n.addGroup}
        onClose={() => {
          setGroupModalOpen(false);
          setEditingGroup(null);
        }}
        size="md"
      >
        <GroupForm
          onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
          initialData={editingGroup}
          isLoading={
            createGroupMutation.isPending || updateGroupMutation.isPending
          }
        />
      </Modal>
    </div>
  );
}
