import React from 'react';
import { Clock, Wifi, Wind, BellRing, Sparkles } from 'lucide-react';
import { useScrollReveal, getDirectionalRevealStyle } from '../hooks/useScrollReveal';

export const InfoBar: React.FC = () => {
  const { ref, isVisible, direction } = useScrollReveal({ threshold: 0.15 });

  const highlights = [
    {
      label: 'Tariff',
      value: 'From ₹800',
      detail: 'Up to ₹1,990 / night',
      icon: Sparkles,
    },
    {
      label: 'Front Desk',
      value: '24×7 Reception',
      detail: 'Always at your service',
      icon: Clock,
    },
    {
      label: 'Climate',
      value: 'AC Rooms',
      detail: 'Cool & comfortable',
      icon: Wind,
    },
    {
      label: 'Connectivity',
      value: 'Free Wi-Fi',
      detail: 'Fast & seamless access',
      icon: Wifi,
    },
    {
      label: 'Hospitality',
      value: 'Room Service',
      detail: 'Prompt in-room care',
      icon: BellRing,
    },
  ];

  return (
    <section
      ref={ref}
      style={getDirectionalRevealStyle(isVisible, direction, 0, 20)}
      className="relative z-10 -mt-4 mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm shadow-stone-200/50 p-6 sm:p-7 hover:shadow-md transition-shadow duration-300">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 divide-stone-100 lg:divide-x">
          {highlights.map((item, index) => {
            const IconComponent = item.icon;
            // Directional stagger: 0->4 when scrolling down, 4->0 when scrolling up
            const delay = direction === 'down' ? index * 60 : (highlights.length - 1 - index) * 60;
            return (
              <div
                key={item.value}
                style={getDirectionalRevealStyle(isVisible, direction, delay, 16)}
                className={`flex items-center gap-3.5 ${index > 0 ? 'lg:pl-6' : ''}`}
              >
                <div className="w-11 h-11 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-center shrink-0 text-[#8F6B38] group-hover:bg-[#C5A880]/10 transition-colors">
                  <IconComponent className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                    {item.label}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-stone-900 font-display tracking-tight truncate">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
