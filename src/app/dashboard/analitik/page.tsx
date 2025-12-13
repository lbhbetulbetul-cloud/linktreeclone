'use client';

import { useMemo, useState } from 'react';
import { i18n } from '@/lib/i18n';
import { useAuthenticatedUser, useLinkClicks, useUserGroups, useUserLinks } from '@/lib/queries';
import { Database } from '@/types/database.types';

type LinkClick = Database['public']['Tables']['link_clicks']['Row'];

function formatDateInput(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDayIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000`).toISOString();
}

function endOfDayIso(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999`).toISOString();
}

function groupCount<T extends string | null>(items: T[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item || i18n.unknown;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function SimpleLineChart({ data }: { data: { label: string; value: number }[] }) {
  const width = 640;
  const height = 160;
  const padding = 18;

  const max = Math.max(1, ...data.map((d) => d.value));

  const points = data
    .map((d, i) => {
      const x =
        padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
      const y =
        height - padding - (d.value * (height - padding * 2)) / max;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full min-w-[480px]"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={points}
        />
        {data.map((d, i) => {
          const x =
            padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
          const y =
            height - padding - (d.value * (height - padding * 2)) / max;
          return (
            <g key={d.label}>
              <circle cx={x} cy={y} r={4} fill="#3b82f6" />
              {i === 0 || i === data.length - 1 ? (
                <text
                  x={x}
                  y={height - 4}
                  textAnchor={i === 0 ? 'start' : 'end'}
                  fontSize={10}
                  fill="#6b7280"
                >
                  {d.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SimplePie({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{i18n.noData}</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const colors = [
    '#3b82f6',
    '#8b5cf6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#ec4899',
  ];

  let acc = 0;
  const gradientParts = data.slice(0, 6).map((d, idx) => {
    const start = (acc / total) * 100;
    acc += d.value;
    const end = (acc / total) * 100;
    return `${colors[idx % colors.length]} ${start}% ${end}%`;
  });

  const background = `conic-gradient(${gradientParts.join(',')})`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="font-semibold">{title}</h3>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="h-32 w-32 rounded-full"
          style={{ background }}
          aria-label={title}
        />

        <ul className="flex-1 space-y-1 text-sm">
          {data.slice(0, 6).map((d, idx) => (
            <li key={d.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: colors[idx % colors.length] }}
                />
                {d.label}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {Math.round((d.value / total) * 100)}% ({d.value})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: user, isPending } = useAuthenticatedUser();
  const { data: groups = [] } = useUserGroups(user?.id || null);
  const { data: links = [] } = useUserLinks(user?.id || null);

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [fromDate, setFromDate] = useState(formatDateInput(sevenDaysAgo));
  const [toDate, setToDate] = useState(formatDateInput(today));
  const [groupId, setGroupId] = useState<string>('');
  const [linkId, setLinkId] = useState<string>('');

  const fromIso = useMemo(() => startOfDayIso(fromDate), [fromDate]);
  const toIso = useMemo(() => endOfDayIso(toDate), [toDate]);

  const { data: clicks = [], isPending: clicksLoading } = useLinkClicks({
    userId: user?.id || null,
    from: fromIso,
    to: toIso,
    linkId: linkId || null,
  });

  const groupMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);
  const linkMap = useMemo(() => new Map(links.map((l) => [l.id, l])), [links]);

  const filteredClicks = useMemo(() => {
    if (!groupId) return clicks;

    return clicks.filter((c) => {
      const link = linkMap.get(c.link_id);
      return link?.group_id === groupId;
    });
  }, [clicks, groupId, linkMap]);

  const linksInSelectedGroup = useMemo(() => {
    if (!groupId) return links;
    return links.filter((l) => l.group_id === groupId);
  }, [links, groupId]);

  const summary = useMemo(() => {
    const totalClicks = filteredClicks.length;
    const byLink = new Map<string, number>();

    for (const c of filteredClicks) {
      byLink.set(c.link_id, (byLink.get(c.link_id) || 0) + 1);
    }

    const linkStats = Array.from(byLink.entries())
      .map(([id, count]) => {
        const link = linkMap.get(id);
        const group = link?.group_id ? groupMap.get(link.group_id) : null;
        const ctr = totalClicks ? (count / totalClicks) * 100 : 0;

        return {
          id,
          title: link?.title || i18n.unknown,
          group: group?.name || i18n.noGroup,
          groupId: link?.group_id || null,
          clicks: count,
          ctr,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);

    const groupStats = new Map<string, number>();
    for (const stat of linkStats) {
      const key = stat.groupId || 'tanpa-grup';
      groupStats.set(key, (groupStats.get(key) || 0) + stat.clicks);
    }

    const bestGroupEntry = Array.from(groupStats.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const bestGroupName = bestGroupEntry
      ? bestGroupEntry[0] === 'tanpa-grup'
        ? i18n.noGroup
        : groupMap.get(bestGroupEntry[0])?.name || i18n.noGroup
      : '-';

    const avgCtr = linkStats.length
      ? linkStats.reduce((sum, s) => sum + s.ctr, 0) / linkStats.length
      : 0;

    return {
      totalClicks,
      uniqueLinks: linkStats.length,
      avgCtr,
      bestGroupName,
      linkStats,
    };
  }, [filteredClicks, groupMap, linkMap]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();

    const start = new Date(fromDate);
    const end = new Date(toDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      map.set(formatDateInput(d), 0);
    }

    for (const c of filteredClicks) {
      const key = formatDateInput(new Date(c.created_at));
      map.set(key, (map.get(key) || 0) + 1);
    }

    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredClicks, fromDate, toDate]);

  const deviceBreakdown = useMemo(
    () => groupCount(filteredClicks.map((c) => c.device_type)),
    [filteredClicks]
  );
  const osBreakdown = useMemo(
    () => groupCount(filteredClicks.map((c) => c.os)),
    [filteredClicks]
  );
  const browserBreakdown = useMemo(
    () => groupCount(filteredClicks.map((c) => c.browser)),
    [filteredClicks]
  );
  const geoBreakdown = useMemo(
    () => groupCount(filteredClicks.map((c) => c.country)),
    [filteredClicks]
  );

  const loading = isPending || clicksLoading;

  if (loading && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <p>{i18n.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <p>{i18n.mustLogin}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{i18n.analytics}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {i18n.analyticsHint}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{i18n.from}</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{i18n.to}</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{i18n.filterGroup}</label>
          <select
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
              setLinkId('');
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          >
            <option value="">{i18n.allGroups}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{i18n.filterLink}</label>
          <select
            value={linkId}
            onChange={(e) => setLinkId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          >
            <option value="">{i18n.allLinks}</option>
            {linksInSelectedGroup.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title={i18n.totalClicks} value={String(summary.totalClicks)} />
        <KpiCard title={i18n.clickedLinks} value={String(summary.uniqueLinks)} />
        <KpiCard
          title={i18n.avgCtr}
          value={`${summary.avgCtr.toFixed(1)}%`}
          hint={i18n.avgCtrHint}
        />
        <KpiCard title={i18n.bestGroup} value={summary.bestGroupName} />
      </div>

      {/* Trend */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{i18n.clickTrend}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {i18n.autoRefresh}
          </p>
        </div>

        {trend.length === 0 ? (
          <p className="text-sm text-gray-500">{i18n.noData}</p>
        ) : (
          <SimpleLineChart data={trend} />
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SimplePie title={i18n.deviceChart} data={deviceBreakdown} />
        <SimplePie title={i18n.osChart} data={osBreakdown} />
        <SimplePie title={i18n.browserChart} data={browserBreakdown} />
      </div>

      {/* Top Links + Geo */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">{i18n.topLinks}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">{i18n.link}</th>
                  <th className="py-2 pr-4">{i18n.group}</th>
                  <th className="py-2 pr-4">{i18n.clicks}</th>
                  <th className="py-2">{i18n.ctr}</th>
                </tr>
              </thead>
              <tbody>
                {summary.linkStats.slice(0, 10).map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium">{row.title}</td>
                    <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">
                      {row.group}
                    </td>
                    <td className="py-2 pr-4">{row.clicks}</td>
                    <td className="py-2">{row.ctr.toFixed(1)}%</td>
                  </tr>
                ))}

                {summary.linkStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      {i18n.noData}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">{i18n.geoAudience}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {i18n.geoHint}
          </p>

          <div className="mt-4 space-y-2">
            {geoBreakdown.slice(0, 12).map((row) => {
              const max = geoBreakdown[0]?.value || 1;
              const width = Math.round((row.value / max) * 100);
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-gray-500 dark:text-gray-400">{row.value}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-2 rounded bg-blue-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {geoBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500">{i18n.noData}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Raw clicks */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">{i18n.recentClicks}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {i18n.recentClicksHint}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                <th className="py-2 pr-4">{i18n.time}</th>
                <th className="py-2 pr-4">{i18n.link}</th>
                <th className="py-2 pr-4">{i18n.device}</th>
                <th className="py-2 pr-4">{i18n.os}</th>
                <th className="py-2 pr-4">{i18n.browser}</th>
                <th className="py-2">{i18n.location}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClicks.slice(0, 25).map((c: LinkClick) => {
                const link = linkMap.get(c.link_id);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-2 pr-4">
                      {new Date(c.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 pr-4 font-medium">{link?.title || i18n.unknown}</td>
                    <td className="py-2 pr-4">{c.device_type || i18n.unknown}</td>
                    <td className="py-2 pr-4">{c.os || i18n.unknown}</td>
                    <td className="py-2 pr-4">{c.browser || i18n.unknown}</td>
                    <td className="py-2">
                      {[c.city, c.country].filter(Boolean).join(', ') || i18n.unknown}
                    </td>
                  </tr>
                );
              })}

              {filteredClicks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    {i18n.noData}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
