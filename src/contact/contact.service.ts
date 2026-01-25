import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async submit(data: any) {
    // 1️⃣ Save to DB
    const saved = await this.prisma.contact.create({ data });

    // 2️⃣ Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Manah Vigyan" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Inquiry',
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Mobile:</b> ${data.mobile}</p>
        <p><b>Message:</b> ${data.message}</p>
      `,
    });

    return saved;
  }
}
