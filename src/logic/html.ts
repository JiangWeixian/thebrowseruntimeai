import { Readability } from '@mozilla/readability'

// export async function convertToMarkdown(selectedText: HTMLElement | string) {
//   const turndownService = new TurndownService({
//     headingStyle: 'atx', // # 样式的标题
//     hr: '---', // 水平线样式
//     bulletListMarker: '-', // 无序列表使用 -
//     codeBlockStyle: 'fenced', // ``` 样式的代码块
//     emDelimiter: '_', // 使用 _ 作为斜体标记
//     strongDelimiter: '**', // 使用 ** 作为粗体标记
//     linkStyle: 'inlined', // 使用引用式链接
//     preformattedCode: true, // 保持预格式化的代码块
//   })

//   const gfm = turndownPluginGfm.gfm
//   const tables = turndownPluginGfm.tables
//   const strikethrough = turndownPluginGfm.strikethrough

//   // Use the gfm plugin
//   turndownService.use(gfm)

//   // Use the table and strikethrough plugins only
//   turndownService.use([tables, strikethrough])

//   // 移除不需要的标签
//   turndownService.remove(['script', 'style', 'noscript', 'iframe', 'form', 'img'])

//   const markdown = turndownService.turndown(selectedText)

//   // @ts-expect-error -- ignore
//   return (await remark().use(remarkConfig).process(markdown)).toString()
// }

export async function readableText(document: Document) {
  const article = new Readability(document).parse()
  return article?.textContent
}
