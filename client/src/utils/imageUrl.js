function extractDriveFileId(input) {
  if (!input) return '';

  // Support users pasting a raw Drive file ID directly.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(input)) return input;

  const filePathMatch = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (filePathMatch?.[1]) return filePathMatch[1];

  const genericPathMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (genericPathMatch?.[1]) return genericPathMatch[1];

  try {
    const parsed = new URL(input);
    const id = parsed.searchParams.get('id');
    if (id) return id;
  } catch {
    return '';
  }

  return '';
}

export function normalizeImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  const url = rawUrl.trim();
  if (!url) return '';

  const isDriveUrl =
    url.includes('drive.google.com') ||
    url.includes('docs.google.com') ||
    url.includes('googleusercontent.com');

  if (!isDriveUrl) return url;

  const fileId = extractDriveFileId(url);
  if (!fileId) return url;

  // Thumbnail endpoint is generally more reliable for direct image rendering in <img> and CSS backgrounds.
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
}
