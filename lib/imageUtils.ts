/**
 * Universal image and text formatting utilities for GNUTS
 * Usable across both Server Components and Client Components.
 */

export const resolveImgUrl = (img?: string): string => {
  if (!img || img.trim() === '') {
    return 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';
  }
  const clean = img.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  const stripped = clean.replace(/^\/+/, '');
  return `/${stripped}`;
};

export const formatDate = (val: any): string => {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {}
  return String(val);
};

export const stripHtml = (htmlStr: string = ''): string => {
  return htmlStr.replace(/<[^>]*>?/gm, '').trim();
};

export const resolveDocumentUrl = (docUrl?: string): string => {
  if (!docUrl || docUrl.trim() === '') return '#';
  const clean = docUrl.trim();

  // Handle Google Drive links
  if (clean.includes('drive.google.com/file/d/')) {
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/view?usp=sharing`;
    }
  }

  // Handle Cloudinary raw documents / direct HTTP URLs
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  const stripped = clean.replace(/^\/+/, '');
  return `/${stripped}`;
};

