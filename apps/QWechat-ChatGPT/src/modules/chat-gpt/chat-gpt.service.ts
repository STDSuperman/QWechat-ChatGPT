import { Injectable } from '@nestjs/common';
import { ConfigService } from '@chat-common/config/config.service'
import { LoggerService } from '@chat-common/logger/logger.service'
import { fetch, ProxyAgent } from 'undici'

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
          temperature: 0.6
        }),
        dispatcher: undefined,
      };

      if (httpsProxy) {
        requestOptions.dispatcher = new ProxyAgent(httpsProxy);
      }

      console.log('***8requestOptions', requestOptions)

      const response = await fetch(`https://api.openai.com/v1/chat/completions`, requestOptions);
      
      this.logger.debug('response', response);
      const resJson = await response.json() as IGPTResponseJson;
      this.logger.debug('resJson', resJson);
      return resJson?.choices?.[0]?.message?.content;
    } catch (e) {
      this.logger.error(e)
      return "Something wrong"
    }
  }
}
