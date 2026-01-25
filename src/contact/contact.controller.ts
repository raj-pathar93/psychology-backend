import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  submit(@Body() body: any) {
    return this.service.submit(body);
  }
}
