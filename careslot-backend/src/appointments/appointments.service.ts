import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Service } from '../services/service.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}

  async create(data: Partial<Appointment>) {
    const existing = await this.appointmentRepo.findOne({
      where: {
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        doctor_id: data.doctor_id,
      },
    });

    if (existing) {
      throw new BadRequestException('This time slot is already booked for this doctor.');
    }

    const appointment = this.appointmentRepo.create(data);
    return await this.appointmentRepo.save(appointment);
  }

  async findAll() {
    return await this.appointmentRepo.find({
      relations: {
        patient: true,
        doctor: true,
        service: true,
      },
    });
  }

  async getFormData() {
    const doctors = await this.doctorRepo.find();
    const services = await this.serviceRepo.find();
    return { doctors, services };
  }

  // ITO YUNG FUNCTION NA KULANG KANINA
  async updateStatus(id: number, status: string) {
    await this.appointmentRepo.update(id, { status });
    return this.appointmentRepo.findOne({ 
      where: { id }, 
      relations: { patient: true, doctor: true, service: true } 
    });
  }
}