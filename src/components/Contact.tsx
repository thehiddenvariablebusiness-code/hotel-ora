import React from 'react';
import { Phone, Mail, MapPin, Clock, LogOut } from 'lucide-react';
import { HOTEL_CONFIG, getWhatsAppBookingUrl } from '../data/hotelConfig';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const Contact: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible, direction: headerDir } = useScrollReveal({
    threshold: 0.15,
  });
  const { ref: gridRef, isVisible: gridVisible, direction: gridDir } = useScrollReveal({
    threshold: 0.1,
  });

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          style={getDirectionalRevealStyle(headerVisible, headerDir, 0, 24)}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F6B38] mb-3">
            Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight text-balance">
            Contact HOTEL ORA
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Have questions about room availability, directions, or booking details? Our front desk is happy to assist you directly.
          </p>
        </div>

        {/* 3 Contact Cards with Bidirectional Repeating Stagger */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Contact Methods */}
          <div
            style={getDirectionalRevealStyle(gridVisible, gridDir, gridDir === 'down' ? 0 : 200, 26)}
            className="bg-[#FAF9F5] rounded-3xl p-8 border border-stone-200/80 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 text-[#8F6B38] flex items-center justify-center mb-6 shadow-xs">
                <Phone className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">
                Voice &amp; WhatsApp
              </p>
              <h3 className="text-xl font-bold text-stone-950 font-display mb-4">
                Phone &amp; WhatsApp
              </h3>
              <div className="space-y-3 text-sm text-stone-600">
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href={HOTEL_CONFIG.contact.telLink} className="text-stone-900 font-semibold hover:underline">
                    {HOTEL_CONFIG.contact.phone}
                  </a>
                </p>
                <p>
                  <strong>WhatsApp:</strong>{' '}
                  <a
                    href={getWhatsAppBookingUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#128C7E] font-semibold hover:underline"
                  >
                    {HOTEL_CONFIG.contact.whatsapp}
                  </a>
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-200/60 flex items-center gap-3">
              <a
                href={HOTEL_CONFIG.contact.telLink}
                className="flex-1 py-2.5 px-3 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider text-center hover:bg-stone-850 transition-colors"
              >
                Call
              </a>
              <a
                href={getWhatsAppBookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 bg-[#25D366] text-white rounded-xl text-xs font-semibold uppercase tracking-wider text-center hover:bg-[#20ba5a] transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Card 2: Email & Location */}
          <div
            style={getDirectionalRevealStyle(gridVisible, gridDir, 100, 26)}
            className="bg-[#FAF9F5] rounded-3xl p-8 border border-stone-200/80 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 text-[#8F6B38] flex items-center justify-center mb-6 shadow-xs">
                <Mail className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">
                Written Inquiries
              </p>
              <h3 className="text-xl font-bold text-stone-950 font-display mb-4">
                Email &amp; Address
              </h3>
              <div className="space-y-3 text-sm text-stone-600">
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:hotelora8@gmail.com"
                    className="text-stone-900 font-medium hover:underline hover:text-[#8F6B38] transition-colors break-all"
                  >
                    hotelora8@gmail.com
                  </a>
                </p>
                <div className="pt-2 text-xs text-stone-700 leading-relaxed space-y-0.5">
                  <p className="font-semibold text-stone-900">HOTEL ORA</p>
                  <p>{HOTEL_CONFIG.location.displayLine1}</p>
                  <p>{HOTEL_CONFIG.location.landmark}</p>
                  <p>{HOTEL_CONFIG.location.city}, Assam {HOTEL_CONFIG.location.pincode}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-200/60">
              <a
                href="mailto:hotelora8@gmail.com"
                className="w-full block py-2.5 px-3 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold uppercase tracking-wider text-center hover:bg-stone-50 hover:border-stone-400 hover:text-stone-950 transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>

          {/* Card 3: Hotel Schedule & Timings */}
          <div
            style={getDirectionalRevealStyle(gridVisible, gridDir, gridDir === 'down' ? 200 : 0, 26)}
            className="bg-[#FAF9F5] rounded-3xl p-8 border border-stone-200/80 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 text-[#8F6B38] flex items-center justify-center mb-6 shadow-xs">
                <Clock className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">
                Stay Schedule
              </p>
              <h3 className="text-xl font-bold text-stone-950 font-display mb-4">
                Check-in &amp; Check-out
              </h3>
              <div className="space-y-3 text-sm divide-y divide-stone-200/60">
                <div className="pt-2 first:pt-0 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <LogOut className="w-4 h-4 text-stone-400" />
                    <span>Check-out:</span>
                  </span>
                  <span className="font-bold text-stone-900">{HOTEL_CONFIG.timings.checkOut}</span>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>Check-in:</span>
                  </span>
                  <span className="font-medium text-stone-600 italic">
                    {HOTEL_CONFIG.timings.checkInDisplay}
                  </span>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-stone-600">Reception Desk:</span>
                  <span className="font-semibold text-[#8F6B38]">{HOTEL_CONFIG.timings.reception}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-200/60 text-xs text-stone-500 text-center">
              Please inform reception if arriving late at night.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
