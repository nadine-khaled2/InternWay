'use client'

import { useEffect,  useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faEnvelope, faLock,
    faBuilding, faBriefcase, faMapMarkerAlt, faLocationArrow, faLink, faPhone
} from '@fortawesome/free-solid-svg-icons'
import { Globe, Moon, Sun, Check } from 'lucide-react'
import styles from '../signup.module.css'
import { useApp } from '../../context/AppContext'
import api from '../../lib/api'

export default function CompanySignupPage() {
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
        email: '', password: '', confirmPassword: '',
        companyName: '', industry: '', location: '', address: '', phoneNumber: '', website: '', description: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const changeLanguage = (lang: 'en' | 'ar') => {
        setLanguage(lang)
        setShowLanguageMenu(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (errors[name]) setErrors({ ...errors, [name]: '' })
    }

    const validateForm = () => {
        let newErrors: Record<string, string> = {}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) newErrors.email = t.emailRequired
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email"

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

        if (!formData.companyName.trim()) newErrors.companyName = t.companyNameRequired
        if (!formData.industry.trim()) newErrors.industry = t.industryRequired

        const locationRegex = /^[A-Za-z]+(?: [A-Za-z]+)*\s*,\s*[A-Za-z]+(?: [A-Za-z]+)*$/
        if (!formData.location.trim()) {
            newErrors.location = t.locationRequired
        } else if (!locationRegex.test(formData.location)) {
            newErrors.location = language === 'ar'
                ? "يجب أن يكون التنسيق: المدينة، الدولة (مثال: Cairo, Egypt)"
                : "Must be in format: City, Country (e.g. Cairo, Egypt)"
        }

        const phoneRegex = /^(010|011|012|015)[0-9]{8}$/
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = t.phoneRequired
        } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = language === 'ar'
                ? "يجب أن يكون رقم هاتف مصري صالح من 11 رقماً يبدأ بـ 010/011/012/015"
                : "Must be a valid Egyptian number (11 digits, starts with 010/011/012/015)"
        }

        if (!formData.address.trim()) {
            newErrors.address = language === 'ar' ? "العنوان مطلوب" : "Address is required"
        }

        const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
        if (formData.website.trim() && !urlRegex.test(formData.website.trim())) {
            newErrors.website = t.invalidUrl
        }

        if (!formData.description.trim()) {
            newErrors.description = language === 'ar' ? "الوصف مطلوب" : "Description is required"
        } else if (formData.description.trim().length < 20) {
            newErrors.description = language === 'ar' ? "يجب ألا يقل الوصف عن 20 حرفاً" : "Description must be at least 20 characters"
        } else if (formData.description.trim().length > 500) {
            newErrors.description = language === 'ar' ? "يجب ألا يزيد الوصف عن 500 حرف" : "Description must not exceed 500 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            setLoading(true)
            try {
                const payload = {
                    companyName: formData.companyName,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    industry: formData.industry,
                    location: formData.location,
                    description: formData.description,
                    website: formData.website,
                    address: formData.address,
                    phoneNumber: formData.phoneNumber
                }

                await api.post('/Account/signUp/company', payload)

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
                <h2>{t.createCompanyAccount}</h2>
                <p>{t.companyProfile}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.companyName}</label>
                    <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                    <input
                        type="text" name="companyName" placeholder={t.companyName}
                        title={t.companyName}
                        value={formData.companyName} onChange={handleChange}
                        className={errors.companyName ? styles.inputError : ''}
                    />
                    {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.workEmail}</label>
                    <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                    <input
                        type="email" name="email" placeholder={t.workEmail}
                        title={t.workEmail}
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
                    <label className={styles.required}>{t.industry}</label>
                    <FontAwesomeIcon icon={faBriefcase} className={styles.inputIcon} />
                    <input
                        type="text" name="industry" placeholder={t.industry}
                        title={t.industry}
                        value={formData.industry} onChange={handleChange}
                        className={errors.industry ? styles.inputError : ''}
                    />
                    {errors.industry && <span className={styles.errorText}>{errors.industry}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.location}</label>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
                    <input
                        type="text" name="location" placeholder="e.g. Cairo, Egypt"
                        title={t.location}
                        value={formData.location} onChange={handleChange}
                        className={errors.location ? styles.inputError : ''}
                    />
                    {errors.location && <span className={styles.errorText}>{errors.location}</span>}
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

                <div className={styles.inputGroup}>
                    <label className={styles.required}>{t.address}</label>
                    <FontAwesomeIcon icon={faLocationArrow} className={styles.inputIcon} />
                    <input
                        type="text" name="address" placeholder={t.address}
                        title={t.address}
                        value={formData.address} onChange={handleChange}
                        className={errors.address ? styles.inputError : ''}
                    />
                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>{t.website}</label>
                    <FontAwesomeIcon icon={faLink} className={styles.inputIcon} />
                    <input
                        type="url" name="website" placeholder="https://www.company.com"
                        title={t.website}
                        value={formData.website} onChange={handleChange}
                        className={errors.website ? styles.inputError : ''}
                    />
                    {errors.website && <span className={styles.errorText}>{errors.website}</span>}
                </div>

                <div className={styles.textareaGroup}>
                    <label className={styles.required}>{t.companyDescription}</label>
                    <textarea
                        name="description"
                        placeholder={t.companyPlaceholder}
                        title={t.companyDescription}
                        value={formData.description}
                        onChange={handleChange}
                        className={errors.description ? styles.inputError : ''}
                    ></textarea>
                    {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                    <div className={styles.charCount}>{formData.description.length} chars</div>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.backBtn} onClick={() => router.back()}>
                        {t.back}
                    </button>
                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Creating...' : t.signup}
                    </button>
                </div>

                <div className={styles.signinText}>
                    {t.alreadyHaveAccount} <Link href="/login">{t.login}</Link>
                </div>
            </form>
        </div>
    )
}
