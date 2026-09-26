export function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.includes("/embed/")) return url;
      const videoId = u.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (u.pathname.includes("/shorts/")) {
        return `https://www.youtube.com/embed/${u.pathname.split("/shorts/")[1]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function getPdfEmbedUrl(url) {
  if (!url) return null;
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

export default function RulesEmbed({ videoUrl, pdfUrl }) {
  const embedVideo = getYoutubeEmbedUrl(videoUrl);
  const embedPdf = getPdfEmbedUrl(pdfUrl);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-[12.5px] text-muted mb-2">Rules video</div>
        {embedVideo ? (
          <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={embedVideo}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Rules video"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border border-dashed p-8 text-center text-muted text-sm">
            Rules video coming soon.
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12.5px] text-muted">Rules document</div>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-teal text-[12.5px] font-semibold">
              Open / Download ↓
            </a>
          )}
        </div>
        {embedPdf ? (
          <div className="rounded-xl overflow-hidden border border-border" style={{ height: 480 }}>
            <iframe src={embedPdf} className="w-full h-full" title="Rules PDF" />
          </div>
        ) : (
          <div className="rounded-xl border border-border border-dashed p-8 text-center text-muted text-sm">
            Rules document coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
