import React from 'react';
import { Wifi, Wind, BellRing, Clock, ShieldCheck } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelConfig';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const Amenities: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible, direction: headerDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: gridRef, isVisible: gridVisible, direction: gridDir } = useScrollReveal({
    threshold: 0.1,
  });

  const iconMap: Record<string, React.ElementType> = {
    Wifi,
    AirVent: Wind,
    BellRing,
    Clock,
    ShieldCheck,
  };

  return (
    <section id="amenities" className="py-16 sm:py-24 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          style={getDirectionalRevealStyle(headerVisible, headerDir, 0, 24)}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F6B38] mb-3">
            Hotel Facilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight text-balance">
            Everything You Need for a Comfortable Stay
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Thoughtfully provided amenities designed to give every guest a seamless, peaceful, and secure experience in Hojai.
          </p>
        </div>

        {/* 5 Distinct Cards Grid with Bidirectional Staggered Entrance:
            Scrolling DOWN: enters from below (Card 1 -> 5)
            Scrolling UP: enters from above (Card 5 -> 1) */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {HOTEL_CONFIG.amenities.map((amenity, index) => {
            const Icon = iconMap[amenity.icon] || ShieldCheck;
            const total = HOTEL_CONFIG.amenities.length;
            const staggerDelay =
              gridDir === 'down'
                ? index * 75
                : (total - 1 - index) * 75;

            return (
              <div
                key={amenity.id}
                style={getDirectionalRevealStyle(gridVisible, gridDir, staggerDelay, 26)}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 flex flex-col justify-between hover:border-[#C5A880]/80 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-350 ease-out group"
              >
                <div>
                  {/* Clean line-style icon with hover scale */}
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-stone-200/80 flex items-center justify-center text-[#8F6B38] group-hover:bg-[#C5A880] group-hover:text-white group-hover:scale-105 group-hover:shadow-md transition-all duration-300 mb-6 shadow-xs">
                    <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.6} />
                  </div>

                  <p className="text-xs font-semibold tracking-wider uppercase text-stone-400 mb-1 group-hover:text-[#8F6B38] transition-colors duration-200">
                    0{index + 1}
                  </p>

                  <h3 className="text-lg font-bold text-stone-950 font-display tracking-tight mb-2 group-hover:text-stone-950 transition-colors">
                    {amenity.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {amenity.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100 flex items-center text-xs font-medium text-[#8F6B38] group-hover:text-[#74552b] transition-colors">
                  <span>Included in every stay</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
