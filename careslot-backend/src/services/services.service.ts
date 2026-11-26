import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity'; // Dapat Service

@Injectable()
export class ServicesService { // Dapat ServicesService
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}

  async create(data: Partial<Service>) {
    const service = this.serviceRepo.create(data);
    return await this.serviceRepo.save(service);
  }

  async findAll() {
    return await this.serviceRepo.find();
  }

  async findOne(id: number) {
    const service = await this.serviceRepo.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: number, data: Partial<Service>) {
    await this.serviceRepo.update(id, data);
    return this.serviceRepo.findOneBy({ id });
  }

  async remove(id: number) {
    await this.serviceRepo.delete(id);
    return { message: 'Service deleted successfully' };
  }
}