import React, { useState } from 'react';
import { MapPin, ExternalLink, Copy, Check, Navigation, Building } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelConfig';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const Location: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const { ref: headerRef, isVisible: headerVisible, direction: headerDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: leftRef, isVisible: leftVisible, direction: leftDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: rightRef, isVisible: rightVisible, direction: rightDir } = useScrollReveal({
    threshold: 0.15,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${HOTEL_CONFIG.location.displayLine1}, ${HOTEL_CONFIG.location.landmark}, ${HOTEL_CONFIG.location.city}, Assam ${HOTEL_CONFIG.location.pincode} (${HOTEL_CONFIG.location.resolvedAddress})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const xDist = isMobile ? 14 : 24;
  const yDist = isMobile ? 12 : 20;

  const leftYOffset = leftDir === 'down' ? yDist : -yDist;
  const rightYOffset = rightDir === 'down' ? yDist : -yDist;

  const leftStyle: React.CSSProperties = {
    opacity: leftVisible ? 1 : 0,
    transform: leftVisible ? 'translate3d(0, 0, 0)' : `translate3d(-${xDist}px, ${leftYOffset}px, 0)`,
    transition: leftVisible
      ? 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: 'opacity, transform',
  };

  const rightStyle: React.CSSProperties = {
    opacity: rightVisible ? 1 : 0,
    transform: rightVisible ? 'translate3d(0, 0, 0)' : `translate3d(${xDist}px, ${rightYOffset}px, 0)`,
    transition: rightVisible
      ? 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 90ms, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 90ms'
      : 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: 'opacity, transform',
  };

  return (
    <section id="location" className="py-16 sm:py-24 bg-[#FAF9F5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          style={getDirectionalRevealStyle(headerVisible, headerDir, 0, 24)}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F6B38] mb-3">
            Prime Accessibility
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight text-balance">
            Find HOTEL ORA
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Conveniently situated on the prominent Main Road corridor in Hojai, right opposite UCO Bank for quick recognition.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Address & Direction Card */}
          <div
            ref={leftRef}
            style={leftStyle}
            className="lg:col-span-5 bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C5A880]/15 text-[#8F6B38] flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" strokeWidth={1.8} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Hotel Address
              </p>
              <h3 className="text-2xl font-bold text-stone-950 font-display tracking-tight mb-4">
                Main Road Hojai
              </h3>

              <div className="space-y-3 text-stone-600 text-sm leading-relaxed mb-6">
                <p className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-[#8F6B38] shrink-0 mt-0.5" />
                  <span>
                    <strong>Landmark:</strong> Opp. UCO Bank
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-[#8F6B38] shrink-0 mt-0.5" />
                  <span>
                    <strong>Postal Address:</strong> Main Road, Opp. UCO Bank, Hojai, Assam 782436
                  </span>
                </p>
                <p className="text-xs text-stone-500 pt-1">
                  <strong>Resolved Location:</strong> {HOTEL_CONFIG.location.resolvedAddress}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-900">Address for Taxis / Auto:</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[#8F6B38] hover:text-[#73542a] font-medium transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[11px] text-stone-800 bg-white p-2.5 rounded-lg border border-stone-200 select-all leading-relaxed">
                  Main Road Hojai (opp. UCO Bank), Hojai, Assam 782436
                </p>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-stone-100 flex flex-col gap-3">
              <a
                href={HOTEL_CONFIG.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-850 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md"
              >
                <span>OPEN IN GOOGLE MAPS</span>
                <ExternalLink className="w-4 h-4 text-[#C5A880]" />
              </a>
              <p className="text-[11px] text-center text-stone-400">
                Official Google Maps pin: {HOTEL_CONFIG.location.resolvedAddress}
              </p>
            </div>
          </div>

          {/* Map Visual Card linking to Google Maps */}
          <div
            ref={rightRef}
            style={rightStyle}
            className="lg:col-span-7 bg-white rounded-3xl p-3 border border-stone-200/80 shadow-xs flex flex-col"
          >
            <div className="relative flex-1 min-h-[360px] rounded-2xl bg-stone-900 overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-stone-100 select-none">
              {/* Subtle road grid pattern simulating a map texture */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#C5A880 1px, transparent 1px), linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)',
                  backgroundSize: '24px 24px, 72px 72px, 72px 72px',
                }}
              />

              {/* Ambient radial accent */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Top map header */}
              <div className="relative z-10 flex items-center justify-between text-xs tracking-wider uppercase text-stone-400">
                <span className="flex items-center gap-1.5 text-[#C5A880] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                  Main Road Hojai
                </span>
                <span className="text-stone-400 text-[11px]">Pin: 782436</span>
              </div>

              {/* Center Map Pin representation */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center py-6">
                <a
                  href={HOTEL_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/pin flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#C5A880] text-stone-950 flex items-center justify-center shadow-xl animate-bounce duration-1000 group-hover/pin:scale-110 transition-transform">
                    <MapPin className="w-8 h-8 fill-stone-950 text-stone-950" />
                  </div>
                  <div className="w-8 h-2 bg-black/40 rounded-full mx-auto blur-xs mt-1" />

                  <div className="mt-4 bg-stone-900/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-stone-700/80 shadow-lg group-hover/pin:border-[#C5A880] transition-colors">
                    <p className="text-base font-bold text-white font-display">
                      HOTEL ORA
                    </p>
                    <p className="text-xs text-[#C5A880] mt-0.5">
                      Main Road Hojai (opp. UCO Bank)
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      706, J. K. Kedia Rd, Hojai, Assam 782436
                    </p>
                  </div>
                </a>
              </div>

              {/* Bottom map action strip */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                <span>Verified Google Maps Listing</span>
                <a
                  href={HOTEL_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>OPEN IN GOOGLE MAPS</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
