// Visit booking on Home (after the hero). Visitors pick any date and a one-hour slot.

/** Days shown as quick buttons; any later date can be picked from the calendar. */
export const bookingDays = 14;

/** One-hour visiting slots, by start hour (24-hour clock, Al Khobar time): 10 AM to 10 PM. */
export const bookingSlots = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

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
