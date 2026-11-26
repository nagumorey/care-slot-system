import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Service>) {
    return this.servicesService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}