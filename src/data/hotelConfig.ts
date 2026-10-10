/**
 * HOTEL ORA Configuration & Business Data
 *
 * Centralized configuration file for HOTEL ORA.
 * Uses real uploaded assets from /public/images/hotel/
 */

export interface RoomEntry {
  id: string;
  title: string;
  tariffDisplay: string;
  description: string;
  facilities: string[];
  imageUrl: string;
  imageAlt: string;
  officialCategoryName?: string;
  confirmedPrice?: number;
  isConfirmedCategory?: boolean;
}

export interface AmenityItem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: 'Wifi' | 'AirVent' | 'BellRing' | 'Clock' | 'ShieldCheck';
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'EXTERIOR' | 'RECEPTION' | 'ROOMS' | 'INTERIOR';
  imageUrl: string;
  imageAlt: string;
  description: string;
}

export const HOTEL_CONFIG = {
  name: 'HOTEL ORA',
  legalName: 'HOTEL ORA',
  tagline: 'Your stay, your space - Your story',
  subTagline: 'Comfortable stays in the heart of Hojai.',
  logoUrl: '/images/hotel/hotel-ora-logo.svg',

  location: {
    displayLine1: 'Main Road Hojai',
    landmark: 'Opp. UCO Bank',
    city: 'Hojai',
    state: 'Assam',
    pincode: '782436',
    resolvedAddress: '706, J. K. Kedia Rd, Hojai, Assam 782436',
    formattedAddress: 'Main Road Hojai, Opp. UCO Bank, Hojai, Assam 782436',
    googleMapsUrl: 'https://maps.app.goo.gl/bpvy68N4bjsptSCz6?g_st=aw',
  },

  contact: {
    phone: '9282484800',
    phoneFormatted: '+91 92824 84800',
    telLink: 'tel:+919282484800',
    whatsapp: '9282484800',
    whatsappCountryCode: '91',
    whatsappNumber: '919282484800',
    email: 'hotelora8@gmail.com',
    mailtoLink: 'mailto:hotelora8@gmail.com',
  },

  timings: {
    checkOut: '12:00 PM',
    checkIn: 'To be updated',
    checkInDisplay: 'Check-in time: To be updated',
    reception: '24×7 Reception Available',
  },

  pricing: {
    minPrice: 800,
    maxPrice: 1990,
    currencySymbol: '₹',
    displayRange: '₹800 to ₹1,990',
    fromPriceText: 'Rooms from ₹800',
  },

  whatsappMessages: {
    generalEnquiry: 'Hello HOTEL ORA, I would like to enquire about room availability and booking.',
    roomEnquiry: (roomTitle: string, tariff: string) =>
      `Hello HOTEL ORA, I would like to enquire about booking ${roomTitle} (${tariff}). Could you please share current availability?`,
    customDatesEnquiry: (dates: string, guests: string, roomType: string) =>
      `Hello HOTEL ORA, I would like to enquire about room availability for ${dates} (${guests} guests, preferred: ${roomType}).`,
  },

  // Rooms using real hotel room photographs
  rooms: [
    {
      id: 'room-1',
      title: 'AC Guest Room',
      tariffDisplay: 'Tariff: ₹800 – ₹1,990',
      description: 'Comfortable air-conditioned room featuring fresh bedding, quiet atmosphere, and prompt room service.',
      facilities: ['Air Conditioning (AC)', 'Free Wi-Fi', 'Room Service', '24×7 Reception'],
      imageUrl: '/images/hotel/hotel-room-1.png',
      imageAlt: 'HOTEL ORA room',
      isConfirmedCategory: false,
    },
    {
      id: 'room-2',
      title: 'Comfort Double Room',
      tariffDisplay: 'Tariff: ₹800 – ₹1,990',
      description: 'Well-maintained guest room with clean linens, attached bath facilities, and secure surroundings.',
      facilities: ['Air Conditioning (AC)', 'Free Wi-Fi', 'Room Service', 'CCTV Security'],
      imageUrl: '/images/hotel/hotel-room-2.png',
      imageAlt: 'HOTEL ORA room',
      isConfirmedCategory: false,
    },
    {
      id: 'room-3',
      title: 'Spacious Accommodation',
      tariffDisplay: 'Tariff: ₹800 – ₹1,990',
      description: 'Peaceful room tailored for comfortable individual or family stays on Main Road Hojai.',
      facilities: ['Air Conditioning (AC)', 'Free Wi-Fi', 'Room Service', '24×7 Reception'],
      imageUrl: '/images/hotel/hotel-room-3.png',
      imageAlt: 'HOTEL ORA room',
      isConfirmedCategory: false,
    },
  ] as RoomEntry[],

  // Confirmed Facilities only
  amenities: [
    {
      id: 'wifi',
      name: 'Free Wi-Fi',
      shortName: 'Free Wi-Fi',
      description: 'Reliable high-speed internet connection across all rooms and public areas.',
      icon: 'Wifi',
    },
    {
      id: 'ac',
      name: 'AC Rooms',
      shortName: 'AC Rooms',
      description: 'Individual room air conditioning ensuring cool, comfortable stays in Assam.',
      icon: 'AirVent',
    },
    {
      id: 'room-service',
      name: 'Room Service',
      shortName: 'Room Service',
      description: 'Attentive in-room hospitality service delivering refreshment and assistance.',
      icon: 'BellRing',
    },
    {
      id: 'reception',
      name: '24×7 Reception',
      shortName: '24×7 Reception',
      description: 'Round-the-clock front desk team available day and night to assist guests.',
      icon: 'Clock',
    },
    {
      id: 'security',
      name: 'CCTV / Security',
      shortName: 'CCTV / Security',
      description: 'Continuous premise surveillance and security monitoring for peace of mind.',
      icon: 'ShieldCheck',
    },
  ] as AmenityItem[],

  // Gallery using all 7 real HOTEL ORA photographs
  gallery: [
    {
      id: 'gal-exterior',
      title: 'Hotel Exterior',
      subtitle: 'Main Road Hojai',
      category: 'EXTERIOR',
      imageUrl: '/images/hotel/hotel-exterior.png',
      imageAlt: 'HOTEL ORA exterior',
      description: 'Street-level exterior view of HOTEL ORA located on Main Road Hojai, opposite UCO Bank.',
    },
    {
      id: 'gal-reception',
      title: 'Hotel Reception',
      subtitle: '24×7 Front Desk',
      category: 'RECEPTION',
      imageUrl: '/images/hotel/hotel-reception.png',
      imageAlt: 'HOTEL ORA reception',
      description: 'Welcoming front desk reception desk with official HOTEL ORA signage for check-in and assistance.',
    },
    {
      id: 'gal-room-1',
      title: 'Guest Room (View 1)',
      subtitle: 'Clean & Comfortable',
      category: 'ROOMS',
      imageUrl: '/images/hotel/hotel-room-1.png',
      imageAlt: 'HOTEL ORA room',
      description: 'Neat guest room with air conditioning, crisp bedding, and peaceful atmosphere.',
    },
    {
      id: 'gal-room-2',
      title: 'Guest Room (View 2)',
      subtitle: 'Double Bed Accommodation',
      category: 'ROOMS',
      imageUrl: '/images/hotel/hotel-room-2.png',
      imageAlt: 'HOTEL ORA room',
      description: 'Comfortable guest bedroom arranged for business travelers and visiting families.',
    },
    {
      id: 'gal-room-3',
      title: 'Guest Room (View 3)',
      subtitle: 'Restful Ambiance',
      category: 'ROOMS',
      imageUrl: '/images/hotel/hotel-room-3.png',
      imageAlt: 'HOTEL ORA room',
      description: 'Hygienic and well-ventilated guest room with essential amenities.',
    },
    {
      id: 'gal-corridor-1',
      title: 'Corridor & Passageway',
      subtitle: 'CCTV Monitored',
      category: 'INTERIOR',
      imageUrl: '/images/hotel/hotel-corridor-1.png',
      imageAlt: 'HOTEL ORA corridor',
      description: 'Clean interior hallways with round-the-clock security surveillance and bright lighting.',
    },
    {
      id: 'gal-corridor-2',
      title: 'Interior Corridor View',
      subtitle: 'Well-Maintained Spaces',
      category: 'INTERIOR',
      imageUrl: '/images/hotel/hotel-corridor-2.png',
      imageAlt: 'HOTEL ORA corridor',
      description: 'Clean indoor circulation area connecting floors and guest rooms.',
    },
  ] as GalleryItem[],
};

export function getWhatsAppBookingUrl(customMessage?: string): string {
  const msg = customMessage || HOTEL_CONFIG.whatsappMessages.generalEnquiry;
  return `https://wa.me/${HOTEL_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}
