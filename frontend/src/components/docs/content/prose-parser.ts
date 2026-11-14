export type StructuredProseSegment =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] };

const INLINE_BULLET_REGEX = /[•●▪]/;
const LINE_BULLET_REGEX = /^\s*(?:[•●▪]|[-*](?=\s))\s+(.+)$/;
const LINE_ORDERED_REGEX = /^\s*([0-9۰-۹]{1,2})[.)\-–]\s+(.+)$/;

/**
 * Parses unstructured educational text (which may contain newline-separated lists,
 * inline bullet markers `• item 1 • item 2`, or inline numbered items `۱. ... ۲. ...`)
 * into clean paragraph and stacked list segments.
 */
export function parseStructuredProse(rawText: string): StructuredProseSegment[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText.split(/\r?\n/);
  const segments: StructuredProseSegment[] = [];
  let currentList: { ordered: boolean; items: string[] } | null = null;
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    const joined = currentParagraphLines.join('\n').trim();
    if (joined) {
      segments.push({ kind: 'paragraph', text: joined });
    }
    currentParagraphLines = [];
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      segments.push({
        kind: 'list',
        ordered: currentList.ordered,
        items: currentList.items,
      });
    }
    currentList = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // 1. Line starting with an explicit bullet (`• ...`, `- ...`, `* ...`)
    const lineBulletMatch = LINE_BULLET_REGEX.exec(line);
    if (lineBulletMatch) {
      const itemText = lineBulletMatch[1].trim();
      // Handle rare case where one line-bullet itself has additional inline bullets
      if (INLINE_BULLET_REGEX.test(itemText)) {
        const subParts = itemText
          .split(INLINE_BULLET_REGEX)
          .map((s) => s.trim())
          .filter(Boolean);
        flushParagraph();
        if (!currentList || currentList.ordered) {
          flushList();
          currentList = { ordered: false, items: [] };
        }
        currentList.items.push(...subParts);
      } else if (itemText) {
        flushParagraph();
        if (!currentList || currentList.ordered) {
          flushList();
          currentList = { ordered: false, items: [] };
        }
        currentList.items.push(itemText);
      }
      continue;
    }

    // 2. Line starting with an explicit ordered number (`۱. ...`, `1) ...`)
    const lineOrderedMatch = LINE_ORDERED_REGEX.exec(line);
    if (lineOrderedMatch) {
      const itemText = lineOrderedMatch[2].trim();
      if (itemText) {
        flushParagraph();
        if (!currentList || !currentList.ordered) {
          flushList();
          currentList = { ordered: true, items: [] };
        }
        currentList.items.push(itemText);
      }
      continue;
    }

    // 3. Inline bullet separators on a single line (`intro • item1 • item2 • item3`)
    if (INLINE_BULLET_REGEX.test(line)) {
      const rawParts = line.split(INLINE_BULLET_REGEX);
      const startsWithBullet = /^[•●▪]/.test(line);
      const intro = startsWithBullet ? '' : rawParts[0].trim();
      const bulletItems = (startsWithBullet ? rawParts : rawParts.slice(1))
        .map((p) => p.trim())
        .filter(Boolean);

      if (bulletItems.length >= 2 || (startsWithBullet && bulletItems.length >= 1)) {
        if (intro) {
          flushList();
          currentParagraphLines.push(intro);
          flushParagraph();
        } else {
          flushParagraph();
        }
        if (!currentList || currentList.ordered) {
          flushList();
          currentList = { ordered: false, items: [] };
        }
        currentList.items.push(...bulletItems);
        continue;
      }
    }

    // 4. Inline numbered sequences (`۱. گام اول ۲. گام دوم` or `1. Step 1 2. Step 2`)
    const inlineNumMatches = Array.from(
      line.matchAll(/(?:^|\s)([1-9۰-۹][0-9۰-۹]?)[.)]\s+/g)
    );
    if (inlineNumMatches.length >= 2) {
      const firstIdx = inlineNumMatches[0].index ?? 0;
      const intro = line.slice(0, firstIdx).trim();
      const items: string[] = [];

      for (let i = 0; i < inlineNumMatches.length; i++) {
        const match = inlineNumMatches[i];
        const startOfText = (match.index ?? 0) + match[0].length;
        const endOfText =
          i + 1 < inlineNumMatches.length ? (inlineNumMatches[i + 1].index ?? line.length) : line.length;
        const body = line.slice(startOfText, endOfText).trim();
        if (body) items.push(body);
      }

      if (items.length >= 2) {
        if (intro) {
          flushList();
          currentParagraphLines.push(intro);
          flushParagraph();
        } else {
          flushParagraph();
        }
        if (!currentList || !currentList.ordered) {
          flushList();
          currentList = { ordered: true, items: [] };
        }
        currentList.items.push(...items);
        continue;
      }
    }

    // 5. Regular prose line
    flushList();
    currentParagraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return segments;
}
