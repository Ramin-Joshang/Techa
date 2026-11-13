import { ContentBlock } from '@techa/shared';

export interface LessonHeadingItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export function slugifyHeadingBase(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return cleaned || 'section';
}

/**
 * Generates deterministic, unique anchor IDs for all heading blocks in a lesson.
 */
export function extractLessonHeadings(blocks: ContentBlock[] | undefined): LessonHeadingItem[] {
  if (!blocks || !Array.isArray(blocks)) return [];

  const counts = new Map<string, number>();
  const items: LessonHeadingItem[] = [];

  for (const block of blocks) {
    if (block.type === 'heading' && block.data?.text) {
      const base = slugifyHeadingBase(block.data.text);
      const count = (counts.get(base) || 0) + 1;
      counts.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      items.push({
        id,
        text: block.data.text,
        level: block.data.level,
      });
    }
  }

  return items;
}
