import { ExternalLink, MapPin, BriefcaseBusiness } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type PreviewSocialLinks = {
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
};

export type PreviewTheme = {
  font_family?: string | null;
  background?: string | null;
  button_shape?: string | null;
  button_color?: string | null;
  button_radius?: number | null;
};

function computeRadius(theme: PreviewTheme) {
  if (typeof theme.button_radius === "number") return `${theme.button_radius}px`;
  switch (theme.button_shape) {
    case "pill":
      return "9999px";
    case "square":
      return "6px";
    case "rounded":
    default:
      return "12px";
  }
}

export function ProfilePreview({
  nama,
  bio,
  lokasi,
  pekerjaan,
  avatarUrl,
  social,
  customDomains,
  theme,
}: {
  nama?: string;
  bio?: string;
  lokasi?: string;
  pekerjaan?: string;
  avatarUrl?: string | null;
  social: PreviewSocialLinks;
  customDomains: string[];
  theme: PreviewTheme;
}) {
  const links = Object.entries(social)
    .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
    .map(([k, v]) => ({
      key: k,
      label:
        k === "website"
          ? "Website"
          : k === "twitter"
            ? "X/Twitter"
            : k === "linkedin"
              ? "LinkedIn"
              : k === "instagram"
                ? "Instagram"
                : k === "youtube"
                  ? "YouTube"
                  : k,
      href: (v as string).trim(),
    }));

  const background = theme.background?.trim() || "#ffffff";
  const fontFamily = theme.font_family?.trim() || "ui-sans-serif, system-ui";
  const buttonColor = theme.button_color?.trim() || "#111827";
  const radius = computeRadius(theme);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-sm",
        background.startsWith("#") ? "" : "bg-cover",
      )}
      style={{
        background: background,
        fontFamily,
      }}
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={nama ?? "Avatar"} /> : null}
            <AvatarFallback>
              {(nama ?? "U")
                .split(" ")
                .slice(0, 2)
                .map((s) => s.slice(0, 1).toUpperCase())
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-semibold">
              {nama?.trim() ? nama : "Nama Anda"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {bio?.trim() ? bio : "Bio singkat akan tampil di sini."}
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {lokasi?.trim() ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {lokasi}
                </span>
              ) : null}
              {pekerjaan?.trim() ? (
                <span className="inline-flex items-center gap-1">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  {pekerjaan}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {links.length === 0 ? (
            <div className="rounded-md border bg-background/60 p-3 text-sm text-muted-foreground">
              Tambahkan tautan sosial untuk melihat tombolnya di pratinjau.
            </div>
          ) : (
            links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium text-white"
                style={{
                  backgroundColor: buttonColor,
                  borderRadius: radius,
                }}
              >
                <span>{l.label}</span>
                <ExternalLink className="h-4 w-4 opacity-90" />
              </a>
            ))
          )}
        </div>

        {customDomains.length > 0 ? (
          <div className="text-xs text-muted-foreground">
            Domain kustom (contoh): <span className="font-medium">{customDomains[0]}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
