import { formatAsTavernRegexedString } from '@/function/tavern_regex';

import { chat, substituteParamsExtended } from '@sillytavern/script';

import log from 'loglevel';

interface FoundKeywordsOption {
  scan_depth?: number;
}

export function foundKeywords(keywords: (string | RegExp)[], { scan_depth = 2 }: FoundKeywordsOption = {}): boolean {
  const text = chat
    .slice(-scan_depth)
    .map(chat_message =>
      formatAsTavernRegexedString(chat_message.mes, chat_message.is_user ? 'user_input' : 'ai_output', 'prompt', {
        depth: chat.length - 1 - chat_message.message_id,
      }),
    )
    .join('\n');
  return keywords.some(keyword => {
    if (typeof keyword === 'string') {
      return text.includes(keyword);
    }
    return keyword.test(text);
  });
}

export function substitudeMacros(text: string): string {
  const text_demacroed = substituteParamsExtended(text);

  log.info(`替换字符串中的宏, 字符串: '${text}', 结果: '${text_demacroed}'`);
  return text_demacroed;
}

export function getLastMessageId(): number {
  return Number(substitudeMacros('{{lastMessageId}}'));
}

export function errorCatched<T extends any[], U>(fn: (...args: T) => U): (...args: T) => U {
  const onError = (error: Error) => {
    toastr.error(`${error.stack ? error.stack : error.name + ': ' + error.message}`);
    throw error;
  };
  return (...args: T): U => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch(error => {
          onError(error);
        }) as U;
      }
      return result;
    } catch (error) {
      return onError(error as Error);
    }
  };
}
