import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InfoBar } from './components/InfoBar';
import { About } from './components/About';
import { Rooms } from './components/Rooms';
import { Amenities } from './components/Amenities';
import { Gallery } from './components/Gallery';
import { Reviews } from './components/Reviews';
import { Location } from './components/Location';
import { BookingCTA } from './components/BookingCTA';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { BookingModal } from './components/BookingModal';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setAdminModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col font-sans selection:bg-[#C5A880]/30 selection:text-stone-900">
      {/* Sticky Responsive Navigation Bar */}
      <Navbar onOpenBookingModal={() => setBookingModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero onOpenBookingModal={() => setBookingModalOpen(true)} />

        {/* Quick Information Bar */}
        <InfoBar />

        {/* About Section */}
        <About />

        {/* Rooms Section */}
        <Rooms />

        {/* Amenities Section */}
        <Amenities />

        {/* Gallery Section */}
        <Gallery />

        {/* Guest Reviews Section */}
        <Reviews />

        {/* Location Section */}
        <Location />

        {/* Direct Booking CTA Section */}
        <BookingCTA />

        {/* Contact Section */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={() => setAdminModalOpen(true)} />

      {/* Floating Call & WhatsApp Action Buttons */}
      <FloatingActions />

      {/* Direct Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      {/* Staff Review & Gallery Admin Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => {
          setAdminModalOpen(false);
          if (window.location.hash === '#admin') {
            history.replaceState(null, '', ' ');
          }
        }}
      />
    </div>
  );
}
