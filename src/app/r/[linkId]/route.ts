import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  lookupLocationByIp,
  parseUserAgent,
  recordLinkClickViaRpc,
} from '@/lib/server/analytics';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  const linkId = params.linkId;

  const { data: link, error } = await supabase
    .from('links')
    .select('id, url, status, start_date, end_date')
    .eq('id', linkId)
    .maybeSingle();

  if (error || !link?.url) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (link.status !== 'aktif') {
    return NextResponse.json({ error: 'Tautan tidak aktif' }, { status: 404 });
  }

  const now = new Date();
  if (link.start_date && now < new Date(link.start_date)) {
    return NextResponse.json({ error: 'Tautan belum aktif' }, { status: 404 });
  }
  if (link.end_date && now > new Date(link.end_date)) {
    return NextResponse.json({ error: 'Tautan sudah berakhir' }, { status: 404 });
  }

  const source =
    request.nextUrl.searchParams.get('src') ||
    request.nextUrl.searchParams.get('utm_source');

  const referrer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');
  const ip = getClientIp(request);

  const device = parseUserAgent(userAgent);
  const location = await lookupLocationByIp(ip);

  await recordLinkClickViaRpc({
    linkId,
    action: 'buka',
    platform: null,
    referrer,
    source,
    device,
    location,
  });

  return NextResponse.redirect(link.url, { status: 302 });
}
