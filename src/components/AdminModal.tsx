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
} from 'lucide-react';
import {
  Review,
  CustomPhoto,
  getReviews,
  updateReviewStatus,
  toggleReviewFeatured,
  deleteReview,
  getCustomPhotos,
  addCustomPhoto,
  deleteCustomPhoto,
  isStaffAuthenticated,
  verifyAndLoginAdmin,
  logoutAdmin,
  getHotelSettings,
  saveHotelSettings,
} from '../data/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active tab: 'reviews' | 'photos' | 'settings'
  const [activeTab, setActiveTab] = useState<'reviews' | 'photos' | 'settings'>('reviews');

  // Reviews data & sub-filter
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Photo management state
  const [customPhotos, setCustomPhotos] = useState<CustomPhoto[]>([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoSubtitle, setNewPhotoSubtitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR'>('ROOMS');
  const [newPhotoDescription, setNewPhotoDescription] = useState('');
  const [newPhotoDataUrl, setNewPhotoDataUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  // Settings state
  const [newPasscode, setNewPasscode] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Sync data
  const refreshData = () => {
    setReviews(getReviews());
    setCustomPhotos(getCustomPhotos());
    const s = getHotelSettings();
    setGoogleReviewUrl(s.googleReviewUrl);
  };

  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(isStaffAuthenticated());
      refreshData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      refreshData();
    };
    window.addEventListener('hotel-storage-updated', handleStorageUpdate);
    return () => window.removeEventListener('hotel-storage-updated', handleStorageUpdate);
  }, []);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAndLoginAdmin(passcode)) {
      setIsAuthenticated(true);
      setAuthError('');
      setPasscode('');
      refreshData();
    } else {
      setAuthError('Incorrect passcode. Please check and try again.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Review actions
  const handleApprove = (id: string) => {
    updateReviewStatus(id, 'approved');
    refreshData();
  };

  const handleReject = (id: string) => {
    updateReviewStatus(id, 'rejected');
    refreshData();
  };

  const handleToggleFeatured = (id: string) => {
    toggleReviewFeatured(id);
    refreshData();
  };

  const handleDeleteReview = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      deleteReview(id);
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPhotoDataUrl(reader.result as string);
      setPhotoError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim()) {
      setPhotoError('Please specify a title for the photo.');
      return;
    }
    if (!newPhotoDataUrl.trim()) {
      setPhotoError('Please upload an image file or provide an image link.');
      return;
    }

    try {
      addCustomPhoto({
        title: newPhotoTitle.trim(),
        subtitle: newPhotoSubtitle.trim() || 'HOTEL ORA',
        category: newPhotoCategory,
        imageUrl: newPhotoDataUrl.trim(),
        description: newPhotoDescription.trim() || newPhotoTitle.trim(),
      });

      setPhotoSuccess('Photo successfully added to the public gallery!');
      setNewPhotoTitle('');
      setNewPhotoSubtitle('');
      setNewPhotoDescription('');
      setNewPhotoDataUrl('');
      setPhotoError('');
      refreshData();

      setTimeout(() => setPhotoSuccess(''), 3500);
    } catch (err) {
      setPhotoError('Error saving photo. Storage quota might be reached.');
    }
  };

  const handleDeletePhoto = (id: string) => {
    if (window.confirm('Delete this uploaded photo from the gallery?')) {
      deleteCustomPhoto(id);
      refreshData();
    }
  };

  // Settings actions
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updateObj: Record<string, string> = {};
    if (googleReviewUrl.trim()) {
      updateObj.googleReviewUrl = googleReviewUrl.trim();
    }
    if (newPasscode.trim()) {
      updateObj.adminPasscode = newPasscode.trim();
    }

    saveHotelSettings(updateObj);
    setNewPasscode('');
    setSettingsSuccess('Settings successfully updated!');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  // Export / Import
  const handleExportBackup = () => {
    const data = {
      version: '1.0',
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
        alert('Backup data successfully restored!');
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'all') return true;
    return r.status === reviewFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[92vh] bg-white rounded-3xl border border-stone-300 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display tracking-wide">
                HOTEL ORA &bull; Management Portal
              </h3>
              <p className="text-[11px] text-stone-400">
                Staff Review Moderation &amp; Gallery Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
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
              Staff Passcode Required
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mb-6 leading-relaxed">
              Enter your HOTEL ORA staff passcode to moderate guest reviews and manage hotel photos.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

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

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-850 active:scale-[0.99] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs"
              >
                Access Portal
              </button>

              <p className="text-[11px] text-stone-400">
                Default access code for management: <code className="text-stone-700 font-mono font-semibold">ora782436</code>
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {pendingCount} Pending
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
                <span>Gallery Photo Management</span>
                {customPhotos.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-200 text-stone-700">
                    +{customPhotos.length}
                  </span>
                )}
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
                <span>Settings &amp; Backup</span>
              </button>
            </div>

            {/* Tab 1: Review Moderation */}
            {activeTab === 'reviews' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Sub-filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-1.5">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => {
                      const count =
                        filter === 'all'
                          ? reviews.length
                          : reviews.filter((r) => r.status === filter).length;
                      return (
                        <button
                          key={filter}
                          onClick={() => setReviewFilter(filter)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                            reviewFilter === filter
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                          }`}
                        >
                          {filter} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[11px] text-stone-400">
                    Showing {filteredReviews.length} of {reviews.length} total
                  </span>
                </div>

                {filteredReviews.length === 0 ? (
                  <div className="py-16 text-center text-stone-500 bg-white rounded-2xl border border-dashed border-stone-300">
                    <p className="text-sm font-medium">No reviews in &ldquo;{reviewFilter}&rdquo; status.</p>
                    <p className="text-xs text-stone-400 mt-1">
                      New guest reviews submitted from the website will appear here for approval.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className={`p-4 sm:p-5 rounded-2xl border bg-white transition-all ${
                          rev.status === 'pending'
                            ? 'border-amber-300 ring-1 ring-amber-200/50'
                            : rev.status === 'approved'
                            ? 'border-emerald-200'
                            : 'border-red-200 bg-stone-50/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          {/* Review Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Status Badge */}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  rev.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : rev.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}
                              >
                                {rev.status}
                              </span>

                              {rev.featured && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C5A880]/20 text-[#8F6B38] flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Featured on Home</span>
                                </span>
                              )}

                              <span className="text-xs font-bold text-stone-900">
                                {rev.guestName}
                              </span>

                              {rev.stayDate && (
                                <span className="text-[11px] text-stone-500">
                                  ({rev.stayDate})
                                </span>
                              )}

                              <span className="text-[11px] text-stone-400">
                                &bull; {new Date(rev.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating ? 'fill-current' : 'text-stone-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-semibold text-stone-700 ml-1.5">
                                {rev.rating}/5
                              </span>
                            </div>

                            {/* Message */}
                            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                              &ldquo;{rev.message}&rdquo;
                            </p>

                            {/* Optional Attached Guest Photo */}
                            {rev.photoUrl && (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] text-stone-500">Guest Photo:</span>
                                <img
                                  src={rev.photoUrl}
                                  alt={rev.guestName}
                                  className="w-10 h-10 rounded-lg object-cover border border-stone-300"
                                />
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                            {rev.status !== 'approved' && (
                              <button
                                onClick={() => handleApprove(rev.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                title="Approve & Publish to Website"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {rev.status !== 'rejected' && (
                              <button
                                onClick={() => handleReject(rev.id)}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200"
                                title="Reject review"
                              >
                                <XCircle className="w-3.5 h-3.5 text-stone-500" />
                                <span>Reject</span>
                              </button>
                            )}

                            {rev.status === 'approved' && (
                              <button
                                onClick={() => handleToggleFeatured(rev.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                  rev.featured
                                    ? 'bg-[#C5A880] text-stone-950 font-bold'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                                title="Toggle Featured badge"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{rev.featured ? 'Featured ★' : 'Feature'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Photo Management */}
            {activeTab === 'photos' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Upload Form */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <Upload className="w-4 h-4 text-[#8F6B38]" />
                    <h4 className="text-sm font-bold text-stone-900 font-display">
                      Add New Photo to HOTEL ORA Gallery
                    </h4>
                  </div>

                  {photoError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {photoError}
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
                          placeholder="e.g. Deluxe Room With Balcony"
                          value={newPhotoTitle}
                          onChange={(e) => setNewPhotoTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Subtitle / Location Tag
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2nd Floor / Main Entrance"
                          value={newPhotoSubtitle}
                          onChange={(e) => setNewPhotoSubtitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Short Description
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Freshly furnished spacious room"
                          value={newPhotoDescription}
                          onChange={(e) => setNewPhotoDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    {/* Image selector: File upload or URL */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-stone-700">
                        Upload Image File or Enter URL *
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-850 transition-colors shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Select Photo File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>

                        <span className="text-xs text-stone-400 text-center sm:text-left">or URL:</span>

                        <input
                          type="url"
                          placeholder="https://example.com/photo.jpg"
                          value={newPhotoDataUrl.startsWith('data:') ? '' : newPhotoDataUrl}
                          onChange={(e) => setNewPhotoDataUrl(e.target.value)}
                          className="flex-1 px-3 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      {newPhotoDataUrl && (
                        <div className="mt-3 p-3 bg-stone-100 rounded-xl flex items-center gap-4">
                          <img
                            src={newPhotoDataUrl}
                            alt="Preview"
                            className="w-20 h-16 object-cover rounded-lg border border-stone-300"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-stone-900 truncate">
                              Ready for upload ({newPhotoCategory})
                            </p>
                            <p className="text-[11px] text-stone-500">
                              Will display immediately in the public Gallery
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewPhotoDataUrl('')}
                            className="text-xs text-red-600 hover:underline px-2"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#C5A880] hover:bg-[#b59870] text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs"
                      >
                        Publish Photo to Gallery
                      </button>
                    </div>
                  </form>
                </div>

                {/* Custom photos list */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-4">
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

            {/* Tab 3: Settings & Backup */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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
