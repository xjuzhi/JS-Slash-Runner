import { registerAllMacros, unregisterAllMacros } from '@/component/macro';
import { destroyMacroOnExtension, initializeMacroOnExtension, renderAllMacros } from '@/component/macrolike';
import {
  addCodeToggleButtonsToAllMessages,
  addRenderingHideStyleSettings,
  removeRenderingHideStyleSettings,
} from '@/component/message_iframe/render_hide_style';
import {
  partialRenderEvents,
  renderAllIframes,
  renderMessageAfterDelete,
  renderPartialIframes,
  viewport_adjust_script,
} from '@/component/message_iframe/render_message';
import { addRenderQuickButton } from '@/component/message_iframe/index';
import {
  addRenderingOptimizeSettings,
  removeRenderingOptimizeSettings,
} from '@/component/message_iframe/render_optimize';
import { destroyCharacterLevelOnExtension, initializeCharacterLevelOnExtension } from '@/component/script_iframe';
import {
  buildScriptRepositoryOnExtension,
  destroyScriptRepositoryOnExtension,
} from '@/component/script_repository/index';
import { initializeToastr } from '@/component/toastr';
import { iframe_client } from '@/iframe_client/index';
import { script_url } from '@/script_url';
import { getSettingValue, saveSettingValue } from '@/util/extension_variables';
import { eventSource, event_types, reloadCurrentChat, saveSettingsDebounced, this_chid } from '@sillytavern/script';
import { addPromptViewQuickButton } from '@/component/prompt_view';
import { addVariableManagerQuickButton } from '@/component/variable_manager';

const handleChatLoaded = async () => {
  await renderAllIframes();
  addCodeToggleButtonsToAllMessages();
};

const handleChatChanged = async () => {
  renderAllMacros();
};

const handlePartialRender = (mesId: string) => {
  const mesIdNumber = parseInt(mesId, 10);
  renderPartialIframes(mesIdNumber);
};

const handleMessageDeleted = (mesId: string) => {
  const mesIdNumber = parseInt(mesId, 10);
  renderMessageAfterDelete(mesIdNumber);
  if (getSettingValue('render.render_hide_style')) {
    addCodeToggleButtonsToAllMessages();
  }
};

/**
 * 初始化扩展主设置界面
 */
export function initExtensionMainPanel() {
  const isEnabled = getSettingValue('enabled_extension');
  if (isEnabled) {
    handleExtensionToggle(false, true);
  }
  $('#extension-enable-toggle')
    .prop('checked', isEnabled)
    .on('change', function (event: JQuery.ChangeEvent) {
      handleExtensionToggle(true, $(event.currentTarget).prop('checked'));
    });
}

/**
 * 添加所有快捷入口
 */
function addAllShortcut() {
  addRenderQuickButton();
  addPromptViewQuickButton();
  addVariableManagerQuickButton();
}

/**
 * 移除所有添加的快捷入口
 */
function removeAllShortcut() {
  $('#extensionsMenu').find('.tavern-helper-shortcut-item').remove();
}

/**
 * 扩展总开关切换
 * @param userAction 是否为用户触发
 * @param enable 是否启用
 */
async function handleExtensionToggle(userAction: boolean = true, enable: boolean = true) {
  if (userAction) {
    saveSettingValue('enabled_extension', enable);
  }
  if (enable) {
    // 指示器样式
    $('#extension-status-icon').css('color', 'green').next().text('扩展已启用');

    script_url.set('iframe_client', iframe_client);
    script_url.set('viewport_adjust_script', viewport_adjust_script);

    registerAllMacros();
    initializeToastr();
    initializeMacroOnExtension();
    initializeCharacterLevelOnExtension();
    buildScriptRepositoryOnExtension();

    addAllShortcut();

    // 重新注入前端卡优化的样式和设置
    if (userAction && getSettingValue('render.rendering_optimize')) {
      addRenderingOptimizeSettings();
    }
    if (userAction && getSettingValue('render.render_hide_style')) {
      addRenderingHideStyleSettings();
    }

    eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
    eventSource.on('chatLoaded', handleChatLoaded);

    partialRenderEvents.forEach(eventType => {
      eventSource.on(eventType, handlePartialRender);
    });

    eventSource.on(event_types.MESSAGE_DELETED, handleMessageDeleted);
    if (userAction && this_chid !== undefined) {
      await reloadCurrentChat();
    }
  } else {
    // 指示器样式
    $('#extension-status-icon').css('color', 'red').next().text('扩展已禁用');

    script_url.delete('iframe_client');
    script_url.delete('viewport_adjust_script');

    unregisterAllMacros();
    destroyMacroOnExtension();
    destroyCharacterLevelOnExtension();
    destroyScriptRepositoryOnExtension();

    removeAllShortcut();

    if (getSettingValue('render.rendering_optimize')) {
      removeRenderingOptimizeSettings();
    }

    if (getSettingValue('render.render_hide_style')) {
      removeRenderingHideStyleSettings();
    }

    eventSource.removeListener(event_types.CHAT_CHANGED, handleChatChanged);
    eventSource.removeListener('chatLoaded', handleChatLoaded);
    partialRenderEvents.forEach(eventType => {
      eventSource.removeListener(eventType, handlePartialRender);
    });
    eventSource.removeListener(event_types.MESSAGE_DELETED, handleMessageDeleted);
    if (userAction && this_chid !== undefined) {
      await reloadCurrentChat();
    }
  }
  saveSettingsDebounced();
}
