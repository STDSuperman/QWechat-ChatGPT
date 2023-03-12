import { Module } from '@nestjs/common';
import { WechatService } from './wechat.service';

@Module({
  providers: [WechatService]
})
export class WechatModule {}
