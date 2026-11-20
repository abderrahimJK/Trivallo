/**
 * Each launch city is a "chapter" of the home page story (design-system/trivallo/MASTER.md,
 * "Project Decisions"). The chapter color tints that city's hero, placeholders and labels.
 * Class names are written out in full so Tailwind can find them.
 */
export interface CityChapter {
  number: string;
  /** Solid chapter color, white text passes 4.5:1 on it. */
  surface: string;
  /** Chapter color as text on white or the page background. */
  text: string;
  /** Gradient used for image placeholders and heroes. */
  gradient: string;
}

const CHAPTERS: Record<string, CityChapter> = {
  marrakech: {
    number: '01',
    surface: 'bg-marrakech',
    text: 'text-marrakech',
    gradient: 'from-marrakech via-[#9f1239] to-[#4c0519]',
  },
  ouarzazate: {
    number: '02',
    surface: 'bg-ouarzazate',
    text: 'text-ouarzazate',
    gradient: 'from-ouarzazate via-[#92400e] to-[#451a03]',
  },
  merzouga: {
    number: '03',
    surface: 'bg-merzouga',
    text: 'text-merzouga',
    gradient: 'from-merzouga via-[#9a3412] to-[#431407]',
  },
};

/** Cities added after launch fall back to the brand foreground until they get their own chapter color. */
const FALLBACK: CityChapter = {
  number: '··',
  surface: 'bg-foreground',
  text: 'text-foreground',
  gradient: 'from-foreground via-[#075985] to-[#082f49]',
};

export const CHAPTER_ORDER = Object.keys(CHAPTERS);

export function cityChapter(slug: string | null | undefined): CityChapter {
  return (slug && CHAPTERS[slug]) || FALLBACK;
}
