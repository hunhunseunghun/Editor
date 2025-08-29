/**
 * Palette
 * Light Mode와 Dark Mode 색상 팔레트
 */

// Light Mode Text Colors (아이콘에 최적)
export const NOTION_LIGHT_TEXT_COLORS = {
  default: '#37352F',
  grey: '#787774',
  brown: '#9F6B53',
  orange: '#D9730D',
  yellow: '#CB912F',
  green: '#448361',
  blue: '#337EA9',
  purple: '#9065B0',
  pink: '#C14C8A',
  red: '#D44C47',
} as const;

// Light Mode Background Colors (배너나 배경에 최적)
export const NOTION_LIGHT_BG_COLORS = {
  grey: '#F1F1EF',
  brown: '#F4EEEE',
  orange: '#FAEBDD',
  yellow: '#FBF3DB',
  green: '#EDF3EC',
  blue: '#E7F3F8',
  purple: '#F6F3F9',
  pink: '#FAF1F5',
  red: '#FDEBEC',
} as const;

// Dark Mode Text Colors (아이콘에 최적)
export const NOTION_DARK_TEXT_COLORS = {
  grey: '#979A9B',
  brown: '#937264',
  orange: '#FFA344',
  yellow: '#FFDC49',
  green: '#4DAB9A',
  blue: '#529CCA',
  purple: '#9A6DD7',
  pink: '#E255A1',
  red: '#FF7369',
} as const;

// Dark Mode Background Colors (배너나 배경에 최적)
export const NOTION_DARK_BG_COLORS = {
  grey: '#454B4E',
  brown: '#594A3A',
  orange: '#594A3A',
  yellow: '#59563B',
  green: '#354C4B',
  blue: '#364954',
  purple: '#443F57',
  pink: '#533B4C',
  red: '#594141',
} as const;

// Light Mode UI Colors
export const NOTION_LIGHT_UI_COLORS = {
  mainWindow: '#FFFFFF',
  sidebar: '#F7F6F3',
  hoverMenu: '#FFFFFF',
} as const;

// Dark Mode UI Colors
export const NOTION_DARK_UI_COLORS = {
  mainWindow: '#2F3438',
  sidebar: '#373C3F',
  hoverItem: '#3F4448',
} as const;

// 색상 타입 정의
export type NotionLightColorType = keyof typeof NOTION_LIGHT_TEXT_COLORS;
export type NotionDarkColorType = keyof typeof NOTION_DARK_TEXT_COLORS;
export type NotionBgColorType = keyof typeof NOTION_LIGHT_BG_COLORS;
export type NotionLightUiType = keyof typeof NOTION_LIGHT_UI_COLORS;
export type NotionDarkUiType = keyof typeof NOTION_DARK_UI_COLORS;

// 색상 유틸리티 함수들
export const getNotionTextColor = (
  color: NotionLightColorType,
  isDark = false,
) => {
  if (isDark) {
    // Dark mode에서는 default 색상이 없으므로 grey로 대체
    const darkColor = color === 'default' ? 'grey' : color;
    return NOTION_DARK_TEXT_COLORS[darkColor as NotionDarkColorType];
  }
  return NOTION_LIGHT_TEXT_COLORS[color];
};

export const getNotionBgColor = (color: NotionBgColorType, isDark = false) => {
  return isDark ? NOTION_DARK_BG_COLORS[color] : NOTION_LIGHT_BG_COLORS[color];
};

export const getNotionUiColor = (type: NotionLightUiType, isDark = false) => {
  if (isDark) {
    // Dark mode에서는 hoverMenu가 hoverItem으로 변경됨
    const darkType = type === 'hoverMenu' ? 'hoverItem' : type;
    return NOTION_DARK_UI_COLORS[darkType as NotionDarkUiType];
  }
  return NOTION_LIGHT_UI_COLORS[type];
};

// Tailwind CSS 클래스로 사용할 수 있는 색상 매핑
export const NOTION_COLOR_CLASSES = {
  // Light Mode
  light: {
    text: {
      default: 'text-[#37352F]',
      grey: 'text-[#787774]',
      brown: 'text-[#9F6B53]',
      orange: 'text-[#D9730D]',
      yellow: 'text-[#CB912F]',
      green: 'text-[#448361]',
      blue: 'text-[#337EA9]',
      purple: 'text-[#9065B0]',
      pink: 'text-[#C14C8A]',
      red: 'text-[#D44C47]',
    },
    bg: {
      grey: 'bg-[#F1F1EF]',
      brown: 'bg-[#F4EEEE]',
      orange: 'bg-[#FAEBDD]',
      yellow: 'bg-[#FBF3DB]',
      green: 'bg-[#EDF3EC]',
      blue: 'bg-[#E7F3F8]',
      purple: 'bg-[#F6F3F9]',
      pink: 'bg-[#FAF1F5]',
      red: 'bg-[#FDEBEC]',
    },
    ui: {
      mainWindow: 'bg-[#FFFFFF]',
      sidebar: 'bg-[#F7F6F3]',
      hoverMenu: 'bg-[#FFFFFF]',
    },
  },
  // Dark Mode
  dark: {
    text: {
      grey: 'text-[#979A9B]',
      brown: 'text-[#937264]',
      orange: 'text-[#FFA344]',
      yellow: 'text-[#FFDC49]',
      green: 'text-[#4DAB9A]',
      blue: 'text-[#529CCA]',
      purple: 'text-[#9A6DD7]',
      pink: 'text-[#E255A1]',
      red: 'text-[#FF7369]',
    },
    bg: {
      grey: 'bg-[#454B4E]',
      brown: 'bg-[#594A3A]',
      orange: 'bg-[#594A3A]',
      yellow: 'bg-[#59563B]',
      green: 'bg-[#354C4B]',
      blue: 'bg-[#364954]',
      purple: 'bg-[#443F57]',
      pink: 'bg-[#533B4C]',
      red: 'bg-[#594141]',
    },
    ui: {
      mainWindow: 'bg-[#2F3438]',
      sidebar: 'bg-[#373C3F]',
      hoverItem: 'bg-[#3F4448]',
    },
  },
} as const;

// 기본 내보내기
const notionColors = {
  light: {
    text: NOTION_LIGHT_TEXT_COLORS,
    bg: NOTION_LIGHT_BG_COLORS,
    ui: NOTION_LIGHT_UI_COLORS,
  },
  dark: {
    text: NOTION_DARK_TEXT_COLORS,
    bg: NOTION_DARK_BG_COLORS,
    ui: NOTION_DARK_UI_COLORS,
  },
  classes: NOTION_COLOR_CLASSES,
  utils: {
    getNotionTextColor,
    getNotionBgColor,
    getNotionUiColor,
  },
};

export default notionColors;
