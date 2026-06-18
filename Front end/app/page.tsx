'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Globe, Moon, Sun, Check } from 'lucide-react'
import styles from './landing.module.css'
import { useApp } from './context/AppContext'

export default function LandingPage() {
  const { theme, toggleTheme, language, setLanguage, t } = useApp()
  const [activeSection, setActiveSection] = useState('home')
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

  const handleGetStarted = () => {
    router.push('/selectRole')
  }

  const handleLogin = () => {
    router.push('/login')
  }

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    const targetSection = document.getElementById(sectionId)
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'how-it-works']
      const scrollPosition = window.pageYOffset + 100

      for (const id of sections) {
        const section = document.getElementById(id)
        if (section) {
          const sectionTop = section.offsetTop
          const sectionHeight = section.offsetHeight

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const FeatureIcon = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <div className={`${styles.featureIcon} ${styles[className]}`}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {children}
      </svg>
    </div>
  )

  return (
    <>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.glowSecondary} aria-hidden="true" />
      <div className={styles.glowTertiary} aria-hidden="true" />
      <nav className={styles.nav} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>IW</div>
          <span>{t.appName}</span>
        </div>
        <ul className={styles.navLinks}>
          <li>
            <a
              href="#home"
              className={activeSection === 'home' ? styles.active : ''}
              onClick={(e) => handleNavClick(e, 'home')}
            >
              {t.home}
            </a>
          </li>
          <li>
            <a
              href="#features"
              className={activeSection === 'features' ? styles.active : ''}
              onClick={(e) => handleNavClick(e, 'features')}
            >
              {t.features}
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              className={activeSection === 'how-it-works' ? styles.active : ''}
              onClick={(e) => handleNavClick(e, 'how-it-works')}
            >
              {t.howItWorks}
            </a>
          </li>
        </ul>
        <div className={styles.navActions}>
          <div className="position-relative">
            <button
              className={styles.iconBtn}
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
          <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={styles.loginBtn} onClick={handleLogin}>{t.login}</button>
          <button className={styles.signupBtn} onClick={handleGetStarted}>{t.signup}</button>
        </div>
      </nav>

      <section className={styles.hero} id="home" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className={styles.floating}>{t.heroTitle}</h1>
        <p>{t.heroSubtitle}</p>
        <div className={styles.ctaButtons}>
          <button className={styles.btnPrimary} onClick={handleGetStarted}>
            {t.getStarted}
            <span className={language === 'ar' ? 'rotate-180 d-inline-block' : 'd-inline-block'}>→</span>
          </button>
          <button className={styles.btnSecondary} onClick={(e) => handleNavClick(e, 'features')}>
            {t.learnMore}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={styles.featuresHeader}>
          <h2>{t.features}</h2>
          <p>Discover what makes InternWay the perfect platform for your internship journey</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FeatureIcon className="blue">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </FeatureIcon>
            <h3>Smart Matching with AI</h3>
            <p>Our AI algorithm matches you with the best opportunities</p>
          </div>

          <div className={styles.featureCard}>
            <FeatureIcon className="purple">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 11h6M9 15h6" />
            </FeatureIcon>
            <h3>CV Analysis</h3>
            <p>Get instant feedback on your CV to improve your chances</p>
          </div>

          <div className={styles.featureCard}>
            <FeatureIcon className="orange">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </FeatureIcon>
            <h3>Mentorship Booking</h3>
            <p>Book sessions with experienced mentors in your field</p>
          </div>

          <div className={styles.featureCard}>
            <FeatureIcon className="green">
              <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
              <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
              <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
            </FeatureIcon>
            <h3>Quality Opportunities</h3>
            <p>Access curated internships from top companies</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks} id="how-it-works" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={styles.howHeader}>
          <h2>{t.howItWorks}</h2>
          <p>Get started in three simple steps</p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h3>Create Your Profile</h3>
            <p>Sign up and complete your profile with your skills and interests</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h3>Get Matched</h3>
            <p>Our AI finds the best opportunities tailored for you</p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h3>Start Your Journey</h3>
            <p>Connect with mentors and apply to internships</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statistics} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>5000+</div>
            <div className={styles.statLabel}>Active Students</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>500+</div>
            <div className={styles.statLabel}>Partner Companies</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>200+</div>
            <div className={styles.statLabel}>Expert Mentors</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>95%</div>
            <div className={styles.statLabel}>Success Rate</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={styles.ctaContent}>
          <h2>{t.readyToStart}</h2>
          <p>{t.joinThousands}</p>
          <button className={`${styles.btnPrimary} ${styles.large}`} onClick={handleGetStarted}>
            {t.getStartedNow}
            <span className={language === 'ar' ? 'rotate-180 d-inline-block' : 'd-inline-block'}>→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <div className={styles.footerLogoIcon}>IW</div>
            <span>{t.appName}</span>
          </div>
          <div className={styles.footerCopyright}>
            © 2024 InternWay. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
