import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIp,
  lookupLocationByIp,
  parseUserAgent,
  submitProfileFormViaRpc,
} from '@/lib/server/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | {
          formId?: string;
          data?: any;
          source?: string | null;
          referrer?: string | null;
        }
      | null;

    const formId = body?.formId;
    const data = body?.data;

    if (!formId || !data) {
      return NextResponse.json(
        { error: 'formId dan data diperlukan' },
        { status: 400 }
      );
    }

    const source = body?.source ?? null;
    const referrer = body?.referrer ?? request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');
    const ip = getClientIp(request);

    const device = parseUserAgent(userAgent);
    const location = await lookupLocationByIp(ip);

    await submitProfileFormViaRpc({
      formId,
      data,
      source,
      referrer,
      device,
      location,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
