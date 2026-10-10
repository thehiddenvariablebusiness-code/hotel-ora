import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { HOTEL_CONFIG, getWhatsAppBookingUrl } from '../data/hotelConfig';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useActiveSection } from '../hooks/useActiveSection';
import { HotelLogo } from './HotelLogo';

interface NavbarProps {
  onOpenBookingModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBookingModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollProgress = useScrollProgress();

  const navLinks = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'rooms', label: 'Rooms', href: '#rooms' },
    { id: 'amenities', label: 'Amenities', href: '#amenities' },
    { id: 'gallery', label: 'Gallery', href: '#gallery' },
    { id: 'reviews', label: 'Reviews', href: '#reviews' },
    { id: 'location', label: 'Location', href: '#location' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  const sectionIds = navLinks.map((link) => link.id);
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = () => {
    if (onOpenBookingModal) {
      onOpenBookingModal();
    } else {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 84;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-[#FAF9F5]/90 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-2.5 sm:py-3'
          : 'bg-transparent py-3.5 sm:py-4.5'
      }`}
    >
      {/* Subtle Scroll Progress Indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] bg-stone-200/30 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-[#C5A880] to-[#DFBA73] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 lg:gap-8">
          {/* Zone 1: Official Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="whitespace-nowrap shrink-0 flex items-center"
            aria-label="HOTEL ORA Home"
          >
            <HotelLogo size="navbar" showSubtitle={true} />
          </a>

          {/* Zone 2: Navigation Links (HOME, ABOUT, ROOMS, AMENITIES, GALLERY, LOCATION, CONTACT) */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`whitespace-nowrap shrink-0 relative py-1.5 transition-colors duration-200 ${
                    isActive
                      ? 'text-stone-950 font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="uppercase text-xs tracking-wider font-semibold">{link.label}</span>
                  {/* Subtle active indicator bar */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5A880] rounded-full transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={handleBookNow}
              className="px-5 py-2.5 text-xs font-semibold tracking-wide uppercase text-white bg-stone-900 rounded-lg hover:bg-stone-850 active:scale-[0.98] transition-all shadow-xs hover:shadow-md whitespace-nowrap shrink-0"
            >
              BOOK NOW
            </button>
          </div>

          {/* Mobile hamburger trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={handleBookNow}
              className="sm:hidden px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase text-white bg-stone-900 rounded-md whitespace-nowrap shadow-xs"
            >
              BOOK
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F5] border-b border-stone-200 px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 pb-4">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-sm py-2 border-b border-stone-100 flex items-center justify-between uppercase tracking-wider ${
                    isActive
                      ? 'text-stone-950 font-bold'
                      : 'text-stone-700 font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <a
              href={HOTEL_CONFIG.contact.telLink}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 rounded-lg text-xs font-medium text-stone-800 hover:bg-stone-200 transition-colors"
            >
              <Phone className="w-4 h-4 text-stone-700" />
              <span>Call Us</span>
            </a>
            <a
              href={getWhatsAppBookingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366]/10 text-[#128C7E] rounded-lg text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#128C7E]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
