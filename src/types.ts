export type View = 'landing' | 'diy' | 'dream';

export interface TextItem {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
}

export type Language = 'en' | 'zh';

export interface Template {
  id: string;
  url: string;
  label: string;
}
