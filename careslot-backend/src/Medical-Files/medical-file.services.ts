import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalFile } from './medical-file.entity';

@Injectable()
export class MedicalFilesService {
  constructor(
    @InjectRepository(MedicalFile)
    private fileRepo: Repository<MedicalFile>,
  ) {}

  async create(data: Partial<MedicalFile>) {
    const file = this.fileRepo.create(data);
    return await this.fileRepo.save(file);
  }

  async findAll(patientId?: number, appointmentId?: number) {
    const where: Record<string, number> = {};
    if (patientId) where.patient_id = patientId;
    if (appointmentId) where.appointment_id = appointmentId;

    return await this.fileRepo.find({
      where,
      relations: { patient: true, appointment: true },
      order: { uploaded_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const file = await this.fileRepo.findOne({
      where: { id },
      relations: { patient: true, appointment: true },
    });
    if (!file) {
      throw new NotFoundException(`MedicalFile #${id} not found`);
    }
    return file;
  }

  async update(id: number, data: Partial<MedicalFile>) {
    await this.findOne(id);
    await this.fileRepo.update(id, data);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const file = await this.findOne(id);
    await this.fileRepo.remove(file);
    return { deleted: true, id };
  }
}