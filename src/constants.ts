import { Template } from './types';

export const TEMPLATES: Template[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `template-${i}`,
  url: `https://picsum.photos/seed/postcard-${i}/800/600`,
  label: `Postcard ${i + 1}`
}));

export const FONTS = [
  { name: 'Sans', value: 'var(--font-sans)' },
  { name: 'Serif', value: 'serif' },
  { name: 'Mono', value: 'var(--font-mono)' },
  { name: 'Handwritten', value: '"Dancing Script", cursive' },
  { name: 'Elegant', value: '"Playfair Display", serif' },
];

export const COLORS = [
  '#000000', '#FFFFFF', '#4A4A4A', '#E5E7EB',
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#6366F1', '#8B5CF6', '#EC4899', '#78350F'
];
