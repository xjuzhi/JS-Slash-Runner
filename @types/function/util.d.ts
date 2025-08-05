interface FoundKeywordsOption {
  /** 扫描深度: 1 表示只扫描最后一条消息, 2 表示扫描最后两条消息, 以此类推; 默认为 2 */
  scan_depth?: number;
}

/**
 * 在最后 `scan_depth` 条消息中 (以发送给 ai 的提示词为准), 检查消息是否包含 `keywords` 中的任意一个
 *
 * @param keywords 要检查的关键词, 可以是字符串或正则表达式
 * @param option 可选选项
 *   - `scan_depth?:number`: 扫描深度, 1 表示只扫描最后一条消息, 2 表示扫描最后两条消息, 以此类推; 默认为 2
 *
 * @returns 如果包含任意一个关键词, 则返回 true; 否则返回 false
 *
 * @example
 * // 检查最后两条消息 (最后一条用户消息和最后一条 ai 消息, **以发送给 ai 的提示词**为准) 中是否包含 '络络'
 * const is_found = foundKeywords(['络络']);
 *
 * @example
 * // 检查最后两条消息中是否包含 '络络好感度:10'、'络络好感度:11'、...、'络络好感度:19'
 * const is_found = foundKeywords([/络络好感度:1[0-9]/]);
 */
function foundKeywords(keywords: (string | RegExp)[], { scan_depth }?: FoundKeywordsOption): boolean;

/**
 * 替换字符串中的酒馆宏
 *
 * @param text 要替换的字符串
 * @returns 替换结果
 *
 * @example
 * const text = substitudeMacros("{{char}} speaks in {{lastMessageId}}");
 * text == "少女歌剧 speaks in 5";
 */
function substitudeMacros(text: string): string;

/**
 * 获取最新楼层 id
 *
 * @returns 最新楼层id
 */
function getLastMessageId(): number;

/**
 * 包装 `fn` 函数，返回一个会将报错消息通过酒馆通知显示出来的同功能函数
 *
 * @param fn 要包装的函数
 * @returns 包装后的函数
 *
 * @example
 * // 包装 `test` 函数从而在酒馆通知中显示 'test' 文本
 * async function test() {
 *   throw Error(`test`);
 * }
 * errorCatched(test)();
 */
function errorCatched<T extends any[], U>(fn: (...args: T) => U): (...args: T) => U;
