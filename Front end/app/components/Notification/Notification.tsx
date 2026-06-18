'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, Info, AlertTriangle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useApp } from '../../context/AppContext'
import styles from './Notification.module.css'
import { notificationService, NotificationItem } from '../../services/notificationService'

function formatTimeAgo(dateString: string, language: 'en' | 'ar'): string {
    if (!dateString) return '';
    
    // Check if it's already a relative time string (e.g. "Just now", "2 hours ago")
    if (dateString.includes(' ') && !dateString.includes('T') && !dateString.includes('-') && !dateString.includes(':')) {
        return dateString;
    }
    
    // Normalize date string to avoid timezone parsing bugs with high-precision fractional seconds
    let normalized = dateString;
    if (normalized.includes('T') && 
        !normalized.endsWith('Z') && !normalized.endsWith('z') && 
        !normalized.includes('+') && 
        !/\-\d{2}:\d{2}$/.test(normalized)
    ) {
        normalized = `${normalized}Z`;
    }
    
    if (normalized.includes('.') && (normalized.endsWith('Z') || normalized.endsWith('z'))) {
        const [mainPart, subPart] = normalized.split('.');
        const digits = subPart.replace(/[^\d]/g, '');
        const truncated = digits.substring(0, 3).padEnd(3, '0');
        normalized = `${mainPart}.${truncated}Z`;
    }

    const date = new Date(normalized);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (isNaN(date.getTime()) || seconds < 0) return language === 'ar' ? 'الآن' : 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (language === 'ar') {
        if (seconds < 60) return 'الآن';
        if (minutes === 1) return 'منذ دقيقة';
        if (minutes === 2) return 'منذ دقيقتين';
        if (minutes < 11) return `منذ ${minutes} دقائق`;
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        
        if (hours === 1) return 'منذ ساعة';
        if (hours === 2) return 'منذ ساعتين';
        if (hours < 11) return `منذ ${hours} ساعات`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        
        if (days === 1) return 'أمس';
        if (days === 2) return 'منذ يومين';
        if (days < 11) return `منذ ${days} أيام`;
        return `منذ ${days} يوم`;
    } else {
        if (seconds < 60) return 'Just now';
        if (minutes === 1) return '1 minute ago';
        if (minutes < 60) return `${minutes} minutes ago`;
        
        if (hours === 1) return '1 hour ago';
        if (hours < 24) return `${hours} hours ago`;
        
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    }
}

const Notification: React.FC = () => {
    const { language, notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useApp()
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleDropdown = () => {
        if (!isOpen) {
            fetchNotifications() // جلب الإشعارات عند فتح القائمة
        }
        setIsOpen(!isOpen)
    }

    const handleNotificationClick = async (notification: NotificationItem) => {
        // 1. تعليم كـ مقروء لو مش مقروء
        if (!notification.isRead) {
            await markAsRead(notification.notificationId)
        }

        // 2. إغلاق القائمة
        setIsOpen(false)

        // 3. التوجيه بناءً على النوع والـ ID والـ Role
        const isMentor = pathname?.startsWith('/mentor')
        const isStudent = pathname?.startsWith('/student')
        const id = notification.relatedEntityId

        switch (notification.type) {
            case 'MentorSession':
                if (id) {
                    router.push(`/mentor/sessions?sessionId=${id}`)
                } else {
                    router.push(`/mentor/sessions`)
                }
                break
            case 'StudentSession':
                if (id) {
                    router.push(`/student/sessions?sessionId=${id}`)
                } else {
                    router.push(`/student/sessions`)
                }
                break
            case 'CompanyApplication':
                if (id) {
                    router.push(`/company/applicants?internId=${id}`)
                } else {
                    router.push(`/company/applicants`)
                }
                break
            case 'StudentApplication':
                router.push(`/student/internships`)
                break
            case 'Session':
                if (isMentor) {
                    if (id) {
                        router.push(`/mentor/sessions?sessionId=${id}`)
                    } else {
                        router.push(`/mentor/sessions`)
                    }
                } else {
                    router.push(`/student/sessions`)
                }
                break
            case 'Internship':
                if (isStudent) {
                    router.push(`/student/internships`)
                } else {
                    if (id) {
                        router.push(`/company/applicants?internId=${id}`)
                    } else {
                        router.push(`/company/applicants`)
                    }
                }
                break
            case 'Mentorship':
                router.push(`/student/mentorships`)
                break
            default:
                // لو نوع غير معروف، مفيش توجيه محدد
                break
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check size={16} className={styles.successIcon} />
            case 'warning': return <AlertTriangle size={16} className={styles.warningIcon} />
            default: return <Info size={16} className={styles.infoIcon} />
        }
    }

    return (
        <div className={styles.notificationWrapper} ref={dropdownRef}>
            <button 
                className={styles.bellButton} 
                onClick={toggleDropdown}
                aria-label="Toggle notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={`${styles.dropdown} ${language === 'ar' ? styles.rtl : ''}`}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>{language === 'ar' ? 'التنبيهات' : 'Notifications'}</h3>
                        <button 
                            onClick={markAllAsRead} 
                            className={styles.markAll}
                            disabled={unreadCount === 0}
                        >
                            {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                        </button>
                    </div>

                    <div className={styles.list}>
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div 
                                    key={notification.notificationId} 
                                    className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={styles.iconBox}>
                                        {getIcon(notification.type.toLowerCase())}
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.itemHeader}>
                                            <span className={styles.itemTitle}>{notification.title}</span>
                                            <span className={styles.time}>
                                                {formatTimeAgo(notification.createdAt || notification.timeAgo, language)}
                                            </span>
                                        </div>
                                        <p className={styles.message}>{notification.message}</p>
                                    </div>
                                    {!notification.isRead && <div className={styles.unreadDot} />}
                                </div>
                            ))
                        ) : (
                            <div className={styles.empty}>
                                {language === 'ar' ? 'لا توجد تنبيهات جديدة' : 'No new notifications'}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}

export default Notification
