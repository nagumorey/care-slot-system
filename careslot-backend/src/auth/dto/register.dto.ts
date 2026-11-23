import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  full_name: string;

  @IsString()
  phone?: string;

  @IsIn(['patient', 'doctor', 'staff', 'admin'])
  role: string;
}