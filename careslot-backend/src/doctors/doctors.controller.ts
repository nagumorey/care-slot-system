import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // i-adjust kung iba ang folder/filename ng guard mo
import { DoctorsService } from './doctors.service';
import { Doctor } from './doctor.entity';

@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  async create(@Body() data: Partial<Doctor>) {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Request body is required to create a doctor.');
    }
    return this.doctorsService.create(data);
  }

  @Get()
  async findAll() {
    return this.doctorsService.findAll();
  }

  // Naka-place pagkatapos ng @Get() para hindi mag-conflict ang static at dynamic routes
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Doctor>,
  ) {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Update payload cannot be empty.');
    }
    return this.doctorsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }
}