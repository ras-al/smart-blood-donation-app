// src/components/notifications/NotificationBell.tsx
import React, { useState } from 'react';
import { useAuth } from '../../App';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import NotificationList from './NotificationList';
import { Notification } from '../../models';

const NotificationBell: React.FC = () => {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Create a query that is only active if there is a current user
    const notificationsQuery = currentUser
        ? query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.userId),
            orderBy('createdAt', 'desc')
          )
        : null;

    // The hook will handle the null query and return an empty array
    const [notifications, loading] = useFirestoreQuery<Notification>(notificationsQuery!);
    
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-bell">
            <button onClick={() => setIsOpen(!isOpen)} className="bell-button">
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {isOpen && <NotificationList notifications={notifications} onClose={() => setIsOpen(false)} />}
        </div>
    );
};

export default NotificationBell;