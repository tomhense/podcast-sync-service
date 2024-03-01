import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from 'src/auth/basic-auth.guard';
import { DeviceService } from './device.service';

@Controller('api/2/devices')
@UseGuards(BasicAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get(':username.json')
  async getUserDevices(@Req() req): Promise<any> {
    // Here, we extract the authenticated user's ID from the request object
    const { id: userId } = req.user; // Assuming the User object is populated in the request by your authentication mechanism

    // Using the PodcastService to retrieve devices for the authenticated user
    const devices = await this.deviceService.getSyncStatus(userId);
    return devices;
  }
}
