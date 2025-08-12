import { onChatCompletionPromptReady, setPromptViewUpdater } from '@/component/prompt_view/controller';
import { extensionFolderPath } from '@/util/extension_variables';
import { FloatingDialog } from '@/util/floating_dialog';
import { loadFileToHead } from '@/util/load_file_to_document';

import { event_types, eventSource, Generate } from '@sillytavern/script';
import { renderExtensionTemplateAsync } from '@sillytavern/scripts/extensions';

export const templatePath = `${extensionFolderPath}/src/component/prompt_view/public`;

interface PromptData {
  role: string;
  content: string;
  token: number;
}

/**
 * 打开提示词查看器浮窗
 */
export async function openPromptViewDialog(): Promise<void> {
  await loadFileToHead(`/scripts/extensions/${templatePath}/style.css`, 'css', 'prompt-view-style');

  // 创建浮窗
  const dialog = FloatingDialog.create({
    id: 'prompt-view-dialog',
    title: '提示词发送情况',
    width: '60vw',
    height: '70vh',
    minWidth: '500px',
    minHeight: '400px',
    resizable: true,
    draggable: true,
    collapsible: true,
    onClose: () => {
      eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onChatCompletionPromptReady);
      setPromptViewUpdater(null);
      $(`style#prompt-view-style`).remove();
    },
  });

  if (!dialog) {
    return;
  }

  const content = dialog.render();

  // 构建静态框架
  const headerTemplate = await renderExtensionTemplateAsync(`${templatePath}`, 'prompt_view_header');
  const $contentHtml = $(headerTemplate);

  content.append($contentHtml);

  function bindToggleHandlers(scope: JQuery<HTMLElement>) {
    scope.find('.prompt-view-item-header').on('click', function () {
      const $this = $(this);
      const $parent = $this.closest('.prompt-view-item');
      const $cnt = $parent.find('.prompt-view-item-content');
      const $icon = $this.find('.prompt-view-item-header-icon');
      $cnt.slideToggle(300);
      $icon.toggleClass('fa-circle-chevron-down fa-circle-chevron-up');
    });
  }

  // 注册一次性 UI 更新函数（由 controller 在事件触发时调用）
  setPromptViewUpdater(async (prompts: PromptData[], totalTokens: number) => {
    const $list = $contentHtml.find('.prompt-list');
    const $empty = $contentHtml.find('.prompt-empty');
    $contentHtml.find('.prompt-total-tokens').text(`总Token数: ${totalTokens}`);
    $contentHtml.find('.prompt-count').text(`共 ${prompts.length} 条消息`);

    if (prompts.length === 0) {
      $list.empty();
      $empty.show();
      return;
    }

    $empty.hide();
    const itemTemplate = await renderExtensionTemplateAsync(`${templatePath}`, 'prompt_view_item');
    const html = prompts
      .map(item => {
        return itemTemplate
          .replace('<span class="prompt-item-role"></span>', escapeHtml(item.role))
          .replace('<span class="prompt-item-token"></span>', item.token.toString())
          .replace(
            '<div class="prompt-view-item-content"></div>',
            `<div class="prompt-view-item-content">${escapeHtml(item.content)}</div>`,
          );
      })
      .join('');

    $list.html(html);
    bindToggleHandlers($list);
  });

  // 注册事件监听，并触发一次 dryRun 以填充 UI
  eventSource.makeLast(event_types.CHAT_COMPLETION_PROMPT_READY, onChatCompletionPromptReady);
  Generate('normal', {}, true);
}

/**
 * 转义HTML内容
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
