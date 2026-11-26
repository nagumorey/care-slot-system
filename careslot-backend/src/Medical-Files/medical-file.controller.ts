import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MedicalFilesService } from './medical-file.services';
import { MedicalFile } from './medical-file.entity';

@Controller('medical-files')
export class MedicalFilesController {
  constructor(private readonly filesService: MedicalFilesService) {}

  @Post()
  create(@Body() body: Partial<MedicalFile>) {
    return this.filesService.create(body);
  }

  @Get()
  findAll(
    @Query('patientId') patientId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.filesService.findAll(
      patientId ? Number(patientId) : undefined,
      appointmentId ? Number(appointmentId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<MedicalFile>,
  ) {
    return this.filesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.remove(id);
  }
}