import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  lookupLocationByIp,
  parseUserAgent,
  recordLinkClickViaRpc,
} from '@/lib/server/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | {
          linkId?: string;
          action?: string;
          platform?: string | null;
          source?: string | null;
          referrer?: string | null;
        }
      | null;

    const linkId = body?.linkId;
    if (!linkId) return NextResponse.json({ error: 'linkId diperlukan' }, { status: 400 });

    const action = body?.action || 'interaksi';
    const platform = body?.platform ?? null;
    const source = body?.source ?? null;

    const referrer = body?.referrer ?? request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');
    const ip = getClientIp(request);

    const device = parseUserAgent(userAgent);
    const location = await lookupLocationByIp(ip);

    await recordLinkClickViaRpc({
      linkId,
      action,
      platform,
      referrer,
      source,
      device,
      location,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
