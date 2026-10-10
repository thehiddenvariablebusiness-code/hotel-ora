import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogOut,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Star,
  Settings,
  ShieldAlert,
  Download,
  FileUp,
  Eye,
  EyeOff,
  Database,
  Cloud,
  Check,
  RefreshCw,
  Mail,
  Key,
} from 'lucide-react';
import {
  Review,
  CustomPhoto,
  getReviews,
  fetchAllReviews,
  setReviewStatus,
  toggleReviewFeaturedStatus,
  removeReview,
  getCustomPhotos,
  fetchCustomPhotos,
  createCustomPhoto,
  removeCustomPhoto,
  uploadImageToStorage,
  isStaffAuthenticated,
  adminSignInWithEmail,
  adminSignOut,
  getHotelSettings,
  fetchHotelSettings,
  saveHotelSettings,
} from '../data/storage';
import { isSupabaseConfigured, SUPABASE_URL } from '../lib/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState<'passcode' | 'email'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active tab: 'reviews' | 'photos' | 'settings'
  const [activeTab, setActiveTab] = useState<'reviews' | 'photos' | 'settings'>('reviews');

  // Reviews data & sub-filter
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Photo management state
  const [customPhotos, setCustomPhotos] = useState<CustomPhoto[]>([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoSubtitle, setNewPhotoSubtitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR'>('ROOMS');
  const [newPhotoDescription, setNewPhotoDescription] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoDataUrl, setNewPhotoDataUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Settings state
  const [newPasscode, setNewPasscode] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Sync data from remote Supabase / local cache
  const refreshData = async () => {
    setIsLoadingReviews(true);
    try {
      setReviews(getReviews());
      setCustomPhotos(getCustomPhotos());
      const s = getHotelSettings();
      setGoogleReviewUrl(s.googleReviewUrl);

      // Async fetch to ensure fresh backend state
      const [remoteReviews, remotePhotos, remoteSettings] = await Promise.all([
        fetchAllReviews(),
        fetchCustomPhotos(),
        fetchHotelSettings(),
      ]);
      setReviews(remoteReviews);
      setCustomPhotos(remotePhotos);
      setGoogleReviewUrl(remoteSettings.googleReviewUrl);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      isStaffAuthenticated().then((auth) => {
        setIsAuthenticated(auth);
        if (auth) {
          refreshData();
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setReviews(getReviews());
      setCustomPhotos(getCustomPhotos());
    };
    window.addEventListener('hotel-storage-updated', handleStorageUpdate);
    return () => window.removeEventListener('hotel-storage-updated', handleStorageUpdate);
  }, []);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const passwordToUse = loginMode === 'passcode' ? passcode : adminPassword;
      const emailToUse = loginMode === 'passcode' ? '' : adminEmail;

      const result = await adminSignInWithEmail(emailToUse, passwordToUse);
      if (result.success) {
        setIsAuthenticated(true);
        setAuthError('');
        setPasscode('');
        setAdminPassword('');
        refreshData();
      } else {
        setAuthError(result.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await adminSignOut();
    setIsAuthenticated(false);
    setPasscode('');
    setAdminPassword('');
  };

  // Review actions
  const handleApprove = async (id: string) => {
    await setReviewStatus(id, 'approved');
    refreshData();
  };

  const handleReject = async (id: string) => {
    await setReviewStatus(id, 'rejected');
    refreshData();
  };

  const handleToggleFeatured = async (id: string) => {
    await toggleReviewFeaturedStatus(id);
    refreshData();
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      await removeReview(id);
      refreshData();
    }
  };

  // Photo actions
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB limit.');
      return;
    }

    setNewPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhotoDataUrl(reader.result as string);
      setPhotoError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim()) {
      setPhotoError('Please specify a title for the photo.');
      return;
    }
    if (!newPhotoDataUrl.trim() && !newPhotoFile) {
      setPhotoError('Please upload an image file or provide an image link.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError('');

    try {
      let finalImageUrl = newPhotoDataUrl.trim();

      // If user uploaded a file, store in Supabase Storage bucket
      if (newPhotoFile) {
        try {
          finalImageUrl = await uploadImageToStorage(newPhotoFile, 'gallery');
        } catch (storageErr) {
          console.warn('Storage upload fallback:', storageErr);
        }
      }

      await createCustomPhoto({
        title: newPhotoTitle.trim(),
        subtitle: newPhotoSubtitle.trim() || 'HOTEL ORA',
        category: newPhotoCategory,
        imageUrl: finalImageUrl,
        description: newPhotoDescription.trim() || newPhotoTitle.trim(),
      });

      setPhotoSuccess('Photo successfully added to the public gallery!');
      setNewPhotoTitle('');
      setNewPhotoSubtitle('');
      setNewPhotoDescription('');
      setNewPhotoFile(null);
      setNewPhotoDataUrl('');
      setPhotoError('');
      refreshData();

      setTimeout(() => setPhotoSuccess(''), 3500);
    } catch (err) {
      setPhotoError('Error saving photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (window.confirm('Delete this uploaded photo from the gallery?')) {
      await removeCustomPhoto(id);
      refreshData();
    }
  };

  // Settings actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateObj: Record<string, string> = {};
    if (googleReviewUrl.trim()) {
      updateObj.googleReviewUrl = googleReviewUrl.trim();
    }
    if (newPasscode.trim()) {
      updateObj.adminPasscode = newPasscode.trim();
    }

    await saveHotelSettings(updateObj);
    setNewPasscode('');
    setSettingsSuccess('Settings successfully updated!');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  // Export / Import
  const handleExportBackup = () => {
    const data = {
      version: '2.0',
      backend: isSupabaseConfigured ? 'supabase' : 'local-cache',
      exportedAt: new Date().toISOString(),
      reviews: getReviews(),
      photos: getCustomPhotos(),
      settings: getHotelSettings(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-ora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.reviews && Array.isArray(json.reviews)) {
          localStorage.setItem('hotel_ora_reviews_v1', JSON.stringify(json.reviews));
        }
        if (json.photos && Array.isArray(json.photos)) {
          localStorage.setItem('hotel_ora_custom_photos_v1', JSON.stringify(json.photos));
        }
        if (json.settings) {
          localStorage.setItem('hotel_ora_settings_v1', JSON.stringify(json.settings));
        }
        refreshData();
        alert('Backup data successfully restored to cache!');
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'all') return true;
    return r.status === reviewFilter;
  });

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/30 flex items-center justify-center text-[#E5D5B8]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-wider uppercase font-display text-white">
                  HOTEL ORA Staff Portal
                </h3>
                {isSupabaseConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                    <Cloud className="w-2.5 h-2.5" />
                    Supabase Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                    <Database className="w-2.5 h-2.5" />
                    Local Cache Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                Secure moderation for guest reviews and hotel gallery management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close admin modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Container */}
        {!isAuthenticated ? (
          /* Authentication Form */
          <div className="p-8 sm:p-12 flex-1 flex flex-col items-center justify-center text-center bg-[#FAF9F5]">
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 text-[#8F6B38] flex items-center justify-center mb-6 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold text-stone-900 font-display mb-2">
              Staff Portal Access
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mb-6 leading-relaxed">
              Sign in with your staff passcode or Supabase administrator credentials to moderate reviews.
            </p>

            {/* Login Mode Toggle */}
            <div className="inline-flex items-center p-1 bg-stone-200/80 rounded-xl mb-5 text-xs">
              <button
                type="button"
                onClick={() => setLoginMode('passcode')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  loginMode === 'passcode'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Passcode
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('email')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  loginMode === 'email'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Email &amp; Password
              </button>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              {loginMode === 'passcode' ? (
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    placeholder="Enter Passcode (default: ora782436)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="admin@hotelora.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">Password</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 bg-stone-900 hover:bg-stone-850 active:scale-[0.99] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthenticating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isAuthenticating ? 'Signing in...' : 'Access Portal'}</span>
              </button>

              <p className="text-[11px] text-stone-400">
                Staff passcode fallback: <code className="text-stone-700 font-mono font-semibold">ora782436</code>
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0 bg-[#FAF9F5]">
            {/* Navigation Tabs */}
            <div className="flex items-center px-6 border-b border-stone-200 bg-white gap-2 sm:gap-6 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3.5 px-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-[#C5A880] text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>Review Moderation</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`py-3.5 px-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === 'photos'
                    ? 'border-[#C5A880] text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gallery Photos</span>
                <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                  {customPhotos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3.5 px-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-[#C5A880] text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Backend &amp; Settings</span>
              </button>

              <div className="ml-auto flex items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={refreshData}
                  disabled={isLoadingReviews}
                  className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                  title="Reload data"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingReviews ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Review Moderation */}
            {activeTab === 'reviews' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Sub-filters Bar */}
                <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        reviewFilter === 'all'
                          ? 'bg-stone-900 text-white'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      All ({reviews.length})
                    </button>
                    <button
                      onClick={() => setReviewFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        reviewFilter === 'pending'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <span>Pending</span>
                      {pendingCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setReviewFilter('approved')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        reviewFilter === 'approved'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      Approved ({approvedCount})
                    </button>
                    <button
                      onClick={() => setReviewFilter('rejected')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        reviewFilter === 'rejected'
                          ? 'bg-red-700 text-white'
                          : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                      }`}
                    >
                      Rejected ({rejectedCount})
                    </button>
                  </div>

                  <span className="text-xs text-stone-500">
                    Showing {filteredReviews.length} of {reviews.length} total reviews
                  </span>
                </div>

                {/* Reviews List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {filteredReviews.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                      <Star className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-stone-700 font-display">
                        No reviews found in this filter
                      </p>
                      <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                        Guest reviews submitted via the public &ldquo;Write a Review&rdquo; button will appear here for moderation.
                      </p>
                    </div>
                  ) : (
                    filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-5 items-start justify-between"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-stone-900">
                              {rev.guestName}
                            </span>
                            <span className="text-stone-300">•</span>
                            <div className="flex items-center text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-stone-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>

                            {/* Status badge */}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                rev.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rev.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {rev.status}
                            </span>

                            {rev.featured && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Featured
                              </span>
                            )}
                          </div>

                          {rev.stayDate && (
                            <p className="text-xs text-stone-500 italic">
                              Stay date: {rev.stayDate}
                            </p>
                          )}

                          <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                            &ldquo;{rev.message}&rdquo;
                          </p>

                          {rev.photoUrl && (
                            <div className="pt-2">
                              <img
                                src={rev.photoUrl}
                                alt="Guest"
                                className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 shrink-0 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                          {rev.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(rev.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {rev.status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(rev.id)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleFeatured(rev.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                              rev.featured
                                ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{rev.featured ? 'Unfeature' : 'Feature'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Gallery Photos */}
            {activeTab === 'photos' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Upload new photo form */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
                  <h4 className="text-sm font-bold text-stone-900 font-display mb-1 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#8F6B38]" />
                    <span>Add New Photo to Hotel Gallery</span>
                  </h4>
                  <p className="text-xs text-stone-500 mb-4">
                    Uploaded photos will be saved directly to the database and displayed in the public gallery.
                  </p>

                  {photoError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{photoError}</span>
                    </div>
                  )}

                  {photoSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{photoSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Photo Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhotoTitle}
                          onChange={(e) => setNewPhotoTitle(e.target.value)}
                          placeholder="e.g. Deluxe Room Bedding, Reception Desk"
                          className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={newPhotoCategory}
                          onChange={(e) =>
                            setNewPhotoCategory(
                              e.target.value as 'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR'
                            )
                          }
                          className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="ROOMS">ROOMS</option>
                          <option value="RECEPTION">RECEPTION</option>
                          <option value="EXTERIOR">EXTERIOR</option>
                          <option value="INTERIOR">INTERIOR</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={newPhotoSubtitle}
                          onChange={(e) => setNewPhotoSubtitle(e.target.value)}
                          placeholder="e.g. HOTEL ORA • Hojai"
                          className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={newPhotoDescription}
                          onChange={(e) => setNewPhotoDescription(e.target.value)}
                          placeholder="Short description for preview modal"
                          className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    {/* Image selector */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Upload Image File or Provide Direct URL *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <label className="cursor-pointer px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-stone-300 transition-colors">
                          <Upload className="w-4 h-4 text-stone-600" />
                          <span>Choose Local File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>

                        <span className="text-xs text-stone-400">or</span>

                        <input
                          type="url"
                          value={newPhotoDataUrl.startsWith('data:') ? '' : newPhotoDataUrl}
                          onChange={(e) => setNewPhotoDataUrl(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="flex-1 w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      {newPhotoDataUrl && (
                        <div className="mt-3 flex items-center gap-3">
                          <img
                            src={newPhotoDataUrl}
                            alt="Preview"
                            className="w-20 h-14 object-cover rounded-xl border border-stone-300 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewPhotoDataUrl('');
                              setNewPhotoFile(null);
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove preview
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingPhoto}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 active:scale-[0.99] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUploadingPhoto && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isUploadingPhoto ? 'Uploading Photo...' : 'Add Photo to Gallery'}</span>
                    </button>
                  </form>
                </div>

                {/* List of uploaded custom photos */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Uploaded Custom Photos ({customPhotos.length})
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      Protected: 7 official hotel photos are always active
                    </span>
                  </div>

                  {customPhotos.length === 0 ? (
                    <p className="text-xs text-stone-400 py-6 text-center">
                      No custom photos uploaded yet. Use the form above to add new property or room photos anytime.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 group flex flex-col justify-between"
                        >
                          <div className="relative aspect-video overflow-hidden bg-stone-900">
                            <img
                              src={photo.imageUrl}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-stone-950/80 text-white rounded text-[10px] uppercase font-bold tracking-wider">
                              {photo.category}
                            </span>
                          </div>

                          <div className="p-3">
                            <p className="text-xs font-bold text-stone-900 truncate">
                              {photo.title}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">
                              {photo.subtitle}
                            </p>

                            <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between">
                              <span className="text-[10px] text-stone-400">
                                {new Date(photo.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Settings & Supabase Status */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Supabase Connection Card */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 font-display">
                          Supabase Backend Status
                        </h4>
                        <p className="text-xs text-stone-500">
                          {isSupabaseConfigured
                            ? 'Connected to persistent cloud database'
                            : 'Running in Local Cache mode (configure Supabase in Vercel/environment to enable cloud persistence)'}
                        </p>
                      </div>
                    </div>

                    {isSupabaseConfigured ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Not Connected
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
                    <p className="font-semibold text-stone-800">
                      Required Environment Variables for Vercel / Production:
                    </p>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-stone-700">
                      <li>VITE_SUPABASE_URL = {SUPABASE_URL ? `${SUPABASE_URL.slice(0, 24)}...` : '(not set)'}</li>
                      <li>VITE_SUPABASE_ANON_KEY = (your Supabase anon public key)</li>
                    </ul>
                    <p className="text-[11px] text-stone-500 pt-1">
                      A ready-to-run database initialization script is saved in <code className="text-stone-800 font-mono">/supabase-schema.sql</code>.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                  <h4 className="text-sm font-bold text-stone-900 font-display">
                    Portal Configuration
                  </h4>

                  {settingsSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{settingsSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Google Review / Maps Destination URL
                      </label>
                      <input
                        type="url"
                        value={googleReviewUrl}
                        onChange={(e) => setGoogleReviewUrl(e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                      />
                      <p className="text-[11px] text-stone-400 mt-1">
                        Destination for the &ldquo;Review on Google&rdquo; button in the public reviews section.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Update Staff Passcode
                      </label>
                      <input
                        type="text"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="Enter new secret passcode (leave blank to keep current)"
                        className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </form>
                </div>

                {/* Backup & Restore */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 font-display">
                      Data Export &amp; Backup
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Export all approved reviews, pending submissions, and custom photos as a JSON file, or restore onto another device.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-stone-200"
                    >
                      <Download className="w-4 h-4 text-stone-600" />
                      <span>Download Data Backup (.json)</span>
                    </button>

                    <label className="cursor-pointer px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-stone-200">
                      <FileUp className="w-4 h-4 text-stone-600" />
                      <span>Restore from Backup</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
