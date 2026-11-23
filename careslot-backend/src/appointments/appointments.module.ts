import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './appointment.entity';
import { Doctor } from '../doctors/doctor.entity'; // Idinagdag
import { Service } from '../services/service.entity'; // Idinagdag

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Doctor, Service]) // Idinagdag ang Doctor at Service
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [TypeOrmModule],
})
export class AppointmentsModule {}