import { HOTEL_CONFIG, GalleryItem } from './hotelConfig';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  adminPasscode?: string;
}

const REVIEWS_STORAGE_KEY = 'hotel_ora_reviews_v1';
const PHOTOS_STORAGE_KEY = 'hotel_ora_custom_photos_v1';
const SETTINGS_STORAGE_KEY = 'hotel_ora_settings_v1';
const ADMIN_AUTH_KEY = 'hotel_ora_admin_auth_v1';

const DEFAULT_SETTINGS: HotelSettings = {
  googleReviewUrl: HOTEL_CONFIG.location.googleMapsUrl,
  adminPasscode: 'ora782436', // Fallback local passcode when Supabase Auth isn't configured
};

// Dispatch event on change so React components re-render immediately
export function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('hotel-storage-updated'));
  }
}

// Helper: Convert DB row to Review
function rowToReview(row: any): Review {
  return {
    id: row.id,
    guestName: row.guest_name,
    rating: Number(row.rating),
    message: row.message,
    photoUrl: row.photo_url || undefined,
    stayDate: row.stay_date || undefined,
    createdAt: row.created_at,
    status: row.status,
    featured: Boolean(row.featured),
  };
}

// Helper: Convert Review to DB row
function reviewToRow(review: Review) {
  return {
    id: review.id,
    guest_name: review.guestName,
    rating: review.rating,
    message: review.message,
    photo_url: review.photoUrl || null,
    stay_date: review.stayDate || null,
    created_at: review.createdAt,
    status: review.status,
    featured: review.featured || false,
  };
}

// Helper: Convert DB row to CustomPhoto
function rowToPhoto(row: any): CustomPhoto {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || 'HOTEL ORA',
    category: row.category,
    imageUrl: row.image_url,
    imageAlt: row.image_alt || `${row.title} - HOTEL ORA`,
    description: row.description || row.title,
    createdAt: row.created_at,
    isCustom: true,
  };
}

// Helper: Convert CustomPhoto to DB row
function photoToRow(photo: CustomPhoto) {
  return {
    id: photo.id,
    title: photo.title,
    subtitle: photo.subtitle,
    category: photo.category,
    image_url: photo.imageUrl,
    image_alt: photo.imageAlt,
    description: photo.description,
    created_at: photo.createdAt,
    is_custom: true,
  };
}

// ---------------- REVIEWS ---------------- //

export async function fetchApprovedReviews(): Promise<Review[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(rowToReview);
        // Cache in localStorage for offline resilience
        try {
          const current = getLocalReviews();
          const merged = [...mapped, ...current.filter(c => c.status !== 'approved')];
          localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {}
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchApprovedReviews failed, falling back to local cache:', err);
    }
  }
  return getLocalReviews().filter((r) => r.status === 'approved');
}

export async function fetchAllReviews(): Promise<Review[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(rowToReview);
        try {
          localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(mapped));
        } catch (_) {}
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchAllReviews failed, falling back to local cache:', err);
    }
  }
  return getLocalReviews();
}

export function getLocalReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Synchronous getter for instant renders (combines cache + fallbacks)
export function getReviews(): Review[] {
  return getLocalReviews();
}

export function getApprovedReviews(): Review[] {
  return getLocalReviews().filter((r) => r.status === 'approved');
}

export async function submitReview(data: {
  guestName: string;
  rating: number;
  message: string;
  photoUrl?: string;
  stayDate?: string;
}): Promise<Review> {
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

  // Always update local cache immediately
  const local = getLocalReviews();
  local.unshift(newReview);
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(local));
  } catch (_) {}
  notifyChange();

  // If Supabase is connected, insert directly to remote database
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('reviews').insert([reviewToRow(newReview)]);
      if (error) {
        console.warn('Supabase review insert notice (stored in local cache):', error.message);
      }
    } catch (err) {
      console.warn('Supabase review insert exception (stored in local cache):', err);
    }
  }

  return newReview;
}

export async function setReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  // Update local
  const local = getLocalReviews().map((r) => (r.id === id ? { ...r, status } : r));
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(local));
  } catch (_) {}
  notifyChange();

  // Update Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reviews').update({ status }).eq('id', id);
    } catch (err) {
      console.warn('Failed to update review status in Supabase:', err);
    }
  }
}

export async function toggleReviewFeaturedStatus(id: string): Promise<void> {
  const local = getLocalReviews();
  const target = local.find(r => r.id === id);
  const nextFeatured = !target?.featured;

  const updated = local.map((r) =>
    r.id === id ? { ...r, featured: nextFeatured } : r
  );
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}
  notifyChange();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reviews').update({ featured: nextFeatured }).eq('id', id);
    } catch (err) {
      console.warn('Failed to toggle review featured in Supabase:', err);
    }
  }
}

