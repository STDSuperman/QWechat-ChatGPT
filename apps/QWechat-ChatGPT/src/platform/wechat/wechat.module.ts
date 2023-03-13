import { Module } from '@nestjs/common';
import { WechatService } from './wechat.service';
import { ChatGptModule } from '@chat-module/chat-gpt/chat-gpt.module'
import { WeChatGPTMessageService } from './wechat.message.service'

@Module({
  imports: [ChatGptModule],
  providers: [WechatService, WeChatGPTMessageService]
})
export class WechatModule {}
