import { Injectable, OnModuleInit } from '@nestjs/common';
import { WechatyBuilder } from "wechaty";
import QRCode from "qrcode";
import { LoggerService } from '@chat-common/logger/logger.service'
import { WeChatGPTMessageService } from './wechat.message.service'

@Injectable()
export class WechatService implements OnModuleInit {
  constructor(
    private logger: LoggerService,
    private wechatGptMessageService: WeChatGPTMessageService
  ) {}

  public onModuleInit() {
    // this.init();
    this.wechatGptMessageService.getGPTMessage('测试');
  }

  public async init(): Promise<void> {
    const initializedAt = Date.now()
    const bot =  WechatyBuilder.build({
      name: "wechat-assistant",
    });
    bot
      .on("scan", async (qrcode, status) => {
        const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
        this.logger.info(`Scan QR Code to login: ${status}\n${url}`);
        this.logger.log(
          await QRCode.toString(qrcode, { type: "terminal", small: true })
        );
      })
      .on("login", async (user) => {
        this.logger.log(`User ${user} logged in`);
        this.wechatGptMessageService.setBotName(user?.name());
      })
      .on("message", async (message) => {
        if (message.date().getTime() < initializedAt) {
          return;
        }
        if (message.text().startsWith("/ping")) {
          await message.say("pong");
          return;
        }
        await this.wechatGptMessageService.onMessage(message);
      });
      try {
        await bot.start();
      } catch (e) {
        console.error(
          `⚠️ Bot start failed, can you log in through wechat on the web?: ${e}`
        );
      }
  }
}
