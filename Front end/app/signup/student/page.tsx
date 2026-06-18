'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faUser, faEnvelope, faLock,
    faUniversity, faGraduationCap, faBook, faCalendarDays, faCloudArrowUp, faPhone
} from '@fortawesome/free-solid-svg-icons'
import { Globe, Moon, Sun, Check } from 'lucide-react'
import styles from '../signup.module.css'
import { useApp } from '../../context/AppContext'
import api from '../../lib/api'

export default function StudentSignupPage() {
    const { theme, toggleTheme, language, setLanguage, t } = useApp()
    const router = useRouter()
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

    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', confirmPassword: '',
        university: '', college: '', degree: '', major: '', gradYear: '', phoneNumber: '', cvFile: null as File | null
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const changeLanguage = (lang: 'en' | 'ar') => {
        setLanguage(lang)
        setShowLanguageMenu(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target
        if (name === 'cvFile' && files) {
            setFormData({ ...formData, cvFile: files[0] })
            if (errors.cvFile) setErrors({ ...errors, cvFile: '' })
        } else {
            setFormData({ ...formData, [name]: value })
            if (errors[name]) setErrors({ ...errors, [name]: '' })
        }
    }

    const validateForm = () => {
        let newErrors: Record<string, string> = {}

        const nameRegex = /^[A-Za-z\s]+$/
        if (!formData.fullName.trim()) {
            newErrors.fullName = t.fullNameRequired
        } else if (!nameRegex.test(formData.fullName)) {
            newErrors.fullName = language === 'ar'
                ? "يجب أن يحتوي الاسم على أحرف إنجليزية ومسافات فقط"
                : "Full name must contain only English letters and spaces"
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) newErrors.email = t.emailRequired
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email"

        const phoneRegex = /^(010|011|012|015)[0-9]{8}$/
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = t.phoneRequired
        } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = language === 'ar'
                ? "يجب أن يكون رقم هاتف مصري صالح من 11 رقماً يبدأ بـ 010/011/012/015"
                : "Must be a valid Egyptian number (11 digits, starts with 010/011/012/015)"
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        if (!formData.password) {
            newErrors.password = t.passwordRequired
        } else if (formData.password.length < 8) {
            newErrors.password = t.passwordTooShort
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = language === 'ar'
                ? "يجب أن تحتوي كلمة المرور على حرف كبير، حرف صغير، رقم، ورمز خاص (@$!%*?&)"
                : "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)"
        }

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch"
        if (!formData.confirmPassword.trim()) newErrors.confirmPassword = t.passwordRequired

        if (!formData.university.trim()) newErrors.university = t.universityRequired
        if (!formData.college.trim()) newErrors.college = t.collegeRequired
        if (!formData.major.trim()) newErrors.major = t.majorRequired

        if (!formData.gradYear.trim()) {
            newErrors.gradYear = language === 'ar' ? "سنة التخرج مطلوبة" : "Graduation year is required"
        }

        if (formData.cvFile && formData.cvFile.size > 5 * 1024 * 1024) newErrors.cvFile = "Max 5MB"
        if (!formData.cvFile) newErrors.cvFile = t.cvRequired

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            setLoading(true)
            try {
                const queryParams = new URLSearchParams({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    university: formData.university,
                    college: formData.college,
                    degree: formData.degree,
                    major: formData.major,
                    gradYear: formData.gradYear,
                    phone: formData.phoneNumber
                }).toString()

                const payload = new FormData()
                if (formData.cvFile) {
                    payload.append('cvFile', formData.cvFile)
                }

                await api.post(`/Account/signUp/student?${queryParams}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })

                alert("Account Created Successfully!")
                router.push('/login')
            } catch (error: any) {
                console.error("Registration Error:", error)
                let msg = 'Registration failed. Please try again.'
                if (error.response?.data) {
                    if (error.response.data.message) {
                        msg = error.response.data.message
                    } else if (error.response.data.errorMessage) {
                        msg = error.response.data.errorMessage
                    } else if (error.response.data.errors) {
                        const errorsObj = error.response.data.errors
                        const messages = Object.keys(errorsObj).map(key => `${key}: ${errorsObj[key].join(', ')}`)
                        if (messages.length > 0) {
                            msg = messages.join('\n')
                        }
                    }
                }
                alert(msg)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className={styles.formContainer} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.glow} aria-hidden="true" />
            <div className={styles.glowSecondary} aria-hidden="true" />
            <div className={styles.glowTertiary} aria-hidden="true" />
            <button type="button" className={styles.backArrow} onClick={() => router.back()} title={language === 'ar' ? 'العودة' : 'Back'}>
                <FontAwesomeIcon icon={faArrowLeft} className={language === 'ar' ? styles.rotate180 : ''} />
            </button>

            <div className={styles.themeToggle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="position-relative">
                    <button
                        type="button"
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className={styles.iconToggleBtn}
                        title={language === 'ar' ? 'تغيير اللغة' : 'Change Language'}
                    >
                        <Globe size={18} />
                    </button>
                    <div className={`language-menu ${showLanguageMenu ? 'show' : ''}`} style={{ top: '100%', right: language === 'ar' ? 'auto' : 0, left: language === 'ar' ? 0 : 'auto', marginTop: '5px' }}>
                        <div
                            className={`language-option ${language === 'en' ? 'active' : ''}`}
                            onClick={() => changeLanguage('en')}
                        >
                            {language === 'en' && <Check size={16} className="me-2" style={{ display: 'inline' }} />}
                            {language !== 'en' && <span className="me-2" style={{ width: '16px', display: 'inline-block' }}></span>}
                            English
                        </div>
                        <div
                            className={`language-option ${language === 'ar' ? 'active' : ''}`}
                            onClick={() => changeLanguage('ar')}
                        >
                            {language === 'ar' && <Check size={16} className="me-2" style={{ display: 'inline' }} />}
                            {language !== 'ar' && <span className="me-2" style={{ width: '16px', display: 'inline-block' }}></span>}
                            العربية
                        </div>
                    </div>
                </div>
                <button
                    onClick={toggleTheme}
                    type="button"
                    className={styles.iconToggleBtn}
                    title={language === 'ar' ? 'تبديل المظهر' : 'Toggle Theme'}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <div className={styles.signupCard}>
                <h2>{t.createAccount}</h2>
                <p>{t.startJourney}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.fullName}</label>
                    <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                    <input
                        type="text" name="fullName" placeholder={t.fullName}
                        title={t.fullName}
                        value={formData.fullName} onChange={handleChange}
                        className={errors.fullName ? styles.inputError : ''}
                    />
                    {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.emailLabel}</label>
                    <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                    <input
                        type="email" name="email" placeholder={t.emailLabel}
                        title={t.emailLabel}
                        value={formData.email} onChange={handleChange}
                        className={errors.email ? styles.inputError : ''}
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.passwordLabel}</label>
                    <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                    <input
                        type="password" name="password" placeholder="••••••••"
                        title={t.passwordLabel}
                        value={formData.password} onChange={handleChange}
                        className={errors.password ? styles.inputError : ''}
                    />
                    {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.confirmPassword}</label>
                    <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                    <input
                        type="password" name="confirmPassword" placeholder="••••••••"
                        title={t.confirmPassword}
                        value={formData.confirmPassword} onChange={handleChange}
                        className={errors.confirmPassword ? styles.inputError : ''}
                    />
                    {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.university}</label>
                    <FontAwesomeIcon icon={faUniversity} className={styles.inputIcon} />
                    <input
                        type="text" name="university" placeholder={t.university}
                        title={t.university}
                        value={formData.university} onChange={handleChange}
                        className={errors.university ? styles.inputError : ''}
                    />
                    {errors.university && <span className={styles.errorText}>{errors.university}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.college}</label>
                    <FontAwesomeIcon icon={faGraduationCap} className={styles.inputIcon} />
                    <input
                        type="text" name="college" placeholder={t.college}
                        title={t.college}
                        value={formData.college} onChange={handleChange}
                        className={errors.college ? styles.inputError : ''}
                    />
                    {errors.college && <span className={styles.errorText}>{errors.college}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label>{t.degree}</label>
                    <FontAwesomeIcon icon={faGraduationCap} className={styles.inputIcon} />
                    <input
                        type="text" name="degree" placeholder={t.degree}
                        title={t.degree}
                        value={formData.degree} onChange={handleChange}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.major}</label>
                    <FontAwesomeIcon icon={faBook} className={styles.inputIcon} />
                    <input
                        type="text" name="major" placeholder={t.major}
                        title={t.major}
                        value={formData.major} onChange={handleChange}
                        className={errors.major ? styles.inputError : ''}
                    />
                    {errors.major && <span className={styles.errorText}>{errors.major}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.gradYear}</label>
                    <FontAwesomeIcon icon={faCalendarDays} className={styles.inputIcon} />
                    <input
                        type="text" name="gradYear" placeholder={t.gradYear}
                        title={t.gradYear}
                        value={formData.gradYear} onChange={handleChange}
                        className={errors.gradYear ? styles.inputError : ''}
                    />
                    {errors.gradYear && <span className={styles.errorText}>{errors.gradYear}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.phoneNumberLabel}</label>
                    <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
                    <input
                        type="tel" name="phoneNumber" placeholder="01012345678"
                        title={t.phoneNumberLabel}
                        value={formData.phoneNumber} onChange={handleChange}
                        className={errors.phoneNumber ? styles.inputError : ''}
                    />
                    <span className={styles.helpText}>{t.phoneHelpText}</span>
                    {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
                </div>

                <div className={styles.fileUpload}>
                    <label className={styles.required}>{t.uploadCv}</label>

                    <div className={styles.uploadArea} onClick={() => document.getElementById('cv-upload')?.click()}>
                        <FontAwesomeIcon icon={faCloudArrowUp} />
                        <p>{t.clickToUpload}</p>
                        <span>{t.maxSize}</span>
                        {formData.cvFile && <p style={{ color: '#2563eb', marginTop: '10px' }}>Selected: {formData.cvFile.name}</p>}

                        <input
                            id="cv-upload"
                            type="file" name="cvFile" accept=".pdf,.doc,.docx"
                            onChange={handleChange}
                            style={{ display: 'none' }}
                            title={t.uploadCv}
                        />
                    </div>
                    {errors.cvFile && <span className={styles.errorText} style={{ display: 'block', marginTop: '5px' }}>{errors.cvFile}</span>}
                </div>


                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.backBtn} onClick={() => router.back()}>
                        {t.back}
                    </button>
                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Creating...' : t.createAccount}
                    </button>
                </div>

                <div className={styles.signinText}>
                    {t.alreadyHaveAccount} <Link href="/login">{t.login}</Link>
                </div>
            </form>
        </div>
    )
}
