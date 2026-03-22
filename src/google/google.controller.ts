import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { GoogleService } from './google.service';

@Controller()
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('slots')
  getSlots(@Query('date') date: string) {
    return this.googleService.getAvailableSlots(date);
  }

  @Post('book')
  book(@Body() body: any) {
    return this.googleService.createBooking(body);
  }
}
