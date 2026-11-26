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
} from '@nestjs/common';
import { DoctorSchedulesService } from './doctor-schedule.services';
import { DoctorSchedule } from './doctor-schedule.entity';

@Controller('schedules')
export class DoctorSchedulesController {
  constructor(private readonly schedulesService: DoctorSchedulesService) {}

  @Post()
  create(@Body() body: Partial<DoctorSchedule>) {
    return this.schedulesService.create(body);
  }

  @Get()
  findAll(@Query('doctorId') doctorId?: string) {
    return this.schedulesService.findAll(doctorId ? Number(doctorId) : undefined);
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
    return this.schedulesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}