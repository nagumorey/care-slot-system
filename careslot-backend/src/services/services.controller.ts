import { Controller, Get, Post, Body } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './service.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(@Body() data: Partial<Service>) {
    return this.servicesService.create(data);
  }

  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }
}