import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { HOTEL_CONFIG, getWhatsAppBookingUrl } from '../data/hotelConfig';

export const FloatingActions: React.FC = () => {
  return (
    <aside
      aria-label="Quick booking actions"
      className="fixed bottom-4 right-4 z-30 flex items-center gap-2 sm:gap-2.5"
    >
      <a
        href={HOTEL_CONFIG.contact.telLink}
        className="flex items-center gap-2 bg-stone-900/95 hover:bg-stone-900 text-white px-3.5 py-2.5 rounded-full shadow-lg border border-stone-700/80 backdrop-blur-xs transition-transform active:scale-95 text-xs font-semibold uppercase tracking-wider"
        aria-label="Call Hotel"
      >
        <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
        <span className="hidden sm:inline">Call {HOTEL_CONFIG.contact.phone}</span>
        <span className="sm:hidden">Call</span>
      </a>

      <a
        href={getWhatsAppBookingUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2.5 rounded-full shadow-lg transition-transform active:scale-95 text-xs font-semibold uppercase tracking-wider"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-white text-transparent" />
        <span className="hidden sm:inline">WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>
    </aside>
  );
};
