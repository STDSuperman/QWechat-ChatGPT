import { runtimeEnv } from '@chat-common/utils/index'

export const userConfig = {
  model: runtimeEnv.MODEL || 'gpt-3.5-turbo',
  apiKey: runtimeEnv.OPENAI_API_KEY || '',
  chatPrivateTiggerKeyword: runtimeEnv.CHAT_PRIVATE_TRIGGER_KEYWORD || "",
  chatTiggerRule: runtimeEnv.CHAT_TRIGGER_RULE || "",
  enableGroupMessage: runtimeEnv.DISABLE_GROUP_MESSAGE === "true",
}