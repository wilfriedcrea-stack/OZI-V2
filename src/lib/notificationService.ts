import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'chapter' | 'system' | 'coin' | 'event';
  read: boolean;
  date: string;
  data?: any;
}

class NotificationService {
  private isNative: boolean = false;
  private isPushSupported: boolean = false;
  private permissionGranted: boolean = false;
  private listeners: ((notifications: InAppNotification[]) => void)[] = [];
  private notificationsHistory: InAppNotification[] = [];

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.isPushSupported = this.isNative;
    this.loadLocalHistory();
  }

  private loadLocalHistory() {
    try {
      const stored = localStorage.getItem('ozi_notifications_history');
      if (stored) {
        this.notificationsHistory = JSON.parse(stored);
      } else {
        // Notifications d'accueil par défaut
        this.notificationsHistory = [
          {
            id: 'notif-welcome',
            title: 'Bienvenue sur OZI Webtoon ! 🎉',
            body: 'découvre ton prochain webtoon préferé ! ',
            type: 'system',
            read: false,
            date: new Date().toISOString(),
          },
          {
            id: 'notif-chapter-1',
            title: '⚡ Nouveau Chapitre Disponible !',
            body: 'Le nouvel épisode de "L’Ombre du Monarque" vient de sortir. Venez le découvrir dès maintenant.',
            type: 'chapter',
            read: false,
            date: new Date(Date.now() - 3600000 * 4).toISOString(),
            data: { workId: 'work-1', chapterId: 'ch-1-1' },
          },
        ];
        this.saveHistory();
      }
    } catch (e) {
      console.warn('Erreur chargement notifications locales:', e);
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem('ozi_notifications_history', JSON.stringify(this.notificationsHistory));
      this.notifyListeners();
    } catch (e) {
      console.warn('Erreur sauvegarde notifications locales:', e);
    }
  }

  public subscribe(listener: (notifications: InAppNotification[]) => void) {
    this.listeners.push(listener);
    listener(this.notificationsHistory);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.notificationsHistory));
  }

  public getHistory(): InAppNotification[] {
    return this.notificationsHistory;
  }

  public markAsRead(notificationId: string) {
    this.notificationsHistory = this.notificationsHistory.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveHistory();
  }

  public markAllAsRead() {
    this.notificationsHistory = this.notificationsHistory.map((n) => ({ ...n, read: true }));
    this.saveHistory();
  }

  public clearAll() {
    this.notificationsHistory = [];
    this.saveHistory();
  }

  /**
   * Demande la permission pour les notifications (Push Android & Web Notification API)
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (this.isNative) {
        // En environnement Android natif Capacitor
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === 'granted') {
          this.permissionGranted = true;
          await this.initNativePush();
          return true;
        }

        // Vérifier aussi les notifications locales
        const localPerm = await LocalNotifications.requestPermissions();
        return localPerm.display === 'granted';
      } else {
        // En environnement Web (Browser)
        if ('Notification' in window) {
          const result = await Notification.requestPermission();
          this.permissionGranted = result === 'granted';
          return this.permissionGranted;
        }
      }
    } catch (error) {
      console.warn('Impossible de demander la permission de notifications:', error);
    }
    return false;
  }

  private async initNativePush() {
    try {
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push Registration Token OZI:', token.value);
        localStorage.setItem('ozi_fcm_token', token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Erreur enregistrement Push:', JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        this.addInAppNotification({
          id: `push-${Date.now()}`,
          title: notification.title || 'Nouveau message OZI',
          body: notification.body || '',
          type: 'system',
          read: false,
          date: new Date().toISOString(),
          data: notification.data,
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('Action sur notification reçue:', action.notification);
      });
    } catch (err) {
      console.warn('Initialisation push natif:', err);
    }
  }

  /**
   * Déclenche une notification immédiate (sur l'appareil + dans le centre de notifications)
   */
  public async sendNotification(title: string, body: string, type: 'chapter' | 'system' | 'coin' | 'event' = 'system', data?: any) {
    const notif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      type,
      read: false,
      date: new Date().toISOString(),
      data,
    };

    // 1. Ajouter dans l'historique in-app
    this.addInAppNotification(notif);

    // 2. Notification système / device
    try {
      if (this.isNative) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000),
              title,
              body,
              schedule: { at: new Date(Date.now() + 500) },
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#ff5a50',
              extra: data,
            },
          ],
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    } catch (e) {
      console.log('Notification système envoyée en mode in-app:', e);
    }
  }

  private addInAppNotification(notif: InAppNotification) {
    this.notificationsHistory = [notif, ...this.notificationsHistory.slice(0, 49)];
    this.saveHistory();
  }

  /**
   * Déclenche une notification ciblée lors de la publication d'un nouveau chapitre
   */
  public async notifyNewChapter(workTitle: string, chapterTitle: string, workId: string, chapterId: string) {
    await this.sendNotification(
      `🔥 Nouveau Chapitre : ${workTitle}`,
      `L'épisode "${chapterTitle}" vient d'être publié ! Cliquez pour commencer la lecture.`,
      'chapter',
      { workId, chapterId }
    );
  }

  /**
   * Déclenche une notification lors d'un rechargement de pièces réussi
   */
  public async notifyCoinRecharge(amount: number) {
    await this.sendNotification(
      `💰 Rechargement OZI Coins Réussi !`,
      `Votre compte a été crédité de ${amount} pièces. Profitez de vos lectures !`,
      'coin'
    );
  }

  /**
   * Déclenche une notification lorsqu'un utilisateur ou l'auteur répond à un commentaire
   */
  public async notifyCommentReply(replierName: string, replyText: string, workId?: string, chapterId?: string) {
    const preview = replyText.length > 60 ? `${replyText.slice(0, 60)}...` : replyText;
    await this.sendNotification(
      `💬 ${replierName} a répondu à votre commentaire`,
      `"${preview}"`,
      'system',
      { workId, chapterId }
    );
  }
}

export const notificationService = new NotificationService();
