import React from 'react';
import { X, Phone, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import { HOTEL_CONFIG, getWhatsAppBookingUrl } from '../data/hotelConfig';
import { HotelLogo } from './HotelLogo';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-3">
            <HotelLogo size="md" showSubtitle={false} />
          </div>
          <p className="text-xs uppercase tracking-wider text-[#8F6B38] font-semibold">
            Direct Reservations
          </p>
          <h3 className="text-2xl font-bold text-stone-950 font-display mt-1">
            Book at {HOTEL_CONFIG.name}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Tariff from ₹800 to ₹1,990 per night. We accept direct bookings via Phone Call and WhatsApp for immediate confirmation.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={HOTEL_CONFIG.contact.telLink}
            className="w-full py-4 px-5 bg-stone-900 text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-stone-850 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Phone className="w-4 h-4 text-[#C5A880]" />
            <span>Call to Book: {HOTEL_CONFIG.contact.phone}</span>
          </a>

          <a
            href={getWhatsAppBookingUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-5 bg-[#25D366] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#20ba5a] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <MessageCircle className="w-5 h-5 fill-white text-transparent" />
            <span>Chat &amp; Book on WhatsApp</span>
          </a>
        </div>

        <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8F6B38]" />
            <span>Check-out: {HOTEL_CONFIG.timings.checkOut}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8F6B38]" />
            <span>24×7 Reception Desk</span>
          </div>
        </div>

        <p className="text-[11px] text-center text-stone-400 mt-4 leading-relaxed">
          Located on Main Road opposite UCO Bank, Hojai, Assam 782436.
          <br />
          Email:{' '}
          <a
            href="mailto:hotelora8@gmail.com"
            className="text-stone-600 underline font-medium hover:text-stone-900 transition-colors"
          >
            hotelora8@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};
