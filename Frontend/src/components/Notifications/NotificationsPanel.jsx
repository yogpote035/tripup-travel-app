import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, CheckCheck, Trash2, Sparkles, CircleAlert } from 'lucide-react';
import { fetchNotifications, markRead as markReadThunk, markAllRead as markAllReadThunk, clearAllNotifications as clearAllNotificationsThunk } from '../../../AllStatesFeatures/Notifications/NotificationsSlice';

export default function NotificationsPanel() {
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const { items, unread, loading, pagination } = useSelector((s) => s.notifications);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const panelRef = useRef(null);
    const buttonRef = useRef(null);
    const limit = 8;

    useEffect(() => {
        if (!user) return;
        if (!open) return;
        dispatch(fetchNotifications({ page, limit }));
    }, [user, open, page, limit, dispatch]);

    useEffect(() => {
        if (!user) return;
        setPage(1);
    }, [user]);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event) => {
            const clickedInsidePanel = panelRef.current?.contains(event.target);
            const clickedToggle = buttonRef.current?.contains(event.target);
            if (!clickedInsidePanel && !clickedToggle) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [open]);

    const markRead = (id) => {
        if (!id) return;
        dispatch(markReadThunk(id));
    };

    const markAllRead = () => {
        dispatch(markAllReadThunk());
    };

    const clearAll = () => {
        dispatch(clearAllNotificationsThunk());
    };

    return (
        <div className="relative">
            <button ref={buttonRef} onClick={() => setOpen((v) => !v)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-stone-700 shadow-sm transition hover:border-orange-300 hover:text-orange-500">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">{unread}</span>}
            </button>

            {open && (
                <div ref={panelRef} className="absolute right-0 mt-2 w-88 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-xl shadow-orange-100/80 z-50">
                    <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-orange-500" />
                                    <strong className="text-sm text-stone-800">Notifications</strong>
                                </div>
                                <div className="mt-1 text-[11px] text-stone-500">{pagination.total ?? items.length} total</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={markAllRead} className="flex items-center gap-1 rounded-full border border-orange-200 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:border-orange-300 hover:text-orange-600">
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                                <button onClick={clearAll} disabled={items.length === 0} className="flex items-center gap-1 rounded-full border border-rose-200 px-2.5 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Clear all
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-auto bg-stone-50/70">
                        {loading && items.length === 0 ? (
                            <div className="flex items-center gap-2 p-4 text-sm text-stone-500">
                                <CircleAlert className="h-4 w-4 text-orange-400" />
                                Loading notifications…
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-6 text-center text-sm text-stone-500">
                                <div className="mb-2 flex justify-center">
                                    <Bell className="h-8 w-8 text-orange-300" />
                                </div>
                                No notifications yet
                            </div>
                        ) : (
                            items.map((n) => (
                                <div key={n._id || n.id} className={`border-b border-orange-100 p-3 transition ${n.read ? 'bg-white' : 'bg-orange-50/80'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-stone-800">{n.title || n.type || 'Update'}</div>
                                            <div className="mt-1 text-xs leading-5 text-stone-600">{n.message}</div>
                                            <div className="mt-2 text-[10px] uppercase tracking-wide text-stone-400">{new Date(n.createdAt).toLocaleString()}</div>
                                        </div>
                                        {!n.read && <button onClick={() => markRead(n._id || n.id)} className="shrink-0 rounded-full border border-orange-200 px-2 py-1 text-[11px] font-medium text-orange-600 transition hover:bg-orange-100">Mark</button>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between border-t border-orange-100 bg-white px-3 py-2 text-xs text-stone-600">
                            <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-full border border-orange-200 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
                            <span>Page {page} / {pagination.pages}</span>
                            <button disabled={page >= pagination.pages} onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))} className="rounded-full border border-orange-200 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
