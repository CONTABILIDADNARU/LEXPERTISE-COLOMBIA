"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { track, type EventName, type EventParams } from "@/lib/analytics";

/** Dispara un evento de medición una vez al montar la página (p. ej. view_service). */
export function TrackView({ event, params }: { event: EventName; params: EventParams }) {
  const enviado = useRef(false);
  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    track(event, params);
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

type Embed = { src: string; titulo: string; vertical: boolean } | null;

function resolverEmbed(plataforma: string, url: string): Embed {
  try {
    const u = new URL(url);
    if (/youtube\.com|youtu\.be/.test(u.hostname)) {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v") || u.pathname.split("/").pop();
      if (!id || !/^[\w-]{6,}$/.test(id)) return null;
      return { src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, titulo: "Video de YouTube", vertical: u.pathname.includes("/shorts/") };
    }
    if (u.hostname.includes("instagram.com")) {
      const m = u.pathname.match(/\/(p|reel|tv)\/([\w-]+)/);
      if (!m) return null;
      return { src: `https://www.instagram.com/${m[1]}/${m[2]}/embed`, titulo: "Publicación de Instagram", vertical: true };
    }
    if (u.hostname.includes("tiktok.com")) {
      const m = u.pathname.match(/video\/(\d+)/);
      if (!m) return null;
      return { src: `https://www.tiktok.com/embed/v2/${m[1]}`, titulo: "Video de TikTok", vertical: true };
    }
  } catch {
    return null;
  }
  void plataforma;
  return null;
}

/**
 * Video incrustado con carga diferida: no se contacta a la plataforma hasta que la persona pulsa
 * reproducir (sin cookies de terceros antes de la interacción).
 */
export function VideoEmbed({ plataforma, url, titulo }: { plataforma: string; url: string; titulo: string }) {
  const [activo, setActivo] = useState(false);
  const embed = resolverEmbed(plataforma, url);
  if (!embed) return null;
  const ratio = embed.vertical ? "aspect-[9/16] max-w-sm" : "aspect-video";
  return (
    <figure className={`relative w-full overflow-hidden bg-ink ${ratio}`}>
      {activo ? (
        <iframe
          src={embed.src}
          title={`${embed.titulo}: ${titulo}`}
          className="absolute inset-0 size-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActivo(true)}
          className="bg-ledger absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-ivory"
        >
          <span className="inline-flex size-16 items-center justify-center rounded-full border border-brand text-brand">
            <Play aria-hidden className="ml-1 size-7" />
          </span>
          <span className="font-serif text-xl">{titulo}</span>
          <span className="text-xs text-ivory/60">Al reproducir se cargará contenido de {embed.titulo.split(" de ")[1]}.</span>
        </button>
      )}
    </figure>
  );
}
