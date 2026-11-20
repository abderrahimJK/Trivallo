import { ActivityFilters, ActivityType } from '../../core/api/catalog.models';

const ACTIVITY_TYPES: ActivityType[] = ['EXCURSION', 'ACTIVITY'];

/** Raw query param values as bound by the router (always strings or undefined). */
export interface ActivityQueryParams {
  city?: string;
  category?: string;
  type?: string;
  maxPrice?: string;
  maxDuration?: string;
  page?: string;
}

/** Parses query params defensively: anything malformed in a hand-edited URL is ignored, not sent to the API. */
export function toActivityFilters(params: ActivityQueryParams): ActivityFilters {
  return {
    city: params.city || null,
    category: params.category || null,
    type: ACTIVITY_TYPES.includes(params.type as ActivityType)
      ? (params.type as ActivityType)
      : null,
    maxPrice: positiveNumber(params.maxPrice),
    maxDuration: positiveNumber(params.maxDuration),
    page: positiveNumber(params.page),
  };
}

function positiveNumber(value: string | undefined): number | null {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}
