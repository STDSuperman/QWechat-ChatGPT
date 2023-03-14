import { Module } from '@nestjs/common';
import GlobalModule from './common/global/global.module'
import { PlatFormModule } from './platform/platform.module';
import { ChatGptModule } from './modules/chat-gpt/chat-gpt.module';

@Module({
  imports: [GlobalModule, PlatFormModule, ChatGptModule],
})
export class AppModule {}
