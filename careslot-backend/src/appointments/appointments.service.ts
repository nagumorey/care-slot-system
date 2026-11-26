import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Service } from '../services/service.entity';
import { DoctorSchedule } from '../doctor-schedules/doctor-schedule.entity';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function toHHMM(timeStr?: string | null): string {
  return String(timeStr || '').slice(0, 5);
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepo: Repository<DoctorSchedule>,
  ) {}

  async create(data: Partial<Appointment> & { doctor_id?: number }) {
    const doctorId =
      data.doctor_id ?? (data.doctor as { id?: number } | undefined)?.id;

    if (data.appointment_date && data.appointment_time && doctorId) {
      const requestedTime = toHHMM(data.appointment_time);

      // 1. I-check kung pasok sa naka-set na schedule window ng doctor
      const parsedDate = new Date(`${String(data.appointment_date).slice(0, 10)}T00:00:00`);
      if (!Number.isNaN(parsedDate.getTime())) {
        const dayOfWeek = DAY_NAMES[parsedDate.getDay()];
        const doctorSchedules = await this.scheduleRepo.find({
          where: { doctor: { id: doctorId } } as any,
          relations: { doctor: true },
        });

        const matchingDaySchedules = doctorSchedules.filter(
          (slot) =>
            String(slot.day_of_week || '').toLowerCase() ===
            dayOfWeek.toLowerCase(),
        );

        if (matchingDaySchedules.length > 0) {
          const isWithinWindow = matchingDaySchedules.some((slot) => {
            const start = toHHMM(slot.start_time);
            const end = toHHMM(slot.end_time);
            return requestedTime >= start && requestedTime <= end;
          });

          if (!isWithinWindow) {
            const allowedWindows = matchingDaySchedules
              .map(
                (slot) =>
                  `${toHHMM(slot.start_time)} - ${toHHMM(slot.end_time)}`,
              )
              .join(', ');
            throw new BadRequestException(
              `Selected time (${requestedTime}) is outside the doctor's schedule for ${dayOfWeek} (${allowedWindows}).`,
            );
          }
        }
      }

      // 2. I-check kung may naka-book na sa parehong doctor, date, at time
      const existing = await this.appointmentRepo.findOne({
        where: {
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          doctor: { id: doctorId },
          status: Not('cancelled'),
        },
      });

      if (existing) {
        throw new BadRequestException(
          'This time slot is already booked for this doctor.',
        );
      }
    }

    try {
      const appointment = this.appointmentRepo.create(data);
      return await this.appointmentRepo.save(appointment);
    } catch (err: unknown) {
      const dbErr = err as { code?: string; errno?: number };
      if (dbErr?.code === 'ER_DUP_ENTRY' || dbErr?.errno === 1062) {
        throw new BadRequestException(
          'This time slot is already booked for this doctor.',
        );
      }
      throw err;
    }
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

  async findOne(id: number) {
    return await this.appointmentRepo.findOne({
      where: { id },
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

  async updateStatus(id: number, status: string) {
    await this.appointmentRepo.update(id, { status });
    return this.appointmentRepo.findOne({
      where: { id },
      relations: { patient: true, doctor: true, service: true },
    });
  }
}