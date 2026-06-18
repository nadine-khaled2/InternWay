'use client'

import { useEffect,  useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Lock,
  Globe,
  Moon,
  Sun,
  GraduationCap,
  Users,
  Building2,
  Check
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

// Define the Role type locally if not shared, or assume string
type Role = 'student' | 'mentor' | 'company' | null

export default function LoginPage() {
  const { theme, toggleTheme, language, setLanguage, t } = useApp()
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail')
      const rememberedRole = localStorage.getItem('rememberedRole') as Role
      const rememberMeFlag = localStorage.getItem('rememberMe') === 'true'
      if (rememberMeFlag && rememberedEmail) {
        setEmail(rememberedEmail)
        if (rememberedRole) {
          setSelectedRole(rememberedRole)
        }
        setRememberMe(true)
      }
    }
  }, [])

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
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      alert(language === 'ar' ? 'يرجى اختيار الدور أولاً' : 'Please select a role first')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/Account/login', {
        email,
        password,
        userType: selectedRole
      })

      const { token, refreshToken, user } = response.data

      // Store auth data based on rememberMe checkbox
      if (rememberMe) {
        localStorage.setItem('token', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
        }
        localStorage.setItem('rememberedEmail', email)
        if (selectedRole) {
          localStorage.setItem('rememberedRole', selectedRole)
        }
        localStorage.setItem('rememberMe', 'true')
      } else {
        sessionStorage.setItem('token', token)
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken)
        }
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user))
        }
        
        // Remove remembered flags
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedRole')
        localStorage.removeItem('rememberMe')
        
        // Clean up stale localStorage credentials
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }

      // Redirect based on selected role
      if (selectedRole === 'student') {
        router.push('/student/dashboard')
      } else if (selectedRole === 'mentor') {
        router.push('/mentor/dashboard')
      } else if (selectedRole === 'company') {
        router.push('/company/dashboard')
      } else {
        router.push('/')
      }

    } catch (error: any) {
      console.error('Login error:', error)
      let message = (language === 'ar' ? 'حدث خطأ في تسجيل الدخول' : 'Login failed')
      if (error.response?.data) {
        if (error.response.data.message) {
          message = error.response.data.message
        } else if (error.response.data.errorMessage) {
          message = error.response.data.errorMessage
        } else if (error.response.data.errors) {
          const errorsObj = error.response.data.errors
          const messages = Object.keys(errorsObj).map(key => `${key}: ${errorsObj[key].join(', ')}`)
          if (messages.length > 0) {
            message = messages.join('\n')
          }
        } else {
          const keys = Object.keys(error.response.data)
          const messages: string[] = []
          keys.forEach((key) => {
            const fieldErrors = error.response.data[key]
            if (Array.isArray(fieldErrors)) {
              messages.push(`${key}: ${fieldErrors.join(', ')}`)
            }
          })
          if (messages.length > 0) {
            message = messages.join('\n')
          }
        }
      }
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  /* ... rest of code ... */


  const changeLanguage = (lang: 'en' | 'ar') => {
    setLanguage(lang)
    setShowLanguageMenu(false)
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'student': return <GraduationCap size={28} color="white" />
      case 'mentor': return <Users size={28} color="white" />
      case 'company': return <Building2 size={28} color="white" />
      default: return null
    }
  }

  return (
    <div className="d-flex min-vh-100 position-relative overflow-hidden">
      <div className="login-glow" aria-hidden="true" />
      <div className="login-glow-secondary" aria-hidden="true" />
      <div className="login-glow-tertiary" aria-hidden="true" />
      {/* Left Panel (40%) */}
      <div className="left-panel d-flex flex-column align-items-center justify-content-center position-relative">
        {/* Back Arrow */}
        <Link
          href="/"
          className="position-absolute top-0 start-0 m-4 btn btn-link text-white text-decoration-none"
          title="Go back"
        >
          <ArrowLeft size={24} className={language === 'ar' ? 'rotate-180' : ''} />
        </Link>

        {/* Logo and Welcome Message */}
        <div className="d-flex flex-column align-items-center gap-4 position-relative z-index-1">
          <div className="logo-circle">IW</div>
          <div className="text-center">
            <h1 className="display-5 fw-bold text-white mb-3">
              {t.welcomeTitle}
            </h1>
            <p className="welcome-subtitle fs-5">
              {t.welcomeSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form (60%) */}
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

        {/* Login Form Container */}
        <div className="w-100 max-w-28">
          {/* Title Section */}
          <div className="mb-4">
            <h1 className="h2 fw-bold text-white mb-2">
              {t.loginTitle}
            </h1>
            <p className="small text-body-secondary">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-4">
            <h2 className="text-white fw-medium small mb-3">
              {t.roleTitle}
            </h2>
            <div className="row g-3">
              {(['student', 'mentor', 'company'] as const).map((role) => (
                <div className="col-4" key={role}>
                  <button
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`role-btn w-100 border-0 ${selectedRole === role ? 'selected' : ''}`}
                  >
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className={`role-icon-circle ${selectedRole === role ? role : 'unselected'}`}>
                        {getRoleIcon(role)}
                      </div>
                      <span className={`small fw-medium ${selectedRole === role ? 'role-text-selected' : 'text-secondary'}`}>
                        {t[role]}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
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
                required
                className="form-control"
                placeholder={t.emailPlaceholder}
              />
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label className="form-label text-white small fw-medium d-flex align-items-center gap-2">
                <Lock size={16} className="text-secondary" />
                <span>{t.passwordLabel}</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
                placeholder={t.passwordPlaceholder}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="form-check-input"
                />
                <label className="form-check-label text-secondary small" htmlFor="rememberMe">
                  {t.rememberMe}
                </label>
              </div>
              <Link href="/forgotPassword" className="text-primary text-decoration-none small">
                {t.forgotPassword}
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn login-btn w-100 py-3 text-white fw-semibold"
            >
              {t.loginButton}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center text-secondary small mt-4">
            <span>{t.noAccount}</span>
            <Link href="/selectRole" className="text-primary text-decoration-none ms-1">
              {t.signup}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
