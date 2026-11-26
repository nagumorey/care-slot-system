import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  full_name: string;

  @IsOptional() // <--- Idinagdag para hindi na required ang phone
  @IsString()
  phone?: string;

  @IsOptional() // <--- Idinagdag para hindi na required ang role
  @IsIn(['patient', 'doctor', 'staff', 'admin'])
  role?: string;
}