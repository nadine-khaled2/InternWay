'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Globe, Moon, Sun, Check, Mail } from 'lucide-react'
import api from '../lib/api'

type Language = 'en' | 'ar'
type Theme = 'dark' | 'light'

const translations = {
    en: {
        title: "Reset Your Password",
        subtitle: "Enter your email and new password to reset your account.",
        emailLabel: "Email Address *",
        emailPlaceholder: "Enter your email",
        tokenLabel: "Reset Token *",
        tokenPlaceholder: "Paste your reset token here",
        newPasswordLabel: "New Password *",
        newPasswordPlaceholder: "Enter new password",
        confirmPasswordLabel: "Confirm Password *",
        confirmPasswordPlaceholder: "Confirm new password",
        resetButton: "Reset Password",
        backToLogin: "Back to Login",
        successTitle: "Password Reset Successful",
        successMessage: "Your password has been reset successfully. You can now login with your new password.",
        errorTitle: "Error",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email address",
        tokenRequired: "Reset token is required",
        passwordRequired: "Password is required",
        passwordTooShort: "Password must be at least 8 characters",
        passwordMismatch: "Passwords do not match",
        invalidToken: "Invalid or expired reset link",
    },
    ar: {
        title: "إعادة تعيين كلمة المرور",
        subtitle: "أدخل بريدك الإلكتروني وكلمة المرور الجديدة لإعادة تعيين حسابك.",
        emailLabel: "البريد الإلكتروني *",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        tokenLabel: "رمز إعادة التعيين *",
        tokenPlaceholder: "الصق رمز إعادة التعيين هنا",
        newPasswordLabel: "كلمة المرور الجديدة *",
        newPasswordPlaceholder: "أدخل كلمة المرور الجديدة",
        confirmPasswordLabel: "تأكيد كلمة المرور *",
        confirmPasswordPlaceholder: "أكد كلمة المرور الجديدة",
        resetButton: "إعادة تعيين كلمة المرور",
        backToLogin: "العودة لتسجيل الدخول",
        successTitle: "تم إعادة تعيين كلمة المرور بنجاح",
        successMessage: "تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
        errorTitle: "خطأ",
        emailRequired: "البريد الإلكتروني مطلوب",
        emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
        tokenRequired: "رمز إعادة التعيين مطلوب",
        passwordRequired: "كلمة المرور مطلوبة",
        passwordTooShort: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
        passwordMismatch: "كلمات المرور غير متطابقة",
        invalidToken: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية",
    },
}

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [token, setToken] = useState('')
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    useEffect(() => {
        // Extract token and email from URL parameters
        const tokenParam = searchParams.get('token')
        const emailParam = searchParams.get('email')

        if (tokenParam) setToken(tokenParam)
        if (emailParam) setEmail(emailParam)
    }, [searchParams])

    const validateForm = () => {
        if (!email.trim()) return t.emailRequired
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) return t.emailInvalid
        if (!token.trim()) return t.tokenRequired
        if (!newPassword) return t.passwordRequired
        if (newPassword.length < 8) return t.passwordTooShort
        if (newPassword !== confirmPassword) return t.passwordMismatch
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setIsLoading(true)

        try {
            // Re-encode the token so the backend's UrlDecode produces the correct value.
            // The browser already URL-decoded the token from the link; the backend calls
            // UrlDecode again, so we encode it once more to compensate.
            const encodedToken = encodeURIComponent(token.trim())

            await api.post('/Account/resetpassword', {
                token: encodedToken,
                email: email.trim(),
                newPassword,
            })
            setIsSubmitted(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            console.error('Reset password error:', err)
            let msg = t.invalidToken
            if (err.response?.data) {
                const data = err.response.data
                if (typeof data === 'string') {
                    msg = data
                } else if (data.errorMessage || data.ErrorMessage) {
                    msg = data.errorMessage || data.ErrorMessage
                } else if (data.message || data.Message) {
                    msg = data.message || data.Message
                } else if (data.Errors && Array.isArray(data.Errors)) {
                    // Backend sends { Errors: [{ ErrorDescription: "..." }] }
                    msg = data.Errors
                        .map((e: any) => e.ErrorDescription || e.errorDescription || String(e))
                        .filter(Boolean)
                        .join('. ')
                } else if (data.errors) {
                    if (Array.isArray(data.errors)) {
                        msg = data.errors
                            .map((e: any) => e.ErrorDescription || e.errorDescription || String(e))
                            .filter(Boolean)
                            .join('. ')
                    } else if (typeof data.errors === 'object') {
                        // ASP.NET Core ModelState validation errors
                        msg = (Object.values(data.errors) as string[][])
                            .flat()
                            .join('. ')
                    }
                }
            }
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

            {/* Right Panel - Reset Password Form */}
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
                                <p className="text-secondary small">
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
                                <div className="mb-3">
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
                                        autoComplete="email"
                                    />
                                </div>


                                {/* New Password Field */}
                                <div className="mb-3">
                                    <label className="form-label text-white small fw-medium d-flex align-items-center gap-2">
                                        <Lock size={16} className="text-secondary" />
                                        <span>{t.newPasswordLabel}</span>
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="form-control"
                                            placeholder={t.newPasswordPlaceholder}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary z-index-10"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="mb-4">
                                    <label className="form-label text-white small fw-medium d-flex align-items-center gap-2">
                                        <Lock size={16} className="text-secondary" />
                                        <span>{t.confirmPasswordLabel}</span>
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="form-control"
                                            placeholder={t.confirmPasswordPlaceholder}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary z-index-10"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
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
                                    {t.resetButton}
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
                                    <p className="text-secondary mb-3">
                                        {t.successMessage}
                                    </p>
                                    <p className="text-secondary small">
                                        Redirecting to login...
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-vh-100 d-flex justify-content-center align-items-center text-white">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
