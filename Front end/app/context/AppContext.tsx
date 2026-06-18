'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { translations, Language } from '../locales/translations'
import { notificationService, NotificationItem } from '../services/notificationService'
import api from '../lib/api'

type Theme = 'light' | 'dark'

export interface Slot {
    id: number
    day: string
    time: string
}

interface AppContextType {
    theme: Theme
    language: Language
    toggleTheme: () => void
    setLanguage: (lang: Language) => void
    t: typeof translations.en
    slots: Slot[]
    setSlots: (slots: Slot[]) => void
    addSlots: (newSlots: Slot[]) => void
    deleteSlot: (id: number) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    notifications: NotificationItem[]
    unreadCount: number
    fetchNotifications: () => Promise<void>
    markAsRead: (id: number) => Promise<void>
    markAllAsRead: () => Promise<void>
    logout: () => Promise<void>
    refreshKey: number
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [language, setLanguage] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const [token, setToken] = useState<string | null>(null)
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

  
    const [refreshKey, setRefreshKey] = useState(0);
      useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 15000);
    return () => clearInterval(interval);
  }, []);


    // Sync token on pathname changes (supporting both localStorage and sessionStorage)
    useEffect(() => {
        if (!mounted) return
        const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (currentToken !== token) {
            setToken(currentToken)
        }
    }, [pathname, token, mounted])

    // Load initial notifications and count
    const fetchNotifications = async () => {
        if (typeof window === 'undefined' || !(localStorage.getItem('token') || sessionStorage.getItem('token'))) return
        try {
            const data = await notificationService.getAll()
            setNotifications(data)
            const count = data.filter(n => !n.isRead).length
            setUnreadCount(count)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const fetchInitialData = async () => {
        if (typeof window === 'undefined' || !(localStorage.getItem('token') || sessionStorage.getItem('token'))) return
        try {
            const count = await notificationService.getUnreadCount()
            setUnreadCount(count)
        } catch (error) {
            console.error('Error fetching unread count:', error)
        }
    }

    useEffect(() => {
        if (mounted && token) {
            fetchInitialData()
        }
    }, [token, mounted])

    // SignalR Connection
    useEffect(() => {
        if (!mounted || !token) return

        let connection: any = null

        const startSignalR = async () => {
            try {
                const signalR = await import('@microsoft/signalr')
                const hubUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://swdp54wg-5022.uks1.devtunnels.ms'}/notificationHub`
                
                connection = new signalR.HubConnectionBuilder()
                    .withUrl(hubUrl, {
                        accessTokenFactory: () => localStorage.getItem('token') || sessionStorage.getItem('token') || ''
                    })
                    .withAutomaticReconnect()
                    .build()

                connection.on('ReceiveNotification', (notification: any) => {
                    console.log('New real-time notification received:', notification)
                    
                    const newItem: NotificationItem = {
                        notificationId: notification.notificationId || Date.now(),
                        title: notification.title || 'New Notification',
                        message: notification.message || '',
                        type: notification.type || 'System',
                        relatedEntityId: notification.relatedEntityId,
                        isRead: false,
                        createdAt: notification.createdAt || new Date().toISOString(),
                        timeAgo: 'Just now'
                    }

                    setNotifications(prev => [newItem, ...prev])
                    setUnreadCount(prev => prev + 1)
                })

                await connection.start()
                console.log('SignalR Hub connected successfully!')
            } catch (err) {
                console.warn('SignalR Hub connection failed:', err)
            }
        }

        startSignalR()

        return () => {
            if (connection) {
                connection.stop()
            }
        }
    }, [token, mounted])

    const markAsRead = async (id: number) => {
        try {
            setNotifications(prev => prev.map(n => 
                n.notificationId === id ? { ...n, isRead: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
            await notificationService.markAsRead(id)
        } catch (error) {
            console.error('Error marking as read:', error)
            fetchNotifications()
        }
    }

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
            await notificationService.markAllAsRead()
        } catch (error) {
            console.error('Error marking all as read:', error)
            fetchNotifications()
        }
    }
    const logout = async () => {
        const currentToken = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null

        // 1. Instant local cleanup
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('refreshToken')
            sessionStorage.removeItem('user')
            window.location.href = '/login'
        }
        setToken(null)
        setNotifications([])
        setUnreadCount(0)

        // 2. Perform API call in background
        if (currentToken) {
            try {
                await api.delete('/Account/logout')
            } catch (err) {
                console.error('Logout API request failed:', err)
            }
        }
    }

    const [slots, setSlots] = useState<Slot[]>([
        { id: 1, day: 'Monday, Jan 22', time: '10:00 AM - 11:30 AM' },
        { id: 2, day: 'Wednesday, Jan 24', time: '2:00 PM - 4:00 PM' },
        { id: 3, day: 'Friday, Jan 26', time: '1:00 PM - 2:00 PM' },
    ])

    const addSlots = (newSlots: Slot[]) => setSlots(prev => [...prev, ...newSlots])
    const deleteSlot = (id: number) => setSlots(prev => prev.filter(s => s.id !== id))

    useEffect(() => {
        // Load saved preferences
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme
            const savedLanguage = localStorage.getItem('language') as Language

            if (savedTheme) setTheme(savedTheme)
            if (savedLanguage) setLanguage(savedLanguage)

            // Handle "Remember Me" session checks
            const rememberMe = localStorage.getItem('rememberMe') === 'true'
            const sessionActive = sessionStorage.getItem('sessionActive') === 'true'
            if (!rememberMe && !sessionActive) {
                // Not remembered and new tab/session, clear auth info
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
            }
            // Mark session as active so it doesn't clear during tab navigation
            sessionStorage.setItem('sessionActive', 'true')
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        // Apply theme
        document.documentElement.setAttribute('data-theme', theme)
        if (theme === 'light') {
            document.body.classList.add('light-mode')
        } else {
            document.body.classList.remove('light-mode')
        }

        // Apply language
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
        document.documentElement.setAttribute('lang', language)

        // Save to localStorage only on client
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme)
            localStorage.setItem('language', language)
        }
    }, [theme, language, mounted])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    const value = {
        theme,
        language,
        toggleTheme,
        setLanguage,
        t: translations[language],
        slots,
        setSlots,
        addSlots,
        deleteSlot,
        sidebarOpen,
        setSidebarOpen,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        logout,


        refreshKey,
        setRefreshKey
    }

    // Prevent hydration mismatch by rendering nothing until mounted
    // or render with default values but ensure consistency
    // Always render provider to support SSG/SSR
    return (
        <AppContext.Provider value={value}>
            {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
