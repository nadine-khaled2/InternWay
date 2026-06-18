'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    UserCircle,
    Video,
    ChevronLeft,
    Menu,
    X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import styles from './mentorLayout.module.css'

export default function MentorLayout({ children }: { children: React.ReactNode }) {
    const { language, t, sidebarOpen, setSidebarOpen } = useApp()
    const pathname = usePathname()
    const router = useRouter()

    const navItems = [
        { href: '/mentor/dashboard', label: t.dashboard, icon: LayoutDashboard },
        { href: '/mentor/sessions', label: t.mySessions, icon: Video },
        { href: '/mentor/mentees', label: t.myMentees, icon: Users },
        { href: '/mentor/profile', label: t.profile, icon: UserCircle },
    ]

    return (
        <div className={`${styles.appLayout} ${language === 'ar' ? styles.rtl : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.glow} aria-hidden="true" />
            <div className={styles.glowSecondary} aria-hidden="true" />
            <div className={styles.glowTertiary} aria-hidden="true" />

            {/* Overlay */}
            <div
                className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.logoSection}>
                    <div className={styles.backButton} onClick={() => router.push('/')}>
                        <ChevronLeft size={20} />
                    </div>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>IW</div>
                        <span className={styles.logoText}>InternWay</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}