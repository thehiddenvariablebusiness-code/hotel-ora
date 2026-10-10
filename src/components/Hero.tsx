import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { HOTEL_CONFIG, getWhatsAppBookingUrl } from '../data/hotelConfig';
import { HotelImage } from './HotelImage';
import { HotelLogo } from './HotelLogo';

interface HeroProps {
  onOpenBookingModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBookingModal }) => {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 60);

    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleBookNow = () => {
    if (onOpenBookingModal) {
      onOpenBookingModal();
    } else {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const contentTranslate = Math.min(scrollY * 0.16, 45);
  const imageTranslate = Math.min(scrollY * 0.08, 30);
  const heroOpacity = Math.max(0.85, 1 - scrollY / 900);

  return (
    <section
      id="home"
      style={{ opacity: heroOpacity }}
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden transition-opacity duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography & CTAs */}
          <div
            style={{
              transform: `translate3d(0, -${contentTranslate}px, 0)`,
            }}
            className="lg:col-span-7 flex flex-col justify-center will-change-transform"
          >
            {/* Step 1: Location Kicker & Official Logo */}
            <div
              className={`transition-all duration-700 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-stone-500 mb-4">
                <span>Main Road Hojai</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>Assam, India</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-[#A17E4F]">Opp. UCO Bank</span>
              </div>

              <div className="mb-4">
                <HotelLogo size="lg" />
              </div>

              <h1 className="sr-only">{HOTEL_CONFIG.name}</h1>
            </div>

            {/* Step 2: Tagline */}
            <div
              className={`transition-all duration-700 delay-150 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-xl sm:text-2xl font-medium text-[#8F6B38] font-display italic mb-4">
                &ldquo;{HOTEL_CONFIG.tagline}&rdquo;
              </p>
            </div>

            {/* Step 3: Description & General Tariff */}
            <div
              className={`transition-all duration-700 delay-300 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mb-6">
                {HOTEL_CONFIG.subTagline} Experience warm hospitality, clean modern rooms, and peaceful accommodation designed for both short visits and relaxed stays in Assam.
              </p>

              <div className="flex items-baseline gap-2 mb-8 text-stone-900">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">General Tariff:</span>
                <span className="text-2xl font-bold font-display text-stone-950 tabular-nums">
                  {HOTEL_CONFIG.pricing.fromPriceText}
                </span>
                <span className="text-xs text-stone-500">/ night (Tariff: ₹800 – ₹1,990)</span>
              </div>
            </div>

            {/* Step 4: CTA Buttons */}
            <div
              className={`flex flex-wrap items-center gap-3 sm:gap-4 transition-all duration-700 delay-450 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                onClick={handleBookNow}
                className="px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-xl hover:bg-stone-850 active:scale-[0.98] transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
              >
                <span>BOOK NOW</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880] transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href={getWhatsAppBookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-stone-900 bg-white border border-stone-200/90 rounded-xl hover:bg-stone-50 hover:border-stone-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-xs hover:shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WHATSAPP</span>
              </a>

              <a
                href={HOTEL_CONFIG.contact.telLink}
                className="px-4 py-3.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-stone-400" />
                <span>Call {HOTEL_CONFIG.contact.phone}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Real Hotel Exterior Photograph */}
          <div
            style={{
              transform: `translate3d(0, -${imageTranslate}px, 0)`,
            }}
            className="lg:col-span-5 relative will-change-transform"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#C5A880]/20 via-transparent to-stone-200/40 rounded-3xl blur-xl -z-10" />

              <div
                className={`relative shadow-2xl rounded-2xl overflow-hidden border border-stone-200/60 bg-white transition-all duration-1000 ease-out ${
                  mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <HotelImage
                  src="/images/hotel/hotel-exterior.png"
                  alt="HOTEL ORA exterior"
                  aspectRatio="4:3"
                  priority={true}
                  className="w-full"
                />

                {/* Subdued footer strip inside image card */}
                <div className="px-5 py-3.5 bg-stone-900 text-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium">Main Road Hojai (opp. UCO Bank)</span>
                  <span className="text-[#C5A880] tabular-nums font-medium">₹800 to ₹1,990 / night</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
