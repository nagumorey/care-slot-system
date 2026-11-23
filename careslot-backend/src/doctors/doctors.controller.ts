import { Controller, Get, Post, Body } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Doctor } from './doctor.entity';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  async create(@Body() data: Partial<Doctor>) {
    return this.doctorsService.create(data);
  }

  @Get()
  async findAll() {
    return this.doctorsService.findAll();
  }
}