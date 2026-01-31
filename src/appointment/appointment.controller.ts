import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private service: AppointmentService) {}

  @Post()
  submit(@Body(new ValidationPipe()) body: CreateAppointmentDto) {
    return this.service.submit(body);
  }
}

