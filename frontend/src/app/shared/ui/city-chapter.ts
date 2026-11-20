/**
 * Each launch city has a color (design-system/trivallo/MASTER.md, "Project Decisions").
 * In revision 2 it only tints image placeholders until real photos are uploaded.
 * Class names are written out in full so Tailwind can find them.
 */
export interface CityTone {
  /** Light background for placeholders. */
  tint: string;
  /** Icon color on that background. */
  ink: string;
}

const TONES: Record<string, CityTone> = {
  marrakech: { tint: 'bg-[#fdecef]', ink: 'text-marrakech' },
  ouarzazate: { tint: 'bg-[#fdf3e7]', ink: 'text-ouarzazate' },
  merzouga: { tint: 'bg-[#fdefe7]', ink: 'text-merzouga' },
};

/** Cities added after launch get a neutral tone until they have their own. */
const FALLBACK: CityTone = { tint: 'bg-muted', ink: 'text-muted-foreground' };

export const CITY_ORDER = Object.keys(TONES);

export function cityTone(slug: string | null | undefined): CityTone {
  return (slug && TONES[slug]) || FALLBACK;
}
