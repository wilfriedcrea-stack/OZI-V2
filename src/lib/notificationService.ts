import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'chapter' | 'system' | 'coin' | 'event';
  read: boolean;
  date: string;
  data?: any;
}

type NotificationClickHandler = (data: any) => void;

class NotificationService {
  private isNative: boolean = false;
  private permissionGranted: boolean = false;
  private listeners: ((notifications: InAppNotification[]) => void)[] = [];
  private clickHandlers: NotificationClickHandler[] = [];
  private notificationsHistory: InAppNotification[] = [];
  private channelsCreated: boolean = false;

  constructor() {
    try {
      this.isNative = Capacitor.isNativePlatform();
      this.loadLocalHistory();
      this.initNativeListeners();
    } catch (e) {
      console.warn('Erreur constructeur notificationService:', e);
    }
  }

  private async initNativeListeners() {
    if (!this.isNative) return;
    try {
      await this.ensureChannels();
      
      // Écouteur de clic sur notification native (quand l'utilisateur clique hors de l'application)
      await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (notificationAction: ActionPerformed) => {
          const extra = notificationAction.notification.extra;
          if (extra) {
            this.clickHandlers.forEach((handler) => handler(extra));
          }
        }
      );

      // Vérifier permissions au démarrage
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') {
        this.permissionGranted = true;
      }
    } catch (e) {
      console.warn('Erreur init native listeners notification:', e);
    }
  }

  public registerClickHandler(handler: NotificationClickHandler) {
    this.clickHandlers.push(handler);
    return () => {
      this.clickHandlers = this.clickHandlers.filter((h) => h !== handler);
    };
  }

  public async ensureChannels() {
    if (!this.isNative || this.channelsCreated) return;
    try {
      // Création du canal principal de notification Android
      await LocalNotifications.createChannel({
        id: 'ozi_releases',
        name: 'Nouveaux Chapitres & Sorties',
        description: 'Alertes lors de la parution de nouveaux épisodes',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#ff5a50',
      });

      await LocalNotifications.createChannel({
        id: 'ozi_activity',
        name: 'Activité & Pièces',
        description: 'Recharges de pièces, bonus et réponses aux commentaires',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#ff5a50',
      });

      this.channelsCreated = true;
    } catch (e) {
      console.warn('Erreur création canaux notifications:', e);
    }
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
            title: 'Bienvenue sur OZI Webtoons ! 🎉',
            body: 'Découvrez les meilleurs webtoons et mangas africains.',
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
   * Demande la permission pour les notifications (Android Local Notifications & Web Notification API)
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (this.isNative) {
        await this.ensureChannels();
        const localPerm = await LocalNotifications.requestPermissions();
        this.permissionGranted = localPerm.display === 'granted';
        return this.permissionGranted;
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

  /**
   * Déclenche une notification immédiate ou différée (sur l'écran de verrouillage et le volet Android / navigateur hors appli)
   */
  public async sendNotification(
    title: string,
    body: string,
    type: 'chapter' | 'system' | 'coin' | 'event' = 'system',
    data?: any,
    delaySeconds: number = 0
  ) {
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

    // 2. Notification système / device (hors de l'application)
    try {
      if (this.isNative) {
        await this.ensureChannels();
        const channelId = type === 'chapter' ? 'ozi_releases' : 'ozi_activity';
        const notifId = Math.floor(Math.random() * 90000) + 1000;
        
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title,
              body,
              schedule: delaySeconds > 0 
                ? { at: new Date(Date.now() + delaySeconds * 1000) } 
                : { at: new Date(Date.now() + 200) },
              channelId,
              extra: data,
              actionTypeId: 'OPEN_APP',
            },
          ],
        });
      } else if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          if (delaySeconds > 0) {
            setTimeout(() => {
              new Notification(title, {
                body,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                data,
              });
            }, delaySeconds * 1000);
          } else {
            new Notification(title, {
              body,
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-192.png',
              data,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Notification système locale note:', e);
    }
  }

  private addInAppNotification(notif: InAppNotification) {
    this.notificationsHistory = [notif, ...this.notificationsHistory.slice(0, 49)];
    this.saveHistory();
  }

  /**
   * Planifie un rappel de lecture ou bonus quotidien en arrière-plan
   */
  public async scheduleDailyReminder(hoursFromNow: number = 24) {
    try {
      if (this.isNative) {
        await this.ensureChannels();
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9991,
              title: '🎁 Votre bonus OZI Coins est disponible !',
              body: 'Revenez récupérer vos pièces gratuites et lire les derniers chapitres.',
              schedule: { at: new Date(Date.now() + hoursFromNow * 3600 * 1000) },
              channelId: 'ozi_activity',
            },
          ],
        });
      }
    } catch (e) {
      console.warn('Erreur planification rappel:', e);
    }
  }

  /**
   * Déclenche une notification de test différée pour tester hors de l'application
   */
  public async sendTestExternalNotification(delaySeconds: number = 4) {
    await this.requestPermissions();
    await this.sendNotification(
      '🚀 Test de Notification Hors Appli !',
      'Ce message s\'affiche directement dans votre volet Android et écran de verrouillage.',
      'system',
      { test: true },
      delaySeconds
    );
  }

  /**
   * Déclenche une notification ciblée lors de la publication d'un nouveau chapitre
   */
  public async notifyNewChapter(workTitle: string, chapterTitle: string, workId: string, chapterId: string) {
    await this.sendNotification(
      `🔥 Nouveau Chapitre : ${workTitle}`,
      `L'épisode "${chapterTitle}" vient d'être publié ! Touchez pour commencer la lecture.`,
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
