export type Platform = 'douyin' | 'xiaohongshu' | 'bilibili' | 'youtube';

export interface PlatformConfig {
  id: Platform;
  name: string;
  ratio: string; // e.g., "9:16"
  icon: string;
  description: string;
}

export interface CoverFormData {
  mainTitle: string;
  subTitle: string;
  platform: Platform;
  subjectImage: File | null;
  styleRefImage: File | null;
  customPrompt: string;
  styleTags: string[];
}

export const PLATFORMS: PlatformConfig[] = [
  { id: 'douyin', name: '抖音', ratio: '9:16', icon: 'smartphone', description: '竖屏全屏体验' },
  { id: 'xiaohongshu', name: '小红书', ratio: '3:4', icon: 'book-open', description: '经典种草比例' },
  { id: 'bilibili', name: 'B站', ratio: '4:3', icon: 'tv', description: '传统视频比例' },
  { id: 'youtube', name: 'YouTube', ratio: '16:9', icon: 'youtube', description: '横屏宽画幅' },
];

export const STYLE_TAGS = [
  '强冲突', '高饱和', '大字报', '极简冷淡', 
  '电影感', '清新干货', '赛博朋克', '搞钱风', 
  '复古胶片', '3D渲染'
];
