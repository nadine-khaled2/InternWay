'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Globe, Moon, Sun, Check } from 'lucide-react'

import api from '../lib/api'

type Language = 'en' | 'ar'
type Theme = 'dark' | 'light'

const translations = {
    en: {
        title: "Forgot Password?",
        subtitle: "Enter your email address and we'll send you a link to reset your password.",
        emailLabel: "Email Address *",
        emailPlaceholder: "Enter your email",
        sendButton: "Send Reset Link",
        backToLogin: "Back to Login",
        successTitle: "Check Your Email",
        successMessage: "We've sent a password reset link to your email address. Please check your inbox and follow the instructions.",
        errorTitle: "Error",
        invalidEmail: "Please enter a valid email address",
        emailRequired: "Email is required",
    },
    ar: {
        title: "نسيت كلمة المرور؟",
        subtitle: "أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
        emailLabel: "البريد الإلكتروني *",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        sendButton: "إرسال رابط إعادة التعيين",
        backToLogin: "العودة لتسجيل الدخول",
        successTitle: "تحقق من بريدك الإلكتروني",
        successMessage: "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد واتباع التعليمات.",
        errorTitle: "خطأ",
        invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صحيح",
        emailRequired: "البريد الإلكتروني مطلوب",
    },
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [language, setLanguage] = useState<Language>('en')
    const [theme, setTheme] = useState<Theme>('dark')
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


    const t = translations[language]

    useEffect(() => {
        // Load saved preferences
        const savedLanguage = localStorage.getItem('language') as Language
        const savedTheme = localStorage.getItem('theme') as Theme

        if (savedLanguage) setLanguage(savedLanguage)
        if (savedTheme) setTheme(savedTheme)
    }, [])

    useEffect(() => {
        // Update document direction and theme
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
        document.documentElement.setAttribute('lang', language)

        if (theme === 'light') {
            document.body.classList.add('light-mode')
        } else {
            document.body.classList.remove('light-mode')
        }
    }, [language, theme])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
    }

    const changeLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
        setShowLanguageMenu(false)
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email) {
            setError(t.emailRequired)
            return
        }

        if (!validateEmail(email)) {
            setError(t.invalidEmail)
            return
        }

        setIsLoading(true)

        try {
            await api.post('/Account/forgetpassword', { email })
            setIsSubmitted(true)
        } catch (err: any) {
            console.error('Forgot password error:', err)
            const msg = err.response?.data?.errorMessage || err.response?.data?.message || 'An error occurred. Please try again.'
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="d-flex min-vh-100 position-relative overflow-hidden">
            <div className="login-glow" aria-hidden="true" />
            <div className="login-glow-secondary" aria-hidden="true" />
            <div className="login-glow-tertiary" aria-hidden="true" />
            {/* Left Panel */}
            <div className="left-panel d-flex flex-column align-items-center justify-content-center position-relative">
                <Link
                    href="/login"
                    className="position-absolute top-0 start-0 m-4 btn btn-link text-white text-decoration-none"
                >
                    <ArrowLeft size={24} className={language === 'ar' ? 'rotate-180' : ''} />
                </Link>

                <div className="d-flex flex-column align-items-center gap-4 position-relative z-index-1">
                    <div className="logo-circle">IW</div>
                    <div className="text-center">
                        <h1 className="display-5 fw-bold text-white mb-3">
                            Welcome to InternWay
                        </h1>
                        <p className="text-white fs-5 text-opacity-80">
                            Your journey to the perfect internship starts here
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Forgot Password Form */}
            <div className="login-panel d-flex flex-column align-items-center justify-content-center p-4 position-relative">
                {/* Language and Theme Toggle */}
                <div className="theme-lang-controls position-absolute top-0 end-0 m-4 d-flex align-items-center gap-3">
                    <div className="position-relative">
                        <button
                            className="btn btn-link text-white text-decoration-none p-2"
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            title="Change Language"
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
                    <button
                        className="btn btn-link text-white text-decoration-none p-2"
                        onClick={toggleTheme}
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>

                <div className="w-100 max-w-28">
                    {!isSubmitted ? (
                        <>
                            {/* Title Section */}
                            <div className="mb-4">
                                <h1 className="h2 fw-bold text-white mb-2">
                                    {t.title}
                                </h1>
                                <p className="small text-body-secondary">
                                    {t.subtitle}
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                    <AlertCircle size={20} className="me-2" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <div className="mb-4">
                                    <label className="form-label text-white small fw-medium d-flex align-items-center gap-2">
                                        <Mail size={16} className="text-secondary" />
                                        <span>{t.emailLabel}</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-control"
                                        placeholder={t.emailPlaceholder}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn login-btn w-100 py-3 text-white fw-semibold border-0 mb-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    ) : null}
                                    {t.sendButton}
                                </button>

                                {/* Back to Login Link */}
                                <div className="text-center">
                                    <Link href="/login" className="text-primary text-decoration-none small">
                                        {t.backToLogin}
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Success Message */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <CheckCircle size={64} className="text-success mb-3" />
                                    <h1 className="h2 fw-bold text-white mb-2">
                                        {t.successTitle}
                                    </h1>
                                    <p className="text-body-secondary">
                                        {t.successMessage}
                                    </p>
                                </div>

                                <Link href="/login" className="btn login-btn w-100 py-3 text-white fw-semibold border-0">
                                    {t.backToLogin}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
