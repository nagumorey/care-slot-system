import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalFile } from './medical-file.entity';
import { MedicalFilesService } from './medical-file.services';
import { MedicalFilesController } from './medical-file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalFile])],
  controllers: [MedicalFilesController],
  providers: [MedicalFilesService],
  exports: [MedicalFilesService],
})
export class MedicalFilesModule {}