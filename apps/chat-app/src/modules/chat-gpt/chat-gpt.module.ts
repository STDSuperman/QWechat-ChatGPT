import { Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';

@Module({
  providers: [ChatGptService],
  exports: [ChatGptService],
})
export class ChatGptModule {}
