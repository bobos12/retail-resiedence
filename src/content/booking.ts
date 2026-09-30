// Visit booking on Home (after the hero). Visitors pick any date and any time of day.

/** Days shown as quick buttons; any later date can be picked from the calendar. */
export const bookingDays = 14;

/** Minute steps offered after the hour. */
export const bookingMinutes = ['00', '15', '30', '45'];

/** What a visitor can ask to see. Labels live in messages (home.booking.interests.*). */
export const bookingInterests = ['apartment', 'town-villa', 'executive-villa', 'clubhouse'] as const;
export type BookingInterest = (typeof bookingInterests)[number];

/** English names used in the WhatsApp message, so the team always reads the same words. */
export const bookingInterestNames: Record<BookingInterest, string> = {
  apartment: 'Apartments',
  'town-villa': 'Town villas',
  'executive-villa': 'Executive villas',
  clubhouse: 'The Clubhouse',
};

/** The company WhatsApp number that receives bookings (international format, digits only). */
export const bookingWhatsApp = '966562416136';
