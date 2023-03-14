import { Module } from '@nestjs/common';
import { WechatModule } from './wechat/wechat.module';

@Module({
  imports: [WechatModule],
})
export class PlatFormModule {}
