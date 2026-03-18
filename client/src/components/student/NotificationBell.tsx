import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShieldCheck, Clock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import api from '../../api';

interface Notification {
  _id: string;
  message: string;
  fromAdmin: boolean;
  read: boolean;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
    const { socket } = useAppContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('student/notifications');
            setNotifications(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Periodic check every 5 mins as fallback
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("mentor_message", (data: any) => {
                fetchNotifications();
                console.log("New mentorship message:", data);
            });
            return () => {
                socket.off("mentor_message");
            };
        }
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`student/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-xl transition-all relative ${isOpen ? 'bg-accent-purple text-white shadow-lg' : 'bg-white/5 text-text-muted hover:text-white'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-accent-error text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-bg-primary shadow-lg animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={14} className="text-accent-purple"/> Intelligence Feed
                            </h3>
                            {unreadCount > 0 && <span className="text-[10px] font-bold text-accent-purple">{unreadCount} New</span>}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div 
                                        key={n._id}
                                        onClick={() => !n.read && markAsRead(n._id)}
                                        className={`p-4 border-b border-white/5 transition-all cursor-pointer hover:bg-white/[0.03] ${!n.read ? 'bg-accent-purple/[0.03] border-l-2 border-l-accent-purple' : 'opacity-60'}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.fromAdmin ? 'bg-accent-blue/10 text-accent-blue' : 'bg-white/5 text-text-muted'}`}>
                                                {n.fromAdmin ? <ShieldCheck size={16}/> : <Bell size={16}/>}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium leading-relaxed">{n.message}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                                    <Clock size={10}/>
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center flex flex-col items-center gap-3 opacity-30">
                                    <Bell size={24}/>
                                    <p className="text-xs font-bold uppercase tracking-widest">No Alerts</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
