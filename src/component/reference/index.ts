import { callGenericPopup, POPUP_TYPE } from '@sillytavern/scripts/popup';
import {
  SlashCommandArgument,
  SlashCommandNamedArgument,
} from '@sillytavern/scripts/slash-commands/SlashCommandArgument';
import { SlashCommandParser } from '@sillytavern/scripts/slash-commands/SlashCommandParser';

/**
 * 格式化酒馆 STScript 命令列表
 * @returns 格式化后的酒馆 STScript 命令列表
 */
function formatSlashCommands(): string {
  const cmdList = Object.keys(SlashCommandParser.commands)
    .filter(key => SlashCommandParser.commands[key].name === key) // exclude aliases
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(key => SlashCommandParser.commands[key]);

  const transform_unnamed_arg = (arg: SlashCommandArgument) => {
    return {
      is_required: arg.isRequired,
      default_value: arg.defaultValue ?? undefined,
      accepts_multiple: arg.acceptsMultiple,
      enum_list: arg.enumList.length > 0 ? arg.enumList.map(e => e.value) : undefined,
      type_list: arg.typeList.length > 0 ? arg.typeList : undefined,
    };
  };

  const transform_named_arg = (arg: SlashCommandNamedArgument) => {
    return {
      name: arg.name,
      ...transform_unnamed_arg(arg),
    };
  };

  const transform_help_string = (help_string: string) => {
    const content = $('<span>').html(help_string);
    return content
      .text()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .join(' ');
  };

  return cmdList
    .map(cmd => ({
      name: cmd.name,
      named_args: cmd.namedArgumentList.map(transform_named_arg) ?? [],
      unnamed_args: cmd.unnamedArgumentList.map(transform_unnamed_arg) ?? [],
      return_type: cmd.returns ?? 'void',
      help_string: transform_help_string(cmd.helpString) ?? 'NO DETAILS',
    }))
    .map(
      cmd =>
        `/${cmd.name}${cmd.named_args.length > 0 ? ` ` : ``}${cmd.named_args
          .map(
            arg =>
              `[${arg.accepts_multiple ? `...` : ``}${arg.name}=${
                arg.enum_list ? arg.enum_list.join('|') : arg.type_list ? arg.type_list.join('|') : ''
              }]${arg.is_required ? `` : `?`}${arg.default_value ? `=${arg.default_value}` : ``}`,
          )
          .join(' ')}${cmd.unnamed_args.length > 0 ? ` ` : ``}${cmd.unnamed_args
          .map(
            arg =>
              `(${arg.accepts_multiple ? `...` : ``}${
                arg.enum_list ? arg.enum_list.join('|') : arg.type_list ? arg.type_list.join('|') : ''
              })${arg.is_required ? `` : `?`}${arg.default_value ? `=${arg.default_value}` : ``}`,
          )
          .join(' ')} // ${cmd.help_string}`,
    )
    .join('\n');
}

/**
 * 打开查看文档popup
 */
function openViewDocsPopup() {
  const $html = $(`
  <div class="flex-container flexFlowColumn">
  <a href="https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/基本用法/如何正确使用酒馆助手.html" target="_blank" class="menu_button interactable width100p">
    查看酒馆助手帮助文档
  </a>
  <a href="https://rentry.org/sillytavern-script-book" target="_blank" class="menu_button interactable width100p">
    查看 STScript 命令手册中文版
  </a>
  </div>
  `);
  callGenericPopup($html, POPUP_TYPE.DISPLAY);
}

/**
 * 打开下载参考文件popup
 */
function openDownloadReferencePopup() {
  const $html = $(`
  <div class="flex-container flexFlowColumn">
  <a href="https://gitlab.com/novi028/JS-Slash-Runner/-/raw/main/dist/@types.zip?ref_type=heads&inline=false" target="_blank" class="menu_button interactable width100p">
    下载酒馆助手类型声明文件 (压缩包)
  </a>
  <a href="https://gitlab.com/novi028/JS-Slash-Runner/-/raw/main/dist/@types.txt?ref_type=heads&inline=false" target="_blank" class="menu_button interactable width100p">
    下载酒馆助手类型声明文件 (单文件)
  </a>
  <div class="menu_button interactable width100p" id="download_slash_commands">
    下载文本版酒馆 STScript 命令大全
  </div>
  </div>
  `);
  $html.find('#download_slash_commands').on('click', function () {
    const url = URL.createObjectURL(new Blob([formatSlashCommands()], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slash_command.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
  callGenericPopup($html, POPUP_TYPE.DISPLAY);
}
/**
 * 初始化参考
 */
export async function initReference() {
  $('#view_tavern_helper_docs').on('click', openViewDocsPopup);
  $('#download_tavern_helper_types').on('click', openDownloadReferencePopup);
}
