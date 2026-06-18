'use client'

import { useEffect,  useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faGraduationCap,
    faBuilding,
    faChalkboardTeacher,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons'
import { Globe, Moon, Sun, Check } from 'lucide-react'
import styles from './selectRole.module.css'
import { useApp } from '../context/AppContext'

export default function SelectRolePage() {
    const { theme, toggleTheme, language, setLanguage, t } = useApp()
    const [selectedRole, setSelectedRole] = useState('')
    const [showLanguageMenu, setShowLanguageMenu] = useState(false)
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

    const router = useRouter()

    const changeLanguage = (lang: 'en' | 'ar') => {
        setLanguage(lang)
        setShowLanguageMenu(false)
    }

    const handleContinue = () => {
        if (selectedRole === 'student') {
            router.push('/signup/student')
        } else if (selectedRole === 'company') {
            router.push('/signup/company')
        } else if (selectedRole === 'mentor') {
            router.push('/signup/mentor')
        } else {
            alert('Please select a role first!')
        }
    }

    return (
        <div className={styles.signupContainer} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.glow} aria-hidden="true" />
            <div className={styles.glowSecondary} aria-hidden="true" />
            <div className={styles.glowTertiary} aria-hidden="true" />

            <div className={styles.backArrow} onClick={() => router.push('/')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </div>

            <div className={styles.card}>
                <header className={styles.cardHeader}>
                    <div className={styles.topIcons}>
                        <div className="position-relative">
                            <button
                                className="icon-toggle-btn"
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                title="Change Language"
                            >
                                <Globe size={20} />
                            </button>
                            <div className={`language-menu ${showLanguageMenu ? 'show' : ''}`} style={{ top: '100%', right: language === 'ar' ? 'auto' : 0, left: language === 'ar' ? 0 : 'auto' }}>
                                <div
                                    className={`language-option ${language === 'en' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    {language === 'en' && <Check size={16} className="me-2 d-inline" />}
                                    {language !== 'en' && <span className="me-2 empty-check-space"></span>}
                                    English
                                </div>
                                <div
                                    className={`language-option ${language === 'ar' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('ar')}
                                >
                                    {language === 'ar' && <Check size={16} className="me-2 d-inline" />}
                                    {language !== 'ar' && <span className="me-2 empty-check-space"></span>}
                                    العربية
                                </div>
                            </div>
                        </div>
                        <button className="icon-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                    <h2>{t.selectYourRole}</h2>
                    <p>{t.selectRoleSubtitle}</p>
                </header>

                <div className={styles.roles}>
                    <label className={styles.roleLabel}>
                        <input
                            type="radio"
                            name="role"
                            value="student"
                            onChange={(e) => setSelectedRole(e.target.value)}
                        />
                        <div className={styles.role}>
                            <div className={`${styles.roleIcon} ${styles.studentIcon}`}>
                                <FontAwesomeIcon icon={faGraduationCap} />
                            </div>
                            <h3>{t.student}</h3>
                            {/* <p style={{ marginTop: '10px', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                {t.studentDesc}
                            </p> */}
                        </div>
                    </label>

                    <label className={styles.roleLabel}>
                        <input
                            type="radio"
                            name="role"
                            value="mentor"
                            onChange={(e) => setSelectedRole(e.target.value)}
                        />
                        <div className={styles.role}>
                            <div className={`${styles.roleIcon} ${styles.mentorIcon}`}>
                                <FontAwesomeIcon icon={faChalkboardTeacher} />
                            </div>
                            <h3>{t.mentor}</h3>
                            {/* <p style={{ marginTop: '10px', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                {t.mentorDesc}
                            </p> */}
                        </div>
                    </label>

                    <label className={styles.roleLabel}>
                        <input
                            type="radio"
                            name="role"
                            value="company"
                            onChange={(e) => setSelectedRole(e.target.value)}
                        />
                        <div className={styles.role}>
                            <div className={`${styles.roleIcon} ${styles.companyIcon}`}>
                                <FontAwesomeIcon icon={faBuilding} />
                            </div>
                            <h3>{t.company}</h3>
                            {/* <p style={{ marginTop: '10px', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                {t.companyDesc}
                            </p> */}
                        </div>
                    </label>
                </div>

                <button className={styles.continueBtn} onClick={handleContinue}>
                    {t.continue} <FontAwesomeIcon icon={faArrowRight} className={language === 'ar' ? 'ms-10 rotate-180' : 'ms-10'} />
                </button>
            </div>
        </div>
    )
}
