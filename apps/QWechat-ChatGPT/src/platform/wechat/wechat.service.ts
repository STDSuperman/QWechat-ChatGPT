import { Injectable, OnModuleInit } from '@nestjs/common';
import { WechatyBuilder } from "wechaty";
import QRCode from "qrcode";
import { MessageInterface } from 'wechaty/impls';
import { LoggerService } from '@chat-common/logger/logger.service'

@Injectable()
export class WechatService implements OnModuleInit {
  constructor(private logger: LoggerService) {}

  public onModuleInit() {
    this.init();
  }

  public async init(): Promise<void> {
    const initializedAt = Date.now()
    const bot =  WechatyBuilder.build({
      name: "wechat-assistant",
    });
    bot
      .on("scan", async (qrcode, status) => {
        const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
        this.logger.log(`Scan QR Code to login: ${status}\n${url}`);
        console.log(
          await QRCode.toString(qrcode, { type: "terminal", small: true })
        );
      })
      .on("login", async (user) => {
        this.logger.log(`User ${user} logged in`);
      })
      .on("message", async (message) => {
        if (message.date().getTime() < initializedAt) {
          return;
        }
        if (message.text().startsWith("/ping")) {
          await message.say("pong");
          return;
        }
        await this.onMessage(message);
      });
      try {
        await bot.start();
      } catch (e) {
        console.error(
          `⚠️ Bot start failed, can you log in through wechat on the web?: ${e}`
        );
      }
  }

  private async onMessage(message: MessageInterface): Promise<void> {
    try {
      this.logger.log(message)
    } catch (e) {
      console.error(e);
    }
  }
}
