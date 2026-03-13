export function normalizeImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  const url = rawUrl.trim();
  if (!url) return '';

  if (!url.includes('drive.google.com')) return url;

  const filePathMatch = url.match(/\/file\/d\/([^/]+)/);
  if (filePathMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${filePathMatch[1]}`;
  }

  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get('id');
    if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
  } catch {
    return url;
  }

  return url;
}
