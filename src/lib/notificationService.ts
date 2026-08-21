import { Capacitor } from '@capacitor/core';
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
  private permissionGranted: boolean = false;
  private listeners: ((notifications: InAppNotification[]) => void)[] = [];
  private notificationsHistory: InAppNotification[] = [];
  private channelsCreated: boolean = false;

  constructor() {
    try {
      this.isNative = Capacitor.isNativePlatform();
      this.loadLocalHistory();
    } catch (e) {
      console.warn('Erreur constructeur notificationService:', e);
    }
  }

  public async ensureChannels() {
    if (!this.isNative || this.channelsCreated) return;
    try {
      // Création du canal de notification Android
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
        description: 'Recharges de pièces et réponses aux commentaires',
        importance: 4,
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
            title: 'Bienvenue sur OZI Webtoon ! 🎉',
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
   * Déclenche une notification immédiate (sur l'appareil en dehors de l'app + dans le centre de notifications)
   */
  public async sendNotification(
    title: string,
    body: string,
    type: 'chapter' | 'system' | 'coin' | 'event' = 'system',
    data?: any
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

    // 2. Notification système / device
    try {
      if (this.isNative) {
        await this.ensureChannels();
        const channelId = type === 'chapter' ? 'ozi_releases' : 'ozi_activity';
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 90000) + 1000,
              title,
              body,
              schedule: { at: new Date(Date.now() + 300) },
              channelId,
              extra: data,
            },
          ],
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
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
