import { HOTEL_CONFIG, GalleryItem } from './hotelConfig';

export interface Review {
  id: string;
  guestName: string;
  rating: number; // 1 to 5
  message: string;
  photoUrl?: string;
  stayDate?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
}

export interface CustomPhoto {
  id: string;
  title: string;
  subtitle: string;
  category: 'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR';
  imageUrl: string;
  imageAlt: string;
  description: string;
  createdAt: string;
  isCustom: true;
}

export interface HotelSettings {
  googleReviewUrl: string;
  adminPasscode: string;
}

const REVIEWS_STORAGE_KEY = 'hotel_ora_reviews_v1';
const PHOTOS_STORAGE_KEY = 'hotel_ora_custom_photos_v1';
const SETTINGS_STORAGE_KEY = 'hotel_ora_settings_v1';
const ADMIN_AUTH_KEY = 'hotel_ora_admin_auth_v1';

const DEFAULT_SETTINGS: HotelSettings = {
  googleReviewUrl: HOTEL_CONFIG.location.googleMapsUrl,
  adminPasscode: 'ora782436', // Default secure passcode for HOTEL ORA staff
};

// Dispatch event on change so React components re-render immediately
function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('hotel-storage-updated'));
  }
}

// ---------------- REVIEWS ---------------- //

export function getReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading reviews from storage', e);
    return [];
  }
}

export function getApprovedReviews(): Review[] {
  return getReviews().filter((r) => r.status === 'approved');
}

export function getPendingReviews(): Review[] {
  return getReviews().filter((r) => r.status === 'pending');
}

export function saveReviews(reviews: Review[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    notifyChange();
  } catch (e) {
    console.error('Error saving reviews to storage', e);
  }
}

export function addReview(data: {
  guestName: string;
  rating: number;
  message: string;
  photoUrl?: string;
  stayDate?: string;
}): Review {
  const reviews = getReviews();
  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    guestName: data.guestName.trim(),
    rating: Math.max(1, Math.min(5, Math.round(data.rating))),
    message: data.message.trim(),
    photoUrl: data.photoUrl?.trim() || undefined,
    stayDate: data.stayDate || undefined,
    createdAt: new Date().toISOString(),
    status: 'pending', // Awaiting moderation
    featured: false,
  };

  reviews.unshift(newReview);
  saveReviews(reviews);
  return newReview;
}

export function updateReviewStatus(id: string, status: 'approved' | 'rejected'): void {
  const reviews = getReviews().map((r) => (r.id === id ? { ...r, status } : r));
  saveReviews(reviews);
}

export function toggleReviewFeatured(id: string): void {
  const reviews = getReviews().map((r) =>
    r.id === id ? { ...r, featured: !r.featured } : r
  );
  saveReviews(reviews);
}

export function deleteReview(id: string): void {
  const reviews = getReviews().filter((r) => r.id !== id);
  saveReviews(reviews);
}

// ---------------- CUSTOM PHOTOS ---------------- //

export function getCustomPhotos(): CustomPhoto[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading custom photos', e);
    return [];
  }
}

export function saveCustomPhotos(photos: CustomPhoto[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    notifyChange();
  } catch (e) {
    console.error('Error saving custom photos', e);
  }
}

export function addCustomPhoto(data: {
  title: string;
  subtitle: string;
  category: 'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR';
  imageUrl: string;
  description: string;
}): CustomPhoto {
  const photos = getCustomPhotos();
  const newPhoto: CustomPhoto = {
    id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: data.title.trim(),
    subtitle: data.subtitle.trim() || 'HOTEL ORA',
    category: data.category,
    imageUrl: data.imageUrl.trim(),
    imageAlt: `${data.title.trim()} - HOTEL ORA`,
    description: data.description.trim() || data.title.trim(),
    createdAt: new Date().toISOString(),
    isCustom: true,
  };

  photos.unshift(newPhoto);
  saveCustomPhotos(photos);
  return newPhoto;
}

export function deleteCustomPhoto(id: string): void {
  const photos = getCustomPhotos().filter((p) => p.id !== id);
  saveCustomPhotos(photos);
}

/**
 * Returns all gallery items: official seed photos followed by admin-added photos.
 * Ensures official photos are never deleted or modified.
 */
export function getAllGalleryItems(): GalleryItem[] {
  const custom = getCustomPhotos();
  return [...HOTEL_CONFIG.gallery, ...custom];
}

// ---------------- SETTINGS & AUTH ---------------- //

export function getHotelSettings(): HotelSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveHotelSettings(settings: Partial<HotelSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getHotelSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    notifyChange();
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function isStaffAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'authenticated';
}

export function verifyAndLoginAdmin(passcode: string): boolean {
  const settings = getHotelSettings();
  if (passcode.trim() === settings.adminPasscode.trim()) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}
