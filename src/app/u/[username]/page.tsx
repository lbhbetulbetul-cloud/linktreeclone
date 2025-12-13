'use client';

import { i18n } from '@/lib/i18n';
import {
  usePublicUserByUsername,
  usePublicUserLinks,
  usePublicUserGroups,
} from '@/lib/queries';
import { isLinkWithinSchedule, getScheduleWarning } from '@/lib/scheduling';
import { Database } from '@/types/database.types';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

type Link = Database['public']['Tables']['links']['Row'];
type Group = Database['public']['Tables']['groups']['Row'];

interface PageProps {
  params: {
    username: string;
  };
}

export default function PublicProfilePage({ params }: PageProps) {
  const { data: user, isPending: userLoading } = usePublicUserByUsername(
    params.username
  );
  const { data: links = [] } = usePublicUserLinks(user?.id || null);
  const { data: groups = [] } = usePublicUserGroups(user?.id || null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{i18n.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{i18n.userNotFound}</h1>
          <p className="text-gray-500 mt-2">@{params.username}</p>
        </div>
      </div>
    );
  }

  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const groupedLinks = new Map<string | null, Link[]>();

  links.forEach((link) => {
    const groupId = link.group_id;
    if (!groupedLinks.has(groupId)) {
      groupedLinks.set(groupId, []);
    }
    groupedLinks.get(groupId)!.push(link);
  });

  const sortedGroupIds = Array.from(groupedLinks.keys()).sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    const groupA = groupMap.get(a);
    const groupB = groupMap.get(b);
    return (groupA?.order || 0) - (groupB?.order || 0);
  });

  const handleCopyLink = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleSocialShare = (link: Link, platform: string) => {
    const baseUrl = `${window.location.origin}/u/${user.username}`;
    const text = `${link.title} - ${link.deskripsi || link.url}`;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(baseUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + baseUrl)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div
      className="min-h-screen transition-colors"
      style={{
        backgroundColor: user.theme === 'dark' ? '#0f172a' : '#ffffff',
        color: user.theme === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-8 dark:border-gray-800 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.display_name || user.username}
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
            />
          )}
          <h1 className="text-3xl font-bold">
            {user.display_name || user.username}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">@{user.username}</p>
          {user.bio && (
            <p className="text-gray-600 dark:text-gray-300 mt-4">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {sortedGroupIds.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>{i18n.noLinks}</p>
            </div>
          ) : (
            sortedGroupIds.map((groupId) => {
              const groupLinks = groupedLinks.get(groupId) || [];
              const group = groupId ? groupMap.get(groupId) : null;

              return (
                <div key={groupId || 'ungrouped'}>
                  {group && (
                    <h2
                      className="mb-4 flex items-center gap-2 text-xl font-semibold"
                    >
                      <span className="text-2xl">{group.icon}</span>
                      {group.name}
                    </h2>
                  )}

                  <div className="space-y-3">
                    {groupLinks.map((link) => {
                      const isActive = isLinkWithinSchedule(link);
                      const warning = getScheduleWarning(link);

                      return (
                        <div
                          key={link.id}
                          className={`rounded-lg border transition-all ${
                            !isActive
                              ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {warning && (
                            <div className="border-b border-yellow-200 bg-yellow-100 px-4 py-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                              ⚠️ {warning}
                            </div>
                          )}

                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block p-4 hover:no-underline ${
                              !isActive ? 'pointer-events-none opacity-50' : ''
                            }`}
                          >
                            <div
                              className={`rounded-lg p-4 transition-all`}
                              style={{
                                backgroundColor:
                                  link.gaya_tombol === 'solid'
                                    ? link.warna_tombol
                                    : 'transparent',
                                border:
                                  link.gaya_tombol === 'outline'
                                    ? `2px solid ${link.warna_tombol}`
                                    : 'none',
                                color:
                                  link.gaya_tombol === 'solid'
                                    ? '#ffffff'
                                    : link.warna_tombol,
                              }}
                              className="hover:shadow-lg"
                            >
                              <div className="flex items-center gap-3">
                                {link.icon && (
                                  <span className="text-2xl flex-shrink-0">
                                    {link.icon}
                                  </span>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">
                                    {link.preview_title || link.title}
                                  </h3>
                                  {(link.preview_description ||
                                    link.deskripsi) && (
                                    <p className="text-sm opacity-90 truncate">
                                      {link.preview_description ||
                                        link.deskripsi}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </a>

                          {/* Link Actions */}
                          <div className="border-t border-gray-200 flex gap-2 px-4 py-3 dark:border-gray-700">
                            <button
                              onClick={() => handleCopyLink(link.url, link.id)}
                              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                              title={i18n.copyLink}
                            >
                              {copiedLinkId === link.id ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  {i18n.copiedToClipboard}
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  {i18n.copyLink}
                                </>
                              )}
                            </button>

                            {(link.share_twitter ||
                              link.share_facebook ||
                              link.share_linkedin ||
                              link.share_whatsapp) && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex gap-2">
                                  {link.share_twitter && (
                                    <button
                                      onClick={() =>
                                        handleSocialShare(link, 'twitter')
                                      }
                                      className="text-gray-600 hover:text-blue-400 dark:text-gray-400"
                                      title="Share on Twitter"
                                    >
                                      𝕏
                                    </button>
                                  )}
                                  {link.share_facebook && (
                                    <button
                                      onClick={() =>
                                        handleSocialShare(link, 'facebook')
                                      }
                                      className="text-gray-600 hover:text-blue-600 dark:text-gray-400"
                                      title="Share on Facebook"
                                    >
                                      f
                                    </button>
                                  )}
                                  {link.share_linkedin && (
                                    <button
                                      onClick={() =>
                                        handleSocialShare(link, 'linkedin')
                                      }
                                      className="text-gray-600 hover:text-blue-700 dark:text-gray-400"
                                      title="Share on LinkedIn"
                                    >
                                      in
                                    </button>
                                  )}
                                  {link.share_whatsapp && (
                                    <button
                                      onClick={() =>
                                        handleSocialShare(link, 'whatsapp')
                                      }
                                      className="text-gray-600 hover:text-green-500 dark:text-gray-400"
                                      title="Share on WhatsApp"
                                    >
                                      💬
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
