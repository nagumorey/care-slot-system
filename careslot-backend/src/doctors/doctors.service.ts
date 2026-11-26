import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity'; // Dapat Doctor, hindi Service

@Injectable()
export class DoctorsService { // Dapat DoctorsService
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async create(data: Partial<Doctor>) {
    const doctor = this.doctorRepo.create(data);
    return await this.doctorRepo.save(doctor);
  }

  async findAll() {
    return await this.doctorRepo.find();
  }

  async findOne(id: number) {
    return this.doctorRepo.findOneBy({ id });
  }

  async update(id: number, data: Partial<Doctor>) {
    await this.doctorRepo.update(id, data);
    return this.doctorRepo.findOneBy({ id });
  }

  async remove(id: number) {
    await this.doctorRepo.delete(id);
    return { message: 'Doctor deleted successfully' };
  }
}