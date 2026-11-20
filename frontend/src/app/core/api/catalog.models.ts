/** Mirrors the backend's /api/v1 response records. Keep in sync with the Java DTOs. */

export type ActivityType = 'EXCURSION' | 'ACTIVITY';

export type DayOfWeek =
  'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface City {
  slug: string;
  name: string;
  description: string | null;
  heroImageUrl: string | null;
}

export interface CityDetail extends City {
  metaTitle: string | null;
  metaDescription: string | null;
  locale: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string | null;
}

export interface CityRef {
  slug: string;
  name: string;
}

export interface ActivitySummary {
  slug: string;
  type: ActivityType;
  title: string;
  summary: string | null;
  city: CityRef;
  category: Category;
  priceAdultEur: number;
  priceChildEur: number;
  durationMinutes: number;
  coverImageUrl: string | null;
}

export interface ActivityImage {
  url: string;
  altText: string | null;
}

export interface ActivityDetail {
  slug: string;
  type: ActivityType;
  title: string;
  summary: string | null;
  description: string | null;
  itinerary: string | null;
  included: string[];
  notIncluded: string[];
  city: CityRef;
  category: Category;
  priceAdultEur: number;
  priceChildEur: number;
  durationMinutes: number;
  maxGroupSize: number;
  operatingDays: DayOfWeek[];
  meetingPoint: string | null;
  latitude: number | null;
  longitude: number | null;
  tripadvisorUrl: string | null;
  images: ActivityImage[];
  metaTitle: string | null;
  metaDescription: string | null;
  locale: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Query filters for GET /activities. Empty values are not sent. */
export interface ActivityFilters {
  city?: string | null;
  category?: string | null;
  type?: ActivityType | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  maxDuration?: number | null;
  page?: number | null;
  size?: number | null;
}
