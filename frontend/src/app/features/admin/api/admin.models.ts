import { ActivityType, DayOfWeek } from '../../../core/api/catalog.models';

export type ActivityStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Locale = 'en' | 'fr';

export interface ActivityStats {
  published: number;
  draft: number;
  archived: number;
  missingImages: number;
  missingFrench: number;
}

export interface ActivityAdminSummary {
  id: number;
  slug: string;
  title: string;
  cityName: string;
  categoryName: string;
  type: ActivityType;
  status: ActivityStatus;
  priceAdultEur: number;
  imageCount: number;
  coverImageUrl: string | null;
  frenchMissing: boolean;
  updatedAt: string;
}

export interface ActivityTranslation {
  locale: Locale;
  title: string;
  summary: string | null;
  description: string | null;
  itinerary: string | null;
  included: string[];
  notIncluded: string[];
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface AdminImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ActivityAdmin {
  id: number;
  slug: string;
  citySlug: string;
  categorySlug: string;
  type: ActivityType;
  status: ActivityStatus;
  priceAdultEur: number;
  priceChildEur: number;
  durationMinutes: number;
  maxGroupSize: number;
  operatingDays: DayOfWeek[];
  meetingPoint: string | null;
  latitude: number | null;
  longitude: number | null;
  tripadvisorUrl: string | null;
  translations: ActivityTranslation[];
  images: AdminImage[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityAdminRequest = Omit<
  ActivityAdmin,
  'id' | 'status' | 'images' | 'createdAt' | 'updatedAt'
>;

export interface CityTranslation {
  locale: Locale;
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface CityAdmin {
  id: number;
  slug: string;
  heroImageUrl: string | null;
  sortOrder: number;
  translations: CityTranslation[];
}

export type CityAdminRequest = Pick<CityAdmin, 'slug' | 'sortOrder' | 'translations'>;

export interface CategoryTranslation {
  locale: Locale;
  name: string;
}

export interface CategoryAdmin {
  id: number;
  slug: string;
  icon: string | null;
  sortOrder: number;
  translations: CategoryTranslation[];
}

export type CategoryAdminRequest = Omit<CategoryAdmin, 'id'>;

/** English name of a city or category, the admin's working language. */
export function englishName(item: {
  slug: string;
  translations: { locale: string; name: string }[];
}): string {
  return item.translations.find((t) => t.locale === 'en')?.name ?? item.slug;
}