export async function removeReview(id: string): Promise<void> {
  const local = getLocalReviews().filter((r) => r.id !== id);
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(local));
  } catch (_) {}
  notifyChange();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reviews').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete review in Supabase:', err);
    }
  }
}

// ---------------- CUSTOM PHOTOS ---------------- //

export async function fetchCustomPhotos(): Promise<CustomPhoto[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('custom_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(rowToPhoto);
        try {
          localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(mapped));
        } catch (_) {}
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchCustomPhotos failed, using local cache:', err);
    }
  }
  return getLocalCustomPhotos();
}

export function getLocalCustomPhotos(): CustomPhoto[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function getCustomPhotos(): CustomPhoto[] {
  return getLocalCustomPhotos();
}

export async function createCustomPhoto(data: {
  title: string;
  subtitle: string;
  category: 'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR';
  imageUrl: string;
  description: string;
}): Promise<CustomPhoto> {
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

  const local = getLocalCustomPhotos();
  local.unshift(newPhoto);
  try {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(local));
  } catch (_) {}
  notifyChange();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('custom_photos').insert([photoToRow(newPhoto)]);
    } catch (err) {
      console.warn('Supabase photo insert notice:', err);
    }
  }

  return newPhoto;
}

export async function removeCustomPhoto(id: string): Promise<void> {
  const local = getLocalCustomPhotos().filter((p) => p.id !== id);
  try {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(local));
  } catch (_) {}
  notifyChange();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('custom_photos').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase photo delete notice:', err);
    }
  }
}

export function getAllGalleryItems(): GalleryItem[] {
  const custom = getLocalCustomPhotos();
  return [...HOTEL_CONFIG.gallery, ...custom];
}

// ---------------- STORAGE BUCKET UPLOAD ---------------- //

/**
 * Uploads a file (photo) to Supabase Storage bucket ('hotel-ora-uploads').
 * If Supabase is not configured, returns the data URL as fallback.
 */
export async function uploadImageToStorage(
  file: File,
  folder: 'reviews' | 'gallery' = 'reviews'
): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('hotel-ora-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('hotel-ora-uploads')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('Supabase storage upload error, falling back to base64:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage exception, falling back to base64:', err);
    }
  }

  // Fallback: convert file to Base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------- SETTINGS & AUTH ---------------- //

export async function fetchHotelSettings(): Promise<HotelSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('hotel_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (!error && data) {
        const settings: HotelSettings = {
          googleReviewUrl: data.google_review_url || DEFAULT_SETTINGS.googleReviewUrl,
        };
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (_) {}
        return settings;
      }
    } catch (err) {
      console.warn('Supabase fetchHotelSettings failed, using local cache:', err);
    }
  }
  return getLocalHotelSettings();
}

export function getLocalHotelSettings(): HotelSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function getHotelSettings(): HotelSettings {
  return getLocalHotelSettings();
}

export async function saveHotelSettings(settings: Partial<HotelSettings>): Promise<void> {
  const current = getLocalHotelSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}
  notifyChange();

  if (isSupabaseConfigured && supabase && settings.googleReviewUrl) {
    try {
      await supabase
        .from('hotel_settings')
        .upsert({ id: 'default', google_review_url: settings.googleReviewUrl, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn('Failed to update hotel settings in Supabase:', err);
    }
  }
}

export async function isStaffAuthenticated(): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Verify user exists in admin_users or has staff claim
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (adminRow) return true;
        const role = (session.user.app_metadata as any)?.role;
        if (role === 'admin' || role === 'hotel_staff') return true;
        return false;
      }
    } catch (_) {}
  }
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'authenticated';
}

export async function adminSignInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session?.user) {
        // Confirm user is an authorized staff member in admin_users
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('id', data.session.user.id)
          .maybeSingle();

        const role = (data.session.user.app_metadata as any)?.role;
        if (!adminRow && role !== 'admin' && role !== 'hotel_staff') {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Access denied: This account is not registered as authorized HOTEL ORA staff. Contact the administrator.',
          };
        }

        sessionStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error' };
    }
  }

  // Passcode / local fallback authentication
  const settings = getLocalHotelSettings();
  if (password.trim() === settings.adminPasscode?.trim()) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
    return { success: true };
  }

  return { success: false, error: 'Invalid staff credentials or passcode.' };
}

export async function adminSignOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
  }
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
}
