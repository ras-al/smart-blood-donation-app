// src/components/notifications/NotificationList.tsx
import React from 'react';
import { markNotificationAsRead } from '../../services/firestoreService';
import { Notification } from '../../models';

interface NotificationListProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onClose }) => {
    const handleMarkAsRead = (id: string) => {
        markNotificationAsRead(id);
    };

    return (
        <div className="notification-list-container">
            <div className="notification-list">
                <h3>Notifications</h3>
                {notifications.length === 0 ? <p>No notifications.</p> :
                    notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${notif.read ? 'read' : ''}`} onClick={() => handleMarkAsRead(notif.id!)}>
                            <p>{notif.message}</p>
                            <small>{new Date(notif.createdAt?.toDate()).toLocaleString()}</small>
                        </div>
                    ))
                }
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default NotificationList;