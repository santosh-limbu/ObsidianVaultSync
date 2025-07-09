export function processWikilinks(content: string): string {
  // Convert [[wikilink]] to markdown links
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
    const [title, displayText] = linkText.split('|');
    const display = displayText || title;
    return `[${display}](wikilink:${title})`;
  });
}

export function extractWikilinks(content: string): string[] {
  const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  
  while ((match = wikilinkRegex.exec(content)) !== null) {
    const [, linkText] = match;
    const [title] = linkText.split('|');
    links.push(title);
  }
  
  return links;
}

export function sanitizeFilename(filename: string): string {
  // Remove invalid characters for file names
  return filename.replace(/[<>:"/\\|?*]/g, '').trim();
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function getCharacterCount(content: string): number {
  return content.length;
}

export function getLineCount(content: string): number {
  return content.split('\n').length;
}
