import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from './useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [] } = useUnreadNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await markAsRead.mutateAsync(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center border-2 border-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <span className="font-bold text-sm text-slate-700">Notificaciones</span>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No tienes notificaciones pendientes.</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {notif.subject && <div className="font-bold text-xs text-slate-800 truncate">{notif.subject}</div>}
                    <div className="text-xs text-slate-600 mt-0.5 break-words">{notif.body}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition shrink-0"
                    title="Marcar como leída"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
