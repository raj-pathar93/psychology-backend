import { IsString, IsEmail, Matches, MinLength, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit Indian number',
  })
  phone: string;

  @IsString()
  @MinLength(1)
  preferredDate: string;

  @IsString()
  @MinLength(1)
  preferredTime: string;

  @IsOptional()
  @IsString()
  message?: string;
}
