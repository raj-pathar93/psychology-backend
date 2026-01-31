import { IsString, IsEmail, Matches, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile number must be a valid 10-digit Indian number',
  })
  mobile: string;

  @IsString()
  @MinLength(10)
  message: string;
}
