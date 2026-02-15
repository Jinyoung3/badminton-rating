'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getPendingCorrectionRequestsForRespondent } from '@/actions/corrections';

export interface NotificationItem {
  id: string;
  matchId: string;
  requesterName: string;
  reason: string;
  createdAt: Date | string;
}

interface NotificationDropdownProps {
  items: NotificationItem[];
}

export default function NotificationDropdown({ items: initialItems }: NotificationDropdownProps) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    getPendingCorrectionRequestsForRespondent().then(setItems);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const count = items.length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="p-2 border-b border-gray-100 font-semibold text-sm text-gray-700">
            Notifications
          </div>
          <div className="max-h-72 overflow-y-auto">
            {count === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                No new notifications
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/matches/${item.matchId}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-3 hover:bg-amber-50 border-b border-gray-50 last:border-0"
                >
                  <div className="text-xs text-amber-600 font-medium">Score correction request</div>
                  <div className="text-sm text-gray-800 mt-0.5">
                    {item.requesterName} requested a score change
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{item.reason}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
