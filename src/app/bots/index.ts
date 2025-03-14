import { BaichuanWebBot } from './baichuan'

import { BingWebBot } from './bing'
import { ChatGPTBot } from './chatgpt'
import { ClaudeBot } from './claude'

import { GrokWebBot } from './grok'
import { LMSYSBot } from './lmsys'
import { PerplexityBot } from './perplexity'
import { PiBot } from './pi'
import { QianwenWebBot } from './qianwen'
import { XunfeiBot } from './xunfei'
import { GeminiProBot } from './gemini-api'
import { GeminiBot } from './gemini'

export type BotId =
  | 'chatgpt'
  | 'bing'
  | 'gemini'
  | 'geminiPro'
  | 'claude'
  | 'perplexity'
  | 'xunfei'
  | 'vicuna'
  | 'falcon'
  | 'mistral'
  | 'chatglm'
  | 'llama'
  | 'pi'
  | 'wizardlm'
  | 'qianwen'
  | 'baichuan'
  | 'yi'
  | 'grok'
  | 'gemini'

export function createBotInstance(botId: BotId) {
  switch (botId) {
    case 'chatgpt':
      return new ChatGPTBot()
    case 'bing':
      return new BingWebBot()
    case 'gemini':
      return new GeminiBot()
    case 'claude':
      return new ClaudeBot()
    case 'xunfei':
      return new XunfeiBot()
    case 'vicuna':
      return new LMSYSBot('vicuna-33b')
    case 'chatglm':
      return new LMSYSBot('chatglm2-6b')
    case 'llama':
      return new LMSYSBot('llama-2-70b-chat')
    case 'wizardlm':
      return new LMSYSBot('wizardlm-13b')
    case 'falcon':
      return new LMSYSBot('falcon-180b-chat')
    case 'mistral':
      return new LMSYSBot('mixtral-8x7b-instruct-v0.1')
    case 'yi':
      return new LMSYSBot('yi-34b-chat')
    case 'pi':
      return new PiBot()
    case 'qianwen':
      return new QianwenWebBot()
    case 'baichuan':
      return new BaichuanWebBot()
    case 'perplexity':
      return new PerplexityBot()
    case 'grok':
      return new GrokWebBot()
    case 'geminiPro':
      return new GeminiProBot()
  }
}

export type BotInstance = ReturnType<typeof createBotInstance>
