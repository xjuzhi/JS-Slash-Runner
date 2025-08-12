import { getTokenCountAsync } from '@sillytavern/scripts/tokenizers';

interface PromptData {
  role: string;
  content: string;
  token: number;
}

let promptViewUpdater: ((prompts: PromptData[], totalTokens: number) => void | Promise<void>) | null = null;

export function setPromptViewUpdater(
  updater: ((prompts: PromptData[], totalTokens: number) => void | Promise<void>) | null,
): void {
  promptViewUpdater = updater;
}

/**
 * 规范化来自事件的数据内容为字符串。
 * - 字符串：原样返回
 * - 数组：拼接其中的文本（若为对象尝试取 text 字段），无法识别的项忽略
 * - 对象：尝试使用 text 字段，否则 JSON 序列化
 * - 其它：转换为字符串或返回空串
 */
function normalizeContent(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    return raw
      .map(part => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in (part as any)) {
          const text = (part as any).text;
          return typeof text === 'string' ? text : '';
        }
        return '';
      })
      .join('');
  }
  if (raw && typeof raw === 'object') {
    const maybeText = (raw as any).text;
    if (typeof maybeText === 'string') return maybeText;
    try {
      return JSON.stringify(raw);
    } catch {
      return String(raw);
    }
  }
  if (raw == null) return '';
  return String(raw);
}

export function onChatCompletionPromptReady(data: Parameters<ListenerType['chat_completion_prompt_ready']>[0]) {
  // if (data.dryRun || !isChatCompletion()) {
  //   return;
  // }

  setTimeout(async () => {
    const prompts = await Promise.all(
      data.chat.map(async ({ role, content }) => {
        const normalized = normalizeContent(content as unknown);
        return {
          role,
          content: normalized,
          token: await getTokenCountAsync(normalized),
        };
      }),
    );
    const totalTokens = await getTokenCountAsync(prompts.map(prompt => prompt.content).join('\n'));
    await promptViewUpdater?.(prompts, totalTokens);
  });
}
