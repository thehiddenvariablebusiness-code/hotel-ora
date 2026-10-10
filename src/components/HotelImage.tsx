import React, { useState } from 'react';

interface HotelImageProps {
  src: string;
  alt: string;
  aspectRatio?: '16:9' | '4:3' | '3:2' | '1:1';
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}

export const HotelImage: React.FC<HotelImageProps> = ({
  src,
  alt,
  aspectRatio = '4:3',
  priority = false,
  className = '',
  onClick,
}) => {
  const [loaded, setLoaded] = useState(false);

  const aspectClass = {
    '16:9': 'aspect-[16/9]',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
    '1:1': 'aspect-square',
  }[aspectRatio];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-stone-900 group select-none ${aspectClass} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-stone-950/10 to-transparent pointer-events-none" />
    </div>
  );
};
