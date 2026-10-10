import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { HOTEL_CONFIG, GalleryItem, getWhatsAppBookingUrl } from '../data/hotelConfig';
import { HotelImage } from './HotelImage';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const Gallery: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible, direction: headerDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: gridRef, isVisible: gridVisible, direction: gridDir } = useScrollReveal({
    threshold: 0.1,
  });

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const categories: Array<'ALL' | 'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR'> = [
    'ALL',
    'EXTERIOR',
    'RECEPTION',
    'ROOMS',
    'INTERIOR',
  ];

  const filteredItems = useMemo(() => {
    if (activeCategory === 'ALL') return HOTEL_CONFIG.gallery;
    return HOTEL_CONFIG.gallery.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filteredItems.length);
  }, [selectedIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filteredItems.length) % filteredItems.length);
  }, [selectedIndex, filteredItems.length]);

  const handleClose = () => {
    setSelectedIndex(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  const currentItem: GalleryItem | null =
    selectedIndex !== null && filteredItems[selectedIndex] ? filteredItems[selectedIndex] : null;

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-white border-t border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          style={getDirectionalRevealStyle(headerVisible, headerDir, 0, 24)}
          className="max-w-3xl mx-auto text-center mb-10 sm:mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F6B38] mb-3">
            Real Photography
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight text-balance">
            HOTEL ORA Photo Gallery
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Take a visual tour of HOTEL ORA in Hojai. Clean rooms, comfortable interiors, and 24×7 reception desk.
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid with 7 Real Photographs and Bidirectional Repeating Reveal */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => {
            const total = filteredItems.length;
            const staggerDelay =
              gridDir === 'down'
                ? idx * 80
                : (total - 1 - idx) * 80;

            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const yDistance = isMobile ? 16 : 24;
            const yOffset = gridDir === 'down' ? yDistance : -yDistance;

            const cardStyle: React.CSSProperties = {
              opacity: gridVisible ? 1 : 0,
              transform: gridVisible
                ? 'translate3d(0, 0, 0) scale(1)'
                : `translate3d(0, ${yOffset}px, 0) scale(0.97)`,
              transition: gridVisible
                ? `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}ms`
                : 'opacity 0.25s ease-out, transform 0.25s ease-out',
              willChange: 'opacity, transform',
            };

            return (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                style={cardStyle}
                className="cursor-pointer group relative bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 ease-out"
              >
                <div className="overflow-hidden transition-transform duration-700 ease-out group-hover:scale-105">
                  <HotelImage
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    aspectRatio="4:3"
                    className="w-full"
                  />
                </div>

                {/* Subdued Bottom Caption on Card */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent pointer-events-none text-white">
                  <p className="text-xs font-semibold tracking-wide">{item.title}</p>
                  <p className="text-[11px] text-stone-300">{item.subtitle}</p>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                  <span className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-xs text-xs font-semibold text-stone-900 flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Image</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Modal with Real Photo Display */}
      {currentItem && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 text-stone-300">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
                  HOTEL ORA &bull; {currentItem.category}
                </span>
                <span className="text-stone-600">·</span>
                <span className="text-xs text-stone-400">
                  {selectedIndex! + 1} of {filteredItems.length}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-850 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <div className="relative rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center min-h-[280px] max-h-[70vh]">
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.imageAlt}
                  loading="eager"
                  decoding="async"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                />

                {/* Prev / Next buttons */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-850 text-white backdrop-blur-xs border border-stone-700/60 transition-transform active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-850 text-white backdrop-blur-xs border border-stone-700/60 transition-transform active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Information below image */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {currentItem.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    {currentItem.description}
                  </p>
                </div>

                <a
                  href={getWhatsAppBookingUrl(
                    `Hello HOTEL ORA, I am interested in inquiring about ${currentItem.title} availability.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#C5A880] hover:bg-[#b59870] text-stone-950 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-auto shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-stone-950" />
                  <span>Enquire on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
