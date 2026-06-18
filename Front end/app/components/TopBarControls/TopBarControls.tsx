'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Sun, Moon, LogOut, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Notification from '../Notification/Notification'
import styles from './TopBarControls.module.css'

export default function TopBarControls() {
    const { theme, toggleTheme, language, setLanguage, t, logout } = useApp()
    const [showLanguageMenu, setShowLanguageMenu] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isLanguageButton = target.closest('button') && 
                (target.closest('button')?.querySelector('.lucide-globe') || 
                 target.closest('svg')?.classList.contains('lucide-globe') ||
                 target.closest('button')?.getAttribute('title')?.includes('Language') ||
                 target.closest('button')?.getAttribute('title')?.includes('اللغة'));
            const isLanguageMenu = target.closest('.language-menu');
            if (!isLanguageButton && !isLanguageMenu) {
                setShowLanguageMenu(false);
            }
        };
        if (showLanguageMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showLanguageMenu]);

    const changeLanguage = (lang: 'en' | 'ar') => {
        setLanguage(lang)
        setShowLanguageMenu(false)
    }

    return (
        <div className={styles.topBarControls}>
            <div className={styles.languageWrapper}>
                <button
                    className={styles.iconButton}
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    title={t.changeLanguage}
                >
                    <Globe size={20} />
                </button>
                <div className={`language-menu ${showLanguageMenu ? 'show' : ''}`}>
                    <div
                        className={`language-option ${language === 'en' ? 'active' : ''}`}
                        onClick={() => changeLanguage('en')}
                    >
                        {language === 'en' && <Check size={16} />}
                        English
                    </div>
                    <div
                        className={`language-option ${language === 'ar' ? 'active' : ''}`}
                        onClick={() => changeLanguage('ar')}
                    >
                        {language === 'ar' && <Check size={16} />}
                        العربية
                    </div>
                </div>
            </div>
            <button className={styles.iconButton} onClick={toggleTheme} title={t.toggleTheme}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Notification />
            <button className={styles.iconButton} onClick={logout} title={t.logout}>
                <LogOut size={20} />
            </button>
        </div>
    )
}
