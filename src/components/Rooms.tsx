import React from 'react';
import { MessageCircle, Check, Sparkles } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelConfig';
import { HotelImage } from './HotelImage';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const Rooms: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible, direction: headerDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: gridRef, isVisible: gridVisible, direction: gridDir } = useScrollReveal({
    threshold: 0.1,
  });

  return (
    <section id="rooms" className="py-16 sm:py-24 bg-white border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          style={getDirectionalRevealStyle(headerVisible, headerDir, 0, 24)}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F6B38] mb-3">
            Accommodation
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight text-balance">
            Rooms at HOTEL ORA
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Comfortable rooms designed for a convenient stay in Hojai.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold">
            <span>Tariff: {HOTEL_CONFIG.pricing.displayRange} per night</span>
          </div>
        </div>

        {/* Room Cards Grid with Directional Repeating Stagger:
            Scrolling DOWN: Card 1 -> Card 2 -> Card 3
            Scrolling UP: Card 3 -> Card 2 -> Card 1 */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {HOTEL_CONFIG.rooms.map((room, index) => {
            const whatsappUrl = `https://wa.me/${HOTEL_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(
              HOTEL_CONFIG.whatsappMessages.roomEnquiry(room.title, room.tariffDisplay)
            )}`;

            const totalCards = HOTEL_CONFIG.rooms.length;
            const staggerDelay =
              gridDir === 'down'
                ? index * 100
                : (totalCards - 1 - index) * 100;

            return (
              <div
                key={room.id}
                style={getDirectionalRevealStyle(gridVisible, gridDir, staggerDelay, 30)}
                className="bg-[#FAF9F5] rounded-3xl border border-stone-200/80 overflow-hidden flex flex-col justify-between card-hover-lift group"
              >
                <div>
                  {/* Real Room Photo */}
                  <div className="p-3 pb-0 overflow-hidden rounded-t-3xl">
                    <div className="overflow-hidden rounded-2xl transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                      <HotelImage
                        src={room.imageUrl}
                        alt={room.imageAlt}
                        aspectRatio="4:3"
                        className="w-full shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <span className="font-medium text-stone-500">HOTEL ORA Room</span>
                      <span className="text-[#8F6B38] font-semibold tabular-nums">
                        {room.tariffDisplay}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-stone-950 font-display tracking-tight mb-2 group-hover:text-[#8F6B38] transition-colors duration-200">
                      {room.title}
                    </h3>

                    <p className="text-sm text-stone-600 leading-relaxed mb-6">
                      {room.description}
                    </p>

                    {/* Room Facilities */}
                    <div className="space-y-2 pt-4 border-t border-stone-200/70">
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                        Key Inclusions:
                      </p>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {room.facilities.map((fac) => (
                          <li key={fac} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#8F6B38] shrink-0" strokeWidth={2.5} />
                            <span>{fac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-6 pt-0">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#8F6B38] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Enquire on WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note for Custom Stay Requests & Easy Configuration */}
        <div className="mt-12 p-6 bg-stone-50 rounded-2xl border border-stone-200/70 max-w-2xl mx-auto text-center hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8F6B38] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Room Booking &amp; Extended Stays</span>
          </div>
          <p className="text-xs text-stone-600">
            For current room availability and reservations in Hojai, call our front desk directly at{' '}
            <a href={HOTEL_CONFIG.contact.telLink} className="font-semibold text-stone-900 underline underline-offset-2">
              {HOTEL_CONFIG.contact.phoneFormatted}
            </a>{' '}
            or WhatsApp{' '}
            <a href={HOTEL_CONFIG.contact.telLink} className="font-semibold text-stone-900 underline underline-offset-2">
              {HOTEL_CONFIG.contact.phone}
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
};
