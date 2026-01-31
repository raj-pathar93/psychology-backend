import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  submit(@Body(new ValidationPipe()) body: CreateContactDto) {
    return this.service.submit(body);
  }
}

