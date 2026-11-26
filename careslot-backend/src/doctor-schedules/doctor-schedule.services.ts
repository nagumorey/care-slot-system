import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorSchedule } from './doctor-schedule.entity';

@Injectable()
export class DoctorSchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private scheduleRepo: Repository<DoctorSchedule>,
  ) {}

  async create(data: Partial<DoctorSchedule>) {
    const schedule = this.scheduleRepo.create(data);
    return await this.scheduleRepo.save(schedule);
  }

  async findAll(doctorId?: number) {
    if (doctorId) {
      return await this.scheduleRepo.find({
        where: { doctor_id: doctorId },
        relations: { doctor: true },
      });
    }
    return await this.scheduleRepo.find({
      relations: { doctor: true },
    });
  }

  async findOne(id: number) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: { doctor: true },
    });
    if (!schedule) {
      throw new NotFoundException(`Schedule #${id} not found`);
    }
    return schedule;
  }

  async update(id: number, data: Partial<DoctorSchedule>) {
    await this.findOne(id);
    await this.scheduleRepo.update(id, data);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const schedule = await this.findOne(id);
    await this.scheduleRepo.remove(schedule);
    return { deleted: true, id };
  }
}