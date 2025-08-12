import { eventSource, event_types } from '@sillytavern/script';
import { onChatCompletionPromptReady } from '@/component/prompt_view/controller';
import { openPromptViewDialog } from '@/component/prompt_view/ui_manager';

/**
 * 添加变量管理快速按钮
 */
export function addPromptViewQuickButton() {
  const buttonHtml = $(`
  <div id="tavern-helper-prompt-view-container" class="list-group-item flex-container flexGap5 interactable tavern-helper-shortcut-item">
      <div class="fa-solid fa-bug-slash extensionsMenuExtensionButton" /></div>
      <span id="tavern-helper-variable-text">提示词查看器</span>
  </div>`);
  buttonHtml.css('display', 'flex');
  if ($('#tavern-helper-prompt-view-container').length === 0) {
    $('#extensionsMenu').append(buttonHtml);
  }
  $('#tavern-helper-prompt-view-container')
    .off('click')
    .on('click', async function () {
      await openPromptViewDialog();
    });
}

/**
 * 初始化提示词查看器
 */
export async function initPromptView(): Promise<void> {
  const $button = $('#open-prompt-view');
  if ($button.length) {
    $button.off('click').on('click', async () => {
      await openPromptViewDialog();
    });
  }
}

/**
 * 页面卸载时清理所有事件监听器
 */
$(window).on('unload', () => {
  eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onChatCompletionPromptReady);
});
