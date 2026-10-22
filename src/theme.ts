export const colors = {
  ink: '#0E1A2B', // тёмный фон шапки
  inkSoft: '#1B2B42',
  bg: '#F3F5F8',
  surface: '#FFFFFF',
  text: '#0E1A2B',
  textMuted: '#6B778A',
  border: '#E3E7ED',
  accent: '#12A971', // фирменный зелёный
  accentSoft: '#E3F6EE',
  danger: '#D64545',
  onInk: '#FFFFFF',
  onInkMuted: '#9FB0C6',
};

export const radius = { sm: 10, md: 16, lg: 24 };
export const space = (n: number) => n * 4;

export const categoryMeta = {
  transfer: { label: 'Переводы', icon: 'swap-horizontal', color: '#4C7BD9' },
  shopping: { label: 'Покупки', icon: 'bag-handle', color: '#9A5BD6' },
  food: { label: 'Еда', icon: 'cafe', color: '#E08A2E' },
  transport: { label: 'Транспорт', icon: 'bus', color: '#2E9BB8' },
  income: { label: 'Поступления', icon: 'arrow-down', color: '#12A971' },
  qr: { label: 'Оплата по QR', icon: 'qr-code', color: '#0E1A2B' },
} as const;
