import { eventSource, extension_prompts, setExtensionPrompt } from '@sillytavern/script';

import { iframe_events, tavern_events } from '@/function/event';

export type InjectionPrompt = {
  id: string;
  position: 'in_chat' | 'none';
  depth: number;

  role: 'system' | 'assistant' | 'user';
  content: string;

  filter?: (() => boolean) | (() => Promise<boolean>);
  should_scan?: boolean;
};

type injectPromptsOptions = {
  once?: boolean;
};

export function injectPrompts(prompts: InjectionPrompt[], { once = false }: injectPromptsOptions = {}) {
  prompts.forEach(prompt =>
    setExtensionPrompt(
      prompt.id,
      prompt.content,
      prompt.position === 'in_chat' ? 1 : -1,
      prompt.depth,
      prompt.should_scan,
      { system: 0, user: 1, assistant: 2 }[prompt.role],
      // @ts-expect-error
      prompt.filter ?? null,
    ),
  );

  if (once) {
    let deleted = false;
    const unsetInject = () => {
      if (deleted) {
        return;
      }
      uninjectPrompts(prompts.map(p => p.id));
      deleted = true;
    };
    eventSource.once(iframe_events.GENERATION_ENDED, unsetInject);
    eventSource.once(tavern_events.GENERATION_ENDED, unsetInject);
    eventSource.once(tavern_events.GENERATION_STOPPED, unsetInject);
  }
}

export function uninjectPrompts(ids: string[]) {
  ids.forEach(k => {
    _.unset(extension_prompts, k);
  });
}
