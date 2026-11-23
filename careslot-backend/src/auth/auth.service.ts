import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(body: any) {
    const existing = await this.usersService.findByEmail(body.email);
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const newUser = await this.usersService.create({
      email: body.email,
      password_hash: hashedPassword,
      full_name: body.full_name,
      role: body.role || 'patient',
    });

    const token = this.jwtService.sign({ id: newUser.id, email: newUser.email, role: newUser.role });
    return { message: 'Registration successful', token, user: { id: newUser.id, email: newUser.email, role: newUser.role } };
  }

  async login(body: any) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(body.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return { message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role } };
  }
}