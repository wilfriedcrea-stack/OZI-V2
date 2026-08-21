import React, { useState, useEffect } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  BookOpen,
  Sparkles,
  Coins,
  Settings,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { notificationService, InAppNotification } from '../../lib/notificationService';

interface NotificationsCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsCenterModal: React.FC<NotificationsCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { openReader, setSelectedWorkId, setActiveView, showToast } = useOzi();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [permissionAsked, setPermissionAsked] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications(list);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRequestPushPermission = async () => {
    const granted = await notificationService.requestPermissions();
    setPermissionAsked(true);
    if (granted) {
      showToast('Notifications Push activées sur cet appareil !', 'success');
      notificationService.sendNotification(
        '🔔 Notifications OZI Activées',
        'Vous serez alerté dès la parution des nouveaux épisodes de vos séries favorites.'
      );
    } else {
      showToast('Permission refusée ou non supportée par le navigateur.', 'info');
    }
  };

  const handleNotificationClick = (notif: InAppNotification) => {
    notificationService.markAsRead(notif.id);
    if (notif.data?.workId) {
      if (notif.data.chapterId) {
        openReader(notif.data.workId, notif.data.chapterId);
      } else {
        setSelectedWorkId(notif.data.workId);
        setActiveView('app_work_detail');
      }
      onClose();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'chapter':
        return <BookOpen className="w-4 h-4 text-[#ff5a50]" />;
      case 'coin':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'event':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-[#10121e] border border-white/10 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#ff5a50]/20 border border-[#ff5a50]/30 flex items-center justify-center text-[#ff5a50]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                <span>Notifications & Alertes</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff5a50] text-white">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400">Sorties d'épisodes, bonus et actualités</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BANNIÈRE PERMISSION PUSH */}
        <div className="p-3 bg-gradient-to-r from-[#ff5a50]/15 to-purple-500/15 border border-[#ff5a50]/30 rounded-2xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#ff5a50] shrink-0" />
            <div className="text-[11px] text-slate-200 leading-tight">
              <strong>Ne ratez aucun épisode :</strong> activez les alertes directes.
            </div>
          </div>
          <button
            onClick={handleRequestPushPermission}
            className="px-3 py-1.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white font-black rounded-xl text-[11px] shrink-0 cursor-pointer shadow-md transition-all tap-active"
          >
            Activer
          </button>
        </div>

        {/* ACTIONS RAPIDES (Tout marquer comme lu / Effacer) */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400 shrink-0">
            <button
              onClick={() => notificationService.markAllAsRead()}
              className="hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tout marquer comme lu</span>
            </button>
            <button
              onClick={() => notificationService.clearAll()}
              className="hover:text-red-400 flex items-center gap-1 cursor-pointer text-slate-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          </div>
        )}

        {/* LISTE DES NOTIFICATIONS */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 text-slate-500 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400">Aucune notification pour le moment.</p>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                Vous recevrez une alerte dès qu'un nouvel épisode ou une offre est disponible.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                  notif.read
                    ? 'bg-[#151726]/60 border-white/5 opacity-75 hover:opacity-100 hover:bg-[#151726]'
                    : 'bg-[#1b1e32] border-[#ff5a50]/30 shadow-md'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getIconForType(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">
                      {new Date(notif.date).toLocaleDateString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {notif.body}
                  </p>

                  {notif.data?.workId && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-[#ff5a50]">
                      <span>Lire le chapitre</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#ff5a50] absolute top-3 right-3 shadow-[0_0_8px_#ff5a50]" />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
