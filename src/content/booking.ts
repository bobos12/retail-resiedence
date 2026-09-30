// Visit booking on Home (after the hero). Edit the visiting times or the booking window here.

/** Visiting times offered each day, 24-hour, Al Khobar time. */
export const bookingSlots = ['10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00'];

/** How many days ahead can be booked, starting today. */
export const bookingDays = 14;

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
