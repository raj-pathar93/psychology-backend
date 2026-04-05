import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { calendar_v3 } from 'googleapis';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const TZ = 'Asia/Kolkata';

export interface Slot {
  time: string; // "12:00 PM"
  isBooked: boolean;
}

@Injectable()
export class GoogleService {
  private calendar: calendar_v3.Calendar;

  constructor() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      throw new Error('❌ Missing Google credentials in ENV');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getAvailableSlots(date: string): Promise<Slot[]> {
    try {
      // Use IST midnight boundaries, converted to UTC for the API
      const dayStart = dayjs.tz(`${date}T00:00:00`, TZ).toISOString();
      const dayEnd = dayjs.tz(`${date}T23:59:59`, TZ).toISOString();

      const res = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: dayStart,
          timeMax: dayEnd,
          timeZone: TZ,
          items: [{ id: 'primary' }],
        },
      });

      const busy = res?.data?.calendars?.primary.busy ?? [];

      const slots: Slot[] = [];
      const now = dayjs().tz(TZ);

      // Build slots in IST
      let cursor = dayjs.tz(`${date}T12:00:00`, TZ);
      const windowEnd = dayjs.tz(`${date}T18:00:00`, TZ);

      while (cursor.isBefore(windowEnd)) {
        const slotEnd = cursor.add(30, 'minute');

        // Skip slots already in the past (today only)
        const isPast =
          cursor.isBefore(now) && dayjs.tz(date, TZ).isSame(now, 'day');

        if (!isPast) {
          // Compare in UTC — both sides are now proper UTC strings
          const isBooked = busy.some((b) => {
            const busyStart = dayjs(b.start).utc(); // ← convert to UTC
            const busyEnd = dayjs(b.end).utc(); // ← convert to UTC
            const slotStart = cursor.utc(); // ← convert to UTC
            const slotEnd2 = slotEnd.utc(); // ← convert to UTC

            return slotStart.isBefore(busyEnd) && slotEnd2.isAfter(busyStart);
          });

          slots.push({
            time: cursor.format('HH:mm'),
            isBooked,
          });
        }

        cursor = slotEnd;
      }

      return slots;
    } catch (error) {
      console.error('🔥 SLOT ERROR:', error);
      throw error;
    }
  }

  async createBooking(data: {
    date: string;
    time: string;
    email: string;
    name: string;
  }) {
    const { date, time, email, name } = data;

    const [timePart, meridiem] = time.split(' '); // "01:00", "PM"
    const [hours, minutes] = timePart.split(':').map(Number);

    let hours24 = hours;
    if (meridiem === 'PM' && hours !== 12) hours24 = hours + 12;
    if (meridiem === 'AM' && hours === 12) hours24 = 0;

    const start = dayjs.tz(
      `${date}T${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
      TZ,
    );
    const end = start.add(30, 'minute');

    const event = {
      summary: `Session with ${name}`,
      description: `Client: ${name}\nEmail: ${email}`,
      start: { dateTime: start.toISOString(), timeZone: TZ },
      end: { dateTime: end.toISOString(), timeZone: TZ },
      // conferenceData removed — service accounts can't create Meet links
    };

    const res = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      // conferenceDataVersion removed
    });

    return {
      success: true,
      eventId: res.data.id,
      start: res.data.start?.dateTime,
      end: res.data.end?.dateTime,
    };
  }
}
