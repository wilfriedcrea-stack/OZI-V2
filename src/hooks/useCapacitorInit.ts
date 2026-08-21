import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

export const useCapacitorInit = (onBackAction?: () => boolean) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Configurer la Status Bar Android
    const initNativeFeatures = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#07080c' });
      } catch (err) {
        console.warn('StatusBar not available', err);
      }

      try {
        await SplashScreen.hide();
      } catch (err) {
        console.warn('SplashScreen not available', err);
      }
    };

    initNativeFeatures();

    // Gestion du bouton physique retour Android (Hardware Back Button)
    const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (onBackAction) {
        const handled = onBackAction();
        if (handled) return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      backButtonListener.then((listener) => listener.remove()).catch(() => {});
    };
  }, [onBackAction]);
};
