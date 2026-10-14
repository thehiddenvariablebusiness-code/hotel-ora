import React from 'react';

interface HotelLogoProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'navbar' | 'footer';
  showSubtitle?: boolean;
}

export const HotelLogo: React.FC<HotelLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const heightClass = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-16 sm:h-20',
    navbar: 'h-[48px] sm:h-[52px] lg:h-[60px]',
    footer: 'h-[50px] sm:h-[56px]',
  }[size];

  return (
    <div className={`flex items-center select-none group ${className}`}>
      <img
        src="/images/hotel/hotel-ora-logo.svg"
        alt="HOTEL ORA - Hotel in Hojai, Assam"
        className={`${heightClass} w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-[1.02]`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
