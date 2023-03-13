import { Injectable } from '@nestjs/common';
import { ContactInterface, RoomInterface } from "wechaty/impls";
import { Message } from "wechaty";
import { ConfigService } from '@chat-common/config/config.service';
import { ChatGptService } from '@chat-module/chat-gpt/chat-gpt.service'
import { MessageType, SINGLE_MESSAGE_MAX_SIZE } from '@chat-common/utils/constants'
import { LoggerService } from '@chat-common/logger/logger.service'

@Injectable()
export class WeChatGPTMessageService {
  private chatPrivateTiggerKeyword: string;
  private chatTiggerRule: RegExp | undefined;
  private enableGroupMessage = false;
  private botName = "";

  constructor(
    private configService: ConfigService,
    private chatService: ChatGptService,
    private logger: LoggerService
  ) {
    this.chatPrivateTiggerKeyword = this.configService.get('chatPrivateTiggerKeyword');
    const chatTiggerRule = this.configService.get('chatTiggerRule')
    this.chatTiggerRule = chatTiggerRule ? new RegExp(chatTiggerRule): undefined
    this.enableGroupMessage = this.configService.get('enableGroupMessage') || false;
  }

  public async onMessage(message: Message) {
    // this.logger.log(`🎯 ${message.date()} Message: ${message}`);
    const talker = message.talker();
    const rawText = message.text();
    const room = message.room();
    const messageType = message.type();
    const privateChat = !room;
    if (this.isNonsense(talker, messageType, rawText)) {
      return;
    }
    if (this.tiggerGPTMessage(rawText, privateChat)) {
      const text = this.cleanMessage(rawText, privateChat);
      if (privateChat) {
        return await this.onPrivateMessage(talker, text);
      } else{
        if (this.enableGroupMessage){
          return await this.onGroupMessage(talker, text, room);
        } else {
          return;
        }
      }
    } else {
      return;
    }
  }

  public setBotName(botName: string) {
    this.botName = botName;
  }

  public get chatGroupTiggerRegEx(): RegExp {
    return new RegExp(`^@${this.botName}\\s`);
  }

  public get chatPrivateTiggerRule(): RegExp | undefined {
    const { chatPrivateTiggerKeyword, chatTiggerRule } = this;
    let regEx = chatTiggerRule
    if (!regEx && chatPrivateTiggerKeyword) {
      regEx = new RegExp(chatPrivateTiggerKeyword)
    }
    return regEx
  }

  public cleanMessage(rawText: string, privateChat = false): string {
    let text = rawText;
    const item = rawText.split("- - - - - - - - - - - - - - -");
    if (item.length > 1) {
      text = item[item.length - 1];
    }
    
    const { chatTiggerRule, chatPrivateTiggerRule } = this;
    
    if (privateChat && chatPrivateTiggerRule) {
      text = text.replace(chatPrivateTiggerRule, "")
    } else if (!privateChat) {
      text = text.replace(this.chatGroupTiggerRegEx, "")
      text = chatTiggerRule? text.replace(chatTiggerRule, ""): text
    }
    // remove more text via - - - - - - - - - - - - - - -
    return text
  }

  public async getGPTMessage(text: string): Promise<string> {
    return this.chatService.sendGPTMessage(text);
  }
  
  private async trySay(
    talker: RoomInterface | ContactInterface,
    mesasge: string
  ): Promise<void> {
    const messages: Array<string> = [];
    let message = mesasge;
    while (message.length > SINGLE_MESSAGE_MAX_SIZE) {
      messages.push(message.slice(0, SINGLE_MESSAGE_MAX_SIZE));
      message = message.slice(SINGLE_MESSAGE_MAX_SIZE);
    }
    messages.push(message);
    for (const msg of messages) {
      await talker.say(msg);
    }
  }

  // Check whether the ChatGPT processing can be triggered
  private tiggerGPTMessage(text: string, privateChat = false): boolean {
    const { chatTiggerRule } = this;
    let triggered = false;
    if (privateChat) {
      const regEx = this.chatPrivateTiggerRule
      triggered = regEx? regEx.test(text): true;
    } else {
      triggered = this.chatGroupTiggerRegEx.test(text);
      // group message support `chatTiggerRule`
      if (triggered && chatTiggerRule) {
        triggered = chatTiggerRule.test(text.replace(this.chatGroupTiggerRegEx, ""))
      }
    }
    if (triggered) {
      console.log(`🎯 Triggered ChatGPT: ${text}`);
    }
    return triggered;
  }
  // Filter out the message that does not need to be processed
  private isNonsense(
    talker: ContactInterface,
    messageType: MessageType,
    text: string
  ): boolean {
    return (
      talker.self() ||
      // TODO: add doc support
      messageType !== MessageType.Text ||
      talker.name() === "微信团队" ||
      // 语音(视频)消息
      text.includes("收到一条视频/语音聊天消息，请在手机上查看") ||
      // 红包消息
      text.includes("收到红包，请在手机上查看") ||
      // Transfer message
      text.includes("收到转账，请在手机上查看") ||
      // 位置消息
      text.includes("/cgi-bin/mmwebwx-bin/webwxgetpubliclinkimg")
    );
  }

  private async onPrivateMessage(talker: ContactInterface, text: string) {
    const gptMessage = await this.getGPTMessage(text);
    await this.trySay(talker, gptMessage);
  }

  private async onGroupMessage(
    talker: ContactInterface,
    text: string,
    room: RoomInterface
  ) {
    const gptMessage = await this.getGPTMessage(text);
    const result = `@${talker.name()} ${text}\n\n------ ${gptMessage}`;
    await this.trySay(room, result);
  }
}