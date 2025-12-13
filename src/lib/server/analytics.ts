import { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';
import { supabase } from '@/lib/supabase';

export type VisitorDevice = {
  device_type: string | null;
  os: string | null;
  browser: string | null;
};

export type VisitorLocation = {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || null;

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return null;
}

export function parseUserAgent(userAgent: string | null): VisitorDevice {
  if (!userAgent) {
    return {
      device_type: null,
      os: null,
      browser: null,
    };
  }

  const parser = new UAParser(userAgent);

  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  return {
    device_type: device.type || 'desktop',
    os: os.name ? [os.name, os.version].filter(Boolean).join(' ') : null,
    browser: browser.name
      ? [browser.name, browser.version].filter(Boolean).join(' ')
      : null,
  };
}

export async function lookupLocationByIp(ip: string | null): Promise<VisitorLocation> {
  if (!ip) {
    return {
      country: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    if (!res.ok) throw new Error('Gagal mengambil lokasi IP');
    const json = (await res.json()) as any;

    if (json?.success === false) {
      return {
        country: null,
        region: null,
        city: null,
        latitude: null,
        longitude: null,
      };
    }

    return {
      country: json?.country || null,
      region: json?.region || null,
      city: json?.city || null,
      latitude: typeof json?.latitude === 'number' ? json.latitude : null,
      longitude: typeof json?.longitude === 'number' ? json.longitude : null,
    };
  } catch {
    return {
      country: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }
}

export async function recordLinkClickViaRpc({
  linkId,
  action,
  platform,
  referrer,
  source,
  device,
  location,
}: {
  linkId: string;
  action: string;
  platform?: string | null;
  referrer?: string | null;
  source?: string | null;
  device: VisitorDevice;
  location: VisitorLocation;
}) {
  const payload = {
    p_link_id: linkId,
    p_action: action,
    p_platform: platform ?? null,
    p_referrer: referrer ?? null,
    p_source: source ?? null,
    p_device_type: device.device_type,
    p_os: device.os,
    p_browser: device.browser,
    p_country: location.country,
    p_region: location.region,
    p_city: location.city,
    p_latitude: location.latitude,
    p_longitude: location.longitude,
  };

  const { error } = await supabase.rpc('record_link_click', payload as any);

  if (!error) return;

  const { data: linkRow } = await supabase
    .from('links')
    .select('user_id')
    .eq('id', linkId)
    .maybeSingle();

  if (!linkRow?.user_id) return;

  await supabase.from('link_clicks').insert([
    {
      link_id: linkId,
      user_id: linkRow.user_id,
      action,
      platform: platform ?? null,
      referrer: referrer ?? null,
      source: source ?? null,
      device_type: device.device_type,
      os: device.os,
      browser: device.browser,
      country: location.country,
      region: location.region,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      created_at: new Date().toISOString(),
    },
  ] as any);
}

export async function submitProfileFormViaRpc({
  formId,
  data,
  referrer,
  source,
  device,
  location,
}: {
  formId: string;
  data: any;
  referrer?: string | null;
  source?: string | null;
  device: VisitorDevice;
  location: VisitorLocation;
}) {
  const payload = {
    p_form_id: formId,
    p_data: data,
    p_referrer: referrer ?? null,
    p_source: source ?? null,
    p_device_type: device.device_type,
    p_os: device.os,
    p_browser: device.browser,
    p_country: location.country,
    p_region: location.region,
    p_city: location.city,
  };

  const { error } = await supabase.rpc('submit_profile_form', payload as any);

  if (!error) return;

  const { data: formRow } = await supabase
    .from('profile_forms')
    .select('user_id, enabled')
    .eq('id', formId)
    .maybeSingle();

  if (!formRow?.user_id || !formRow.enabled) return;

  await supabase.from('form_submissions').insert([
    {
      form_id: formId,
      user_id: formRow.user_id,
      data,
      status: 'baru',
      referrer: referrer ?? null,
      source: source ?? null,
      device_type: device.device_type,
      os: device.os,
      browser: device.browser,
      country: location.country,
      region: location.region,
      city: location.city,
      created_at: new Date().toISOString(),
    },
  ] as any);
}
