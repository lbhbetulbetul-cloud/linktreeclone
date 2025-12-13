export function recordLinkInteraction({
  linkId,
  action,
  platform,
  source,
  referrer,
}: {
  linkId: string;
  action: string;
  platform?: string | null;
  source?: string | null;
  referrer?: string | null;
}) {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({
    linkId,
    action,
    platform: platform ?? null,
    source: source ?? null,
    referrer: referrer ?? document.referrer ?? null,
  });

  const url = '/api/analytics/record-link-click';

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    return;
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
