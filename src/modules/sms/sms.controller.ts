import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSMSDto } from './dto/send-sms.dto';
import { DecoratorWrapper } from 'src/common/auth/decorator.auth';

import { Role } from 'src/common/auth/roles/role.enum';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @DecoratorWrapper('send sms to users', false, [Role.Admin])
  send(@Body() dto: SendSMSDto) {
    return this.smsService.send(dto);
  }
}
