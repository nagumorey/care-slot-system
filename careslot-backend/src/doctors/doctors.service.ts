import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
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
}