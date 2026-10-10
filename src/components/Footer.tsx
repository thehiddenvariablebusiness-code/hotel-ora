import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelConfig';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';
import { HotelLogo } from './HotelLogo';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { ref, isVisible, direction } = useScrollReveal({ threshold: 0.1 });

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Location', href: '#location' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer
      ref={ref}
      style={getDirectionalRevealStyle(isVisible, direction, 0, 16)}
      className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-850"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-850">
          {/* Brand & Official Logo */}
          <div className="md:col-span-5 space-y-4">
            <HotelLogo size="footer" theme="dark" showSubtitle={true} />

            <p className="text-sm font-medium text-[#C5A880] italic font-display">
              &ldquo;{HOTEL_CONFIG.tagline}&rdquo;
            </p>

            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Comfortable, clean, and secure hotel accommodation in Hojai, Assam. Providing essential modern facilities, AC rooms, and 24×7 reception at an affordable rate.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Quick Links
            </p>
            <ul className="space-y-2.5 text-xs text-stone-400">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors hover:underline underline-offset-4 uppercase tracking-wider"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contact Info */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Contact
            </p>
            <div className="space-y-3 text-xs text-stone-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <a href={HOTEL_CONFIG.contact.telLink} className="hover:text-white transition-colors">
                  {HOTEL_CONFIG.contact.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <a
                  href="mailto:hotelora8@gmail.com"
                  className="hover:text-white transition-colors break-all hover:underline underline-offset-2"
                >
                  hotelora8@gmail.com
                </a>
              </p>
              <p className="flex items-start gap-2 pt-1 text-stone-400 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                <span>{HOTEL_CONFIG.location.displayLine1} ({HOTEL_CONFIG.location.landmark}), {HOTEL_CONFIG.location.city}, Assam {HOTEL_CONFIG.location.pincode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 {HOTEL_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Hojai, Assam 782436, India &bull; Direct Booking via Call &amp; WhatsApp</span>
            {onOpenAdmin && (
              <>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="hover:text-stone-300 transition-colors underline-offset-2 hover:underline cursor-pointer"
                >
                  Staff Portal
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
