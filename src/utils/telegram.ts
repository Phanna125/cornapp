// Telegram WebApp API TypeScript Definitions and Helper Utilities

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  showPopup(params: { title?: string; message: string; buttons?: { id?: string; type?: string; text?: string }[] }, callback?: (id: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
}

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const isTelegramEnvironment = (): boolean => {
  return getTelegramWebApp() !== null;
};

/**
 * Initializes Telegram Mini App settings:
 * 1. Calls ready() & expand() to stretch the view full height
 * 2. Syncs CSS variables with Telegram themeParams
 */
export const initTelegramApp = (): void => {
  const tg = getTelegramWebApp();
  if (!tg) return;

  try {
    tg.ready();
    tg.expand();

    // Sync theme colors with CSS custom properties
    syncTelegramTheme(tg.themeParams, tg.colorScheme);
  } catch (e) {
    console.warn('Error initializing Telegram WebApp:', e);
  }
};

/**
 * Maps Telegram theme parameters directly to CSS custom variables
 */
export const syncTelegramTheme = (params: TelegramThemeParams, colorScheme: 'light' | 'dark' = 'dark'): void => {
  const root = document.documentElement;

  if (params.bg_color) root.style.setProperty('--tg-theme-bg-color', params.bg_color);
  if (params.text_color) root.style.setProperty('--tg-theme-text-color', params.text_color);
  if (params.hint_color) root.style.setProperty('--tg-theme-hint-color', params.hint_color);
  if (params.link_color) root.style.setProperty('--tg-theme-link-color', params.link_color);
  if (params.button_color) root.style.setProperty('--tg-theme-button-color', params.button_color);
  if (params.button_text_color) root.style.setProperty('--tg-theme-button-text-color', params.button_text_color);
  if (params.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color);

  // Set html dark class if appropriate
  if (colorScheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

/**
 * Triggers Telegram Haptic Feedback with silent fallback for desktop
 */
export const triggerHaptic = (
  type: 'impact' | 'notification' | 'selection',
  styleOrType: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning' = 'medium'
): void => {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    try {
      if (type === 'impact') {
        tg.HapticFeedback.impactOccurred(styleOrType as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft');
      } else if (type === 'notification') {
        tg.HapticFeedback.notificationOccurred(styleOrType as 'error' | 'success' | 'warning');
      } else if (type === 'selection') {
        tg.HapticFeedback.selectionChanged();
      }
    } catch (e) {
      console.warn('Haptic feedback error:', e);
    }
  } else if ('vibrate' in navigator) {
    // Web vibration fallback for Android/Safari
    try {
      if (styleOrType === 'success') {
        navigator.vibrate([40, 60, 40]);
      } else if (styleOrType === 'heavy') {
        navigator.vibrate(60);
      } else {
        navigator.vibrate(25);
      }
    } catch {
      // Ignore vibration error
    }
  }
};

/**
 * Configure Telegram MainButton
 */
export const setupMainButton = (
  text: string,
  onClick: () => void,
  options?: { color?: string; textColor?: string }
): (() => void) => {
  const tg = getTelegramWebApp();
  if (!tg || !tg.MainButton) return () => {};

  try {
    tg.MainButton.setText(text);
    if (options?.color) tg.MainButton.color = options.color;
    if (options?.textColor) tg.MainButton.textColor = options.textColor;
    tg.MainButton.show();
    tg.MainButton.enable();

    const handler = () => {
      triggerHaptic('impact', 'medium');
      onClick();
    };

    tg.MainButton.onClick(handler);

    return () => {
      tg.MainButton.offClick(handler);
      tg.MainButton.hide();
    };
  } catch (e) {
    console.warn('Telegram MainButton setup error:', e);
    return () => {};
  }
};

/**
 * Configure Telegram BackButton
 */
export const setupBackButton = (onClick: () => void): (() => void) => {
  const tg = getTelegramWebApp();
  if (!tg || !tg.BackButton) return () => {};

  try {
    tg.BackButton.show();
    const handler = () => {
      triggerHaptic('impact', 'light');
      onClick();
    };
    tg.BackButton.onClick(handler);

    return () => {
      tg.BackButton.offClick(handler);
      tg.BackButton.hide();
    };
  } catch (e) {
    console.warn('Telegram BackButton setup error:', e);
    return () => {};
  }
};
