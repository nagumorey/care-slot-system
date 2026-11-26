import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // palitan ang path kung iba ang location ng guard mo
import { DoctorSchedulesService } from './doctor-schedule.services';
import { DoctorSchedule } from './doctor-schedule.entity';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class DoctorSchedulesController {
  constructor(private readonly schedulesService: DoctorSchedulesService) {}

  @Post()
  create(@Body() body: Partial<DoctorSchedule>) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Request body is required to create a schedule.');
    }
    return this.schedulesService.create(body);
  }

  @Get()
  findAll(@Query('doctorId') doctorId?: string) {
    if (doctorId !== undefined && doctorId !== '') {
      const parsedDoctorId = Number(doctorId);
      if (Number.isNaN(parsedDoctorId)) {
        throw new BadRequestException('doctorId query parameter must be a valid number.');
      }
      return this.schedulesService.findAll(parsedDoctorId);
    }
    return this.schedulesService.findAll(undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<DoctorSchedule>,
  ) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Update payload cannot be empty.');
    }
    return this.schedulesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}