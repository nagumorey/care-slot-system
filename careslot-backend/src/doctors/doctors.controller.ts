import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  // IDINAGDAG DITO PARA TAMA ANG ORDER
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Doctor>) {
    return this.doctorsService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }
}