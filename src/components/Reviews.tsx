import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  PenSquare,
  MessageSquare,
  CheckCircle2,
  X,
  Upload,
  ExternalLink,
  ShieldCheck,
  Quote,
  Sparkles,
} from 'lucide-react';
import {
  Review,
  getApprovedReviews,
  fetchApprovedReviews,
  submitReview,
  uploadImageToStorage,
  getHotelSettings,
} from '../data/storage';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const Reviews: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible, direction: headerDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: contentRef, isVisible: contentVisible, direction: contentDir } = useScrollReveal({
    threshold: 0.1,
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [stayDate, setStayDate] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reviews on mount and when storage changes
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      // First populate instantly from local cache
      setReviews(getApprovedReviews());
      // Then fetch from Supabase if configured
      const remote = await fetchApprovedReviews();
      if (isMounted) {
        setReviews(remote);
      }
    };
    load();

    const handleStorageUpdate = () => {
      setReviews(getApprovedReviews());
    };
    window.addEventListener('hotel-storage-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('hotel-storage-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const settings = useMemo(() => getHotelSettings(), [reviews]);

  // Handle image upload via File or FileReader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image size should be less than 2MB.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoDataUrl(reader.result as string);
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setFormError('Please share at least a few words (minimum 10 characters) about your stay.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      let finalPhotoUrl = photoDataUrl || undefined;

      // If user selected a file, upload to Supabase Storage bucket
      if (photoFile) {
        try {
          finalPhotoUrl = await uploadImageToStorage(photoFile, 'reviews');
        } catch (uploadErr) {
          console.warn('Storage upload fallback to data URL:', uploadErr);
        }
      }

      await submitReview({
        guestName: guestName.trim(),
        rating,
        message: message.trim(),
        stayDate: stayDate.trim() || undefined,
        photoUrl: finalPhotoUrl,
      });

      setSubmissionSuccess(true);
      // Reset form
      setGuestName('');
      setRating(5);
      setMessage('');
      setStayDate('');
      setPhotoFile(null);
      setPhotoDataUrl('');
    } catch (err) {
      setFormError('An error occurred while saving your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-[#FAF9F5] border-t border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          style={getDirectionalRevealStyle(headerVisible, headerDir, 0, 24)}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F6B38] mb-3">
            Guest Experiences
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight text-balance">
            Guest Reviews &amp; Testimonials
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Real feedback from our valued guests who have stayed at HOTEL ORA on Main Road Hojai.
          </p>

          {/* Action Row: Write Review & Google Review */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                setSubmissionSuccess(false);
                setIsWriteModalOpen(true);
              }}
              className="px-5 py-3 bg-stone-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-850 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-xs hover:shadow-md"
            >
              <PenSquare className="w-4 h-4 text-[#C5A880]" />
              <span>Write a Review</span>
            </button>

            {settings.googleReviewUrl && (
              <a
                href={settings.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 hover:border-stone-400 hover:text-stone-950 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-xs"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Review on Google</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
            )}
          </div>

          {/* Ratings Summary (if reviews exist) */}
          {reviews.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-stone-200 shadow-xs text-xs text-stone-700">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-stone-950">{averageRating} / 5.0</span>
              <span className="text-stone-400">&bull;</span>
              <span>Based on {reviews.length} guest {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div ref={contentRef}>
          {reviews.length === 0 ? (
            /* Tasteful Authentic Empty State */
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#C5A880]/15 text-[#8F6B38] mx-auto flex items-center justify-center mb-5">
                <MessageSquare className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 font-display mb-2">
                Be the first to share your experience at HOTEL ORA.
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Have you stayed with us in Hojai? Your honest feedback helps future travelers and guides our team in providing exceptional service.
              </p>
              <button
                onClick={() => {
                  setSubmissionSuccess(false);
                  setIsWriteModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C5A880] hover:bg-[#b59870] text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                <PenSquare className="w-4 h-4" />
                <span>Write the First Review</span>
              </button>
            </div>
          ) : (
            /* Approved Reviews Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {reviews.map((rev, index) => {
                const total = reviews.length;
                const staggerDelay =
                  contentDir === 'down'
                    ? index * 90
                    : (total - 1 - index) * 90;

                return (
                  <div
                    key={rev.id}
                    style={getDirectionalRevealStyle(contentVisible, contentDir, staggerDelay, 24)}
                    className={`bg-white rounded-3xl p-6 sm:p-7 border ${
                      rev.featured ? 'border-[#C5A880] ring-1 ring-[#C5A880]/30' : 'border-stone-200/80'
                    } flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group`}
                  >
                    {rev.featured && (
                      <span className="absolute -top-3 right-6 px-3 py-0.5 bg-[#C5A880] text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured Guest</span>
                      </span>
                    )}

                    <div>
                      {/* Rating Stars & Date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-amber-500 gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Review Message */}
                      <p className="text-sm text-stone-700 leading-relaxed mb-6 relative">
                        <Quote className="w-4 h-4 text-[#C5A880]/40 absolute -top-1 -left-2 -z-0 opacity-60" />
                        <span className="relative z-10">&ldquo;{rev.message}&rdquo;</span>
                      </p>
                    </div>

                    {/* Guest Profile Footer */}
                    <div className="pt-4 border-t border-stone-100 flex items-center gap-3.5">
                      {rev.photoUrl ? (
                        <img
                          src={rev.photoUrl}
                          alt={rev.guestName}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 text-[#8F6B38] font-bold text-xs flex items-center justify-center shrink-0">
                          {rev.guestName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-950 truncate">
                          {rev.guestName}
                        </p>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#8F6B38]" />
                          <span>{rev.stayDate ? `Stayed in ${rev.stayDate}` : 'Verified Guest'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Modal Dialog */}
      {isWriteModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsWriteModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 bg-[#FAF9F5]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8F6B38]">
                  HOTEL ORA &bull; Hojai
                </p>
                <h3 className="text-lg font-bold text-stone-950 font-display">
                  Share Your Experience
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200/50 transition-colors"
                aria-label="Close review dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {submissionSuccess ? (
                /* Success Message State */
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 font-display">
                    Review Submitted
                  </h4>
                  <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Thank you for sharing your experience. Your review has been submitted and is awaiting approval.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWriteModalOpen(false)}
                      className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-850 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleFormSubmit} className="space-y-4.5">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      {formError}
                    </div>
                  )}

                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 text-stone-300 hover:scale-110 active:scale-95 transition-transform"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              (hoverRating || rating) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-semibold text-stone-700">
                        {rating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Guest Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-colors"
                    />
                  </div>

                  {/* Stay Date (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Month / Year of Stay (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. October 2026 or Recent stay"
                      value={stayDate}
                      onChange={(e) => setStayDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-colors"
                    />
                  </div>

                  {/* Review Message */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Your Review *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your room comfort, cleanliness, AC cooling, reception service, or overall experience..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-colors resize-none"
                    />
                  </div>

                  {/* Optional Guest Photo */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                      Optional Guest Photo
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors border border-stone-200">
                        <Upload className="w-3.5 h-3.5 text-stone-500" />
                        <span>Upload photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {photoDataUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={photoDataUrl}
                            alt="Preview"
                            className="w-8 h-8 rounded-full object-cover border border-[#C5A880]"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoDataUrl('')}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsWriteModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-stone-950 hover:bg-stone-850 disabled:bg-stone-400 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
