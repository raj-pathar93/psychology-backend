import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import dayjs from 'dayjs';

@Injectable()
export class GoogleService {
  private calendar;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  // ✅ GET AVAILABLE SLOTS
  async getAvailableSlots(date: string) {
    const res = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: `${date}T00:00:00Z`,
        timeMax: `${date}T23:59:59Z`,
        timeZone: 'Asia/Kolkata',
        items: [{ id: 'primary' }],
      },
    });

    const busy = res.data.calendars.primary.busy;

    let slots: string[] = [];

    let start = dayjs(date).hour(12).minute(0);
    let end = dayjs(date).hour(18).minute(0);

    const now = dayjs(); // ✅ current time

    while (start.isBefore(end)) {
      const slotEnd = start.add(30, 'minute');

      // ❌ skip past slots (ONLY for today)
      if (start.isBefore(now) && dayjs(date).isSame(now, 'day')) {
        start = slotEnd;
        continue;
      }

      const isBusy = busy.some((b: any) => {
        return start.isBefore(dayjs(b.end)) && slotEnd.isAfter(dayjs(b.start));
      });

      if (!isBusy) {
        slots.push(start.format('hh:mm A'));
      }

      start = slotEnd;
    }

    return slots;
  }

  // ✅ CREATE BOOKING
  async createBooking(data: any) {
    const { date, time, email, name } = data;

    const start = dayjs(`${date} ${time}`);
    const end = start.add(30, 'minute');

    const event = {
      summary: `Session with ${name}`,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [{ email }],
      conferenceData: {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const res = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return res.data;
  }
}
