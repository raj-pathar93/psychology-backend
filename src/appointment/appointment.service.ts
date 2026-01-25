import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as nodemailer from "nodemailer";

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async submit(data: any) {
    const saved = await this.prisma.appointment.create({ data });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Manah Vigyan" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Appointment Request",
      html: `
        <h3>Appointment Request</h3>
        <p><b>Name:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Phone:</b> ${data.phone}</p>
        <p><b>Date:</b> ${data.preferredDate}</p>
        <p><b>Time:</b> ${data.preferredTime}</p>
        <p><b>Message:</b> ${data.message || "-"}</p>
      `,
    });

    return saved;
  }
}
