import { Controller, Post, Body } from "@nestjs/common";
import { AppointmentService } from "./appointment.service";

@Controller("appointment")
export class AppointmentController {
  constructor(private service: AppointmentService) {}

  @Post()
  submit(@Body() body: any) {
    return this.service.submit(body);
  }
}
