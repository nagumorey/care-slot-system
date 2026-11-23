import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './appointment.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Body() data: Partial<Appointment>) {
    return this.appointmentsService.create(data);
  }

  @Get()
  async findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('form-data')
  async getFormData() {
    return this.appointmentsService.getFormData();
  }

  // BAGONG ROUTE PARA SA STATUS UPDATE
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.appointmentsService.updateStatus(+id, status);
  }
}