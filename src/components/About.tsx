import React from 'react';
import { ArrowRight, MapPin, Check } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelConfig';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const About: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible, direction: headerDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: cardRef, isVisible: cardVisible, direction: cardDir } = useScrollReveal({
    threshold: 0.15,
  });

  const confirmedHighlights = [
    'Prime location on Main Road, opposite UCO Bank',
    'Rooms available from ₹800 to ₹1,990 per night',
    '24×7 reception desk for seamless guest assistance',
    'Essential amenities including AC, Wi-Fi, and Room Service',
    'CCTV surveillance and round-the-clock security',
  ];

  const handleContactClick = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          style={getDirectionalRevealStyle(headerVisible, headerDir, 0, 24)}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F6B38] mb-3">
            About HOTEL ORA
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight text-balance">
            Your Stay, Your Space &mdash; Your Story
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Welcome to HOTEL ORA &mdash; a comfortable and convenient place to stay in Hojai. Located on Main Road opposite UCO Bank, HOTEL ORA offers essential modern facilities, attentive service and comfortable accommodation at an affordable price.
          </p>
        </div>

        <div
          ref={cardRef}
          style={getDirectionalRevealStyle(cardVisible, cardDir, 100, 28)}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs"
        >
          <div className="md:col-span-7 space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-display tracking-tight">
              A Hassle-Free Stay in the Heart of Hojai
            </h3>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              Whether you are visiting Hojai for personal travel, family events, or business commitments, our property provides a peaceful haven with dependable facilities. We prioritize hygiene, guest privacy, and 24-hour service to ensure every guest enjoys a restful stay.
            </p>

            <ul className="space-y-3 pt-2">
              {confirmedHighlights.map((highlight, idx) => {
                const itemDelay =
                  cardDir === 'down'
                    ? 140 + idx * 50
                    : 140 + (confirmedHighlights.length - 1 - idx) * 50;

                return (
                  <li
                    key={highlight}
                    style={getDirectionalRevealStyle(cardVisible, cardDir, itemDelay, 14)}
                    className="flex items-start gap-3 text-sm text-stone-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#C5A880]/15 text-[#8F6B38] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                    <span>{highlight}</span>
                  </li>
                );
              })}
            </ul>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={handleContactClick}
                className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-xl hover:bg-stone-850 active:scale-[0.98] transition-all shadow-xs hover:shadow-md flex items-center gap-2"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>

              <a
                href="#location"
                className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors flex items-center gap-1.5 py-3 px-2"
              >
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>View On Map</span>
              </a>
            </div>
          </div>

          <div className="md:col-span-5 bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200/70 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-1">
                At a Glance
              </p>
              <p className="text-lg font-bold text-stone-900 font-display">
                Quick Hotel Information
              </p>

              <div className="mt-6 space-y-4 text-sm divide-y divide-stone-200/60">
                <div className="pt-3 first:pt-0 flex justify-between items-center">
                  <span className="text-stone-500">Location</span>
                  <span className="font-medium text-stone-900 text-right">Opp. UCO Bank, Main Rd</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-stone-500">Nightly Tariff</span>
                  <span className="font-medium text-stone-900 tabular-nums">₹800 &ndash; ₹1,990</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-stone-500">Check-out Time</span>
                  <span className="font-medium text-stone-900">{HOTEL_CONFIG.timings.checkOut}</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-stone-500">Check-in Time</span>
                  <span className="font-medium text-stone-600 italic">To be updated</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-stone-500">Booking Method</span>
                  <span className="font-medium text-[#8F6B38]">Direct via Call & WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200/60 text-xs text-stone-500">
              Direct bookings receive immediate confirmation with zero intermediary fees.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
