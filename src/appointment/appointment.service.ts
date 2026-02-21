import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
}

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async submit(data: AppointmentData) {
    // Validate input
    if (
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.preferredDate ||
      !data.preferredTime
    ) {
      throw new BadRequestException('All required fields must be provided');
    }

    const saved = await this.prisma.appointment.create({ data });

    // Send Email
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Manah Vigyan" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Appointment Request',
        html: `
          <h3>Appointment Request</h3>
          <p><b>Name:</b> ${data.name}</p>
          <p><b>Email:</b> ${data.email}</p>
          <p><b>Phone:</b> ${data.phone}</p>
          <p><b>Date:</b> ${data.preferredDate}</p>
          <p><b>Time:</b> ${data.preferredTime}</p>
          <p><b>Message:</b> ${data.message || '-'}</p>
        `,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't throw - data is already saved
    }

    return saved;
  }
}
