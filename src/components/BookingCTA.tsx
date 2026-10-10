import React, { useState } from 'react';
import { Phone, MessageCircle, Calendar, Users, BedDouble, ArrowRight } from 'lucide-react';
import { HOTEL_CONFIG, getWhatsAppBookingUrl } from '../data/hotelConfig';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const BookingCTA: React.FC = () => {
  const { ref: sectionRef, isVisible, direction } = useScrollReveal({ threshold: 0.15 });

  const [checkInDate, setCheckInDate] = useState('');
  const [nights, setNights] = useState('1');
  const [guestCount, setGuestCount] = useState('2');
  const [preferredRoom, setPreferredRoom] = useState('Any Available Room');

  const handleCustomWhatsAppEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const details = checkInDate
      ? `Check-in: ${checkInDate} (${nights} night${Number(nights) > 1 ? 's' : ''})`
      : 'Upcoming dates';
    const message = `Hello HOTEL ORA, I would like to enquire about room availability for ${details}, for ${guestCount} guest(s). Preferred room: ${preferredRoom}.`;
    const url = `https://wa.me/${HOTEL_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const yDistance = isMobile ? 18 : 28;
  const yOffset = direction === 'down' ? yDistance : -yDistance;

  const headerStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? 'translate3d(0, 0, 0) scale(1)'
      : `translate3d(0, ${yOffset}px, 0) scale(0.98)`,
    transition: isVisible
      ? 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: 'opacity, transform',
  };

  return (
    <section
      id="booking"
      ref={sectionRef}
      className="py-16 sm:py-24 bg-stone-950 text-white relative overflow-hidden"
    >
      {/* Background ambient lighting with subtle floating presence */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A880]/12 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 ease-out" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          style={headerStyle}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C5A880] mb-3">
            Direct Reservations
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-balance">
            Planning Your Stay?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed">
            Book your room directly with HOTEL ORA. Enjoy guaranteed best rates from ₹800/night, immediate confirmation, and personalized service.
          </p>

          {/* Primary Action Buttons with directional sequential appearance */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={HOTEL_CONFIG.contact.telLink}
              style={getDirectionalRevealStyle(isVisible, direction, direction === 'down' ? 180 : 280, 16)}
              className="px-8 py-4 bg-white text-stone-950 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-stone-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center gap-2.5 whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-stone-900" />
              <span>CALL NOW &bull; {HOTEL_CONFIG.contact.phone}</span>
            </a>

            <a
              href={getWhatsAppBookingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={getDirectionalRevealStyle(isVisible, direction, direction === 'down' ? 280 : 180, 16)}
              className="px-8 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center gap-2.5 whitespace-nowrap"
            >
              <MessageCircle className="w-5 h-5 fill-white text-transparent" />
              <span>WHATSAPP</span>
            </a>
          </div>

          <p className="mt-4 text-xs text-stone-400">
            Check-out: {HOTEL_CONFIG.timings.checkOut} &bull; Check-in time: {HOTEL_CONFIG.timings.checkIn}
          </p>
        </div>

        {/* Quick Inquiry Helper with directional elevation */}
        <div
          style={getDirectionalRevealStyle(isVisible, direction, 360, 24)}
          className="max-w-2xl mx-auto bg-stone-900/80 backdrop-blur-md rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h3 className="text-base font-semibold text-white font-display">
              Send Quick Stay Enquiry via WhatsApp
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Select your expected dates below to generate an instant enquiry message.
            </p>
          </div>

          <form onSubmit={handleCustomWhatsAppEnquiry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Expected Arrival Date</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Preferred Room</span>
                  </span>
                </label>
                <select
                  value={preferredRoom}
                  onChange={(e) => setPreferredRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                >
                  <option value="Any Available Room">Any Available Room</option>
                  <option value="AC Guest Room (Tariff: ₹800 – ₹1,990)">AC Guest Room (Tariff: ₹800 – ₹1,990)</option>
                  <option value="Comfort Double Room (Tariff: ₹800 – ₹1,990)">Comfort Double Room (Tariff: ₹800 – ₹1,990)</option>
                  <option value="Spacious Accommodation (Tariff: ₹800 – ₹1,990)">Spacious Accommodation (Tariff: ₹800 – ₹1,990)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Number of Nights</span>
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Number of Guests</span>
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#C5A880] hover:bg-[#b59870] text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              <span>SEND ENQUIRY ON WHATSAPP</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
