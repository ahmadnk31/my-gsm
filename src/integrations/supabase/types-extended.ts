import { Tables } from './types';

// Extended types with slug fields
export interface DeviceCategoryWithSlug extends Tables<'device_categories'> {
  slug: string;
}

export interface DeviceBrandWithSlug extends Tables<'device_brands'> {
  slug: string;
}

export interface DeviceModelWithSlug extends Tables<'device_models'> {
  slug: string;
}

// Type guards to check if entities have slug fields
export function hasSlug<T extends { slug?: string }>(entity: T): entity is T & { slug: string } {
  return typeof entity.slug === 'string' && entity.slug.length > 0;
}
