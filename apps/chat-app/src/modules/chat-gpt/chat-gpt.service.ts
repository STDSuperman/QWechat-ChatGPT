import { Injectable } from '@nestjs/common';
import { ConfigService } from '@chat-common/config/config.service'
import { LoggerService } from '@chat-common/logger/logger.service'
import { fetch, ProxyAgent } from 'undici'


interface ISteamDataValue {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: IChoiceItem[]
};

interface IChoiceItem {
  delta: {
    content: string;
  }
  index: number;
  finish_reason: string;
}

interface IMessage {
  message: {
    content: string;
  };
}
export interface IGPTResponseJson {
  choices: IMessage[]
}

@Injectable()
export class ChatGptService {
  constructor(
    private configService: ConfigService,
    private logger: LoggerService
  ) {}

  public async sendGPTMessage(message: string): Promise<string> {
    try {
      this.logger.info('send msg to gpt: ' + message)
      const apiKey = this.configService.get('apiKey');
      const model = this.configService.get('model');
      const httpsProxy = this.configService.get('HTTPS_PROXY');

      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              "role": "user",
              "content": message
            }
          ],
          temperature: 0.6,
          stream: true
        }),
        dispatcher: undefined,
      };

      if (httpsProxy) {
        requestOptions.dispatcher = new ProxyAgent(httpsProxy);
      }

      const response = await fetch(`https://api.openai.com/v1/chat/completions`, requestOptions)
      const fullData = this.readFullResponseData(response.body);
      return fullData;
    } catch (e) {
      this.logger.error(e)
      return "Something wrong"
    }
  }

  private async readFullResponseData(response: ReadableStream): Promise<string> {
    const reader = response.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false
    let data = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      if (value) {
        try {
          const chunk =  decoder.decode(value)?.replace(/^\s*data\:\s*/, '');
          if (chunk?.trim() === '[DONE]') {
            break;
          }
          const json = JSON.parse(chunk?.trim() || '{}') as ISteamDataValue;
          data += json?.choices?.[0]?.delta?.content || '';
        } catch (error) {
        }
      }
      done = readerDone
    }
    return data;
  }
}
