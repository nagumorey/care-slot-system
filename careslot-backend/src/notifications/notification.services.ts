import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async createInternal(data: Partial<Notification>) {
    const notif = this.notificationRepo.create(data);
    return await this.notificationRepo.save(notif);
  }

  async findAll(userId?: number) {
    if (userId) {
      return await this.notificationRepo.find({
        where: { user_id: userId },
        relations: { user: true },
        order: { created_at: 'DESC' },
      });
    }
    return await this.notificationRepo.find({
      relations: { user: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const notif = await this.notificationRepo.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!notif) {
      throw new NotFoundException(`Notification #${id} not found`);
    }
    return notif;
  }

  async remove(id: number) {
    const notif = await this.findOne(id);
    await this.notificationRepo.remove(notif);
    return { deleted: true, id };
  }
}