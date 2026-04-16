import { useCallback, useMemo } from 'react';

export function useTelegram() {
  const tg = useMemo(() => window.Telegram?.WebApp, []);

  const initData = tg?.initData || '';
  const initDataUnsafe = tg?.initDataUnsafe;
  const user = initDataUnsafe?.user;
  const startParam = initDataUnsafe?.start_param || '';
  const colorScheme = tg?.colorScheme || 'light';
  const themeParams = tg?.themeParams || {};

  const expand = useCallback(() => {
    tg?.expand();
  }, [tg]);

  const ready = useCallback(() => {
    tg?.ready();
  }, [tg]);

  const close = useCallback(() => {
    tg?.close();
  }, [tg]);

  const showAlert = useCallback(
    (message: string, callback?: () => void) => {
      if (tg) {
        tg.showAlert(message, callback);
      } else {
        alert(message);
        callback?.();
      }
    },
    [tg],
  );

  const showConfirm = useCallback(
    (message: string, callback?: (confirmed: boolean) => void) => {
      if (tg) {
        tg.showConfirm(message, callback);
      } else {
        const result = confirm(message);
        callback?.(result);
      }
    },
    [tg],
  );

  const hapticFeedback = useCallback(
    (type: 'impact' | 'notification' | 'selection', style?: string) => {
      if (!tg?.HapticFeedback) return;
      if (type === 'impact') {
        tg.HapticFeedback.impactOccurred((style as 'light' | 'medium' | 'heavy') || 'light');
      } else if (type === 'notification') {
        tg.HapticFeedback.notificationOccurred((style as 'success' | 'error' | 'warning') || 'success');
      } else {
        tg.HapticFeedback.selectionChanged();
      }
    },
    [tg],
  );

  const mainButton = tg?.MainButton;
  const backButton = tg?.BackButton;

  return {
    tg,
    initData,
    initDataUnsafe,
    user,
    startParam,
    colorScheme,
    themeParams,
    expand,
    ready,
    close,
    showAlert,
    showConfirm,
    hapticFeedback,
    mainButton,
    backButton,
  };
}
