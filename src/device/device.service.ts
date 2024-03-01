import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async updateDevice(
    userId: number,
    deviceId: string,
    caption: string,
    type: string,
  ): Promise<Device> {
    let device = await this.deviceRepository.findOne({
      where: { deviceId, user: { id: userId } },
    });
    if (device) {
      device.caption = caption;
      device.type = type;
      await this.deviceRepository.save(device);
    } else {
      device = this.deviceRepository.create({
        deviceId,
        caption,
        type,
        user: { id: userId },
      });
      await this.deviceRepository.save(device);
    }
    return device;
  }

  async getSyncStatus(userId: number): Promise<Device[]> {
    return this.deviceRepository.find({ where: { user: { id: userId } } });
  }
}
