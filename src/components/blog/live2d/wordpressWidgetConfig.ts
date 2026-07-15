export const WORDPRESS_WAIFU_SIZE = {
  height: 250,
  width: 280,
} as const;

export const WORDPRESS_WAIFU_TIPS_SIZE = {
  height: 70,
  width: 250,
} as const;

export const WORDPRESS_WAIFU_MIN_WIDTH = 768;

export type WordPressWaifuToolAction = 'bot' | 'chat' | 'close' | 'home' | 'info' | 'model' | 'photo' | 'texture';

export interface WordPressWaifuToolDefinition {
  action: WordPressWaifuToolAction;
  className: string;
  title: string;
}

export const WORDPRESS_WAIFU_TOOLS: readonly WordPressWaifuToolDefinition[] = [
  { action: 'home', className: 'fui-home', title: '回到首页' },
  { action: 'chat', className: 'fui-chat', title: '打开聊天' },
  { action: 'bot', className: 'fui-bot', title: '打开 AI 输入' },
  { action: 'texture', className: 'fui-eye', title: '切换服装' },
  { action: 'model', className: 'fui-user', title: '切换模型' },
  { action: 'photo', className: 'fui-photo', title: '保存截图' },
  { action: 'info', className: 'fui-info-circle', title: '关于 Pio' },
  { action: 'close', className: 'fui-cross', title: '隐藏 Pio' },
] as const;
