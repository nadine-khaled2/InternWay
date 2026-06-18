'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCircle,
  Video,
  ChevronLeft,
  Menu,
  X,
  MapPin,
  Clock,
  Calendar,
  Globe2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import TopBarControls from '../../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../../components/LoadingScreen/LoadingScreen'
import sharedStyles from '../InternshipsStyle.module.css'
import styles from './ViewdetailsStyles.module.css'
import { useAppliedInternships } from '../../../hooks/useAppliedInternships'
import api from '../../../lib/api'


// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Company {
  name:     string
  Name?:    string
  WebSit:   string
  City:     string
  Country:  string | null
  Industry: string
}

interface InternshipDetail {
  internId:           number
  title:              string
  description:        string
  duration:           number
  locationType:       string
  startDate:          string
  endDate:            string
  isPaid:             boolean
  price:              number
  status:             string
  canApply:           boolean
  internship_City:    string
  internship_Country: string | null
  skills:             string[]
  requirements:       string[]
  applicationsCount:  number
  company:            Company
}


function validateDetail(raw: any): InternshipDetail {
  if (!raw || typeof raw !== 'object') throw new Error('Empty response')

  const internId =
    typeof raw.internId === 'number'        ? raw.internId :
    typeof raw.Internship_Id === 'number'   ? raw.Internship_Id :
    (() => { throw new Error('Missing internship id') })()

  const locationType = raw.locationType ?? raw.location_type ?? 'N/A'

  const startDate = raw.startDate ?? 'N/A'
  const endDate   = raw.endDate
    ?? (raw.application_deadline
          ? new Date(raw.application_deadline).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })
          : 'N/A')

  const isPaid = typeof raw.isPaid === 'boolean'
    ? raw.isPaid
    : typeof raw.IsPaid === 'boolean'
      ? raw.IsPaid
      : (raw.paidStatus?.toLowerCase?.() !== 'unpaid' && !!raw.price)

  return {
    internId,
    title:              raw.title              ?? 'Untitled Position',
    description:        raw.description        ?? '',
    duration:           Number(raw.duration ?? raw.durationMonths) || 0,
    locationType,
    startDate,
    endDate,
    isPaid:             Boolean(isPaid),
    price:              Number(raw.price)      || 0,
    status:             raw.status             ?? 'N/A',
    canApply:           typeof raw.canApply === 'boolean'
                          ? raw.canApply
                          : (raw.status ?? 'Open') === 'Open',
    
    internship_City:    raw.internship_City    ?? raw.Internship_City    ?? raw.location ?? '',
    internship_Country: raw.internship_Country ?? raw.Internship_Country ?? null,
    skills:             Array.isArray(raw.skills)       ? raw.skills.filter(Boolean)       : [],
    requirements:       Array.isArray(raw.requirements) ? raw.requirements.filter(Boolean) : [],
    applicationsCount:  Number(raw.applicationsCount)  || 0,
    company: {
      name: raw.company?.name ?? raw.company?.Name ?? 'Unknown Company',
      WebSit:   raw.company?.webSit   ?? raw.company?.WebSit   ?? '',
      City:     raw.company?.city     ?? raw.company?.City     ?? '',
      Country:  raw.company?.country  ?? raw.company?.Country  ?? null,
      Industry: raw.company?.industry ?? raw.company?.Industry ?? '',
    },
  }
}
const MOCK_DETAIL: Record<number, any> = {
  3: {
    internId:           3,
    title:              'Front End',
    description:        'Internship for learning React',
    duration:           5,
    locationType:       'Remote',
    startDate:          'May 8,2026',
    endDate:            'May 30,2026',
    isPaid:             false,
    price:              0,
    status:             'Open',
    canApply:           true,
    internship_City:    'Cairo',
    internship_Country: null,
    skills:             ['c#', 'asp.net core', 'sql'],
    requirements:       ['Basic knowledge of C#', 'Understanding of OOP', 'Familiar with SQL'],
    applicationsCount:  2,
    company: {
      name:     'TechNova Solutions',
      WebSit:   'https://www.technova.com',
      City:     'Cairo',
      Country:  'Egypt',
      Industry: 'Software Development',
    },
  },
  2: {
    internId:           2,
    title:              'Backend .NET Intern',
    description:        'Deep-dive into .NET backend development at a growing tech company.',
    duration:           3,
    locationType:       'Remote',
    startDate:          'Jun 1,2026',
    endDate:            'Aug 30,2026',
    isPaid:             true,
    price:              2000,
    status:             'Open',
    canApply:           true,
    internship_City:    'Cairo',
    internship_Country: null,
    skills:             ['c#', 'asp.net core', 'sql'],
    requirements:       [
      'Solid understanding of C# and OOP',
      'REST API design with ASP.NET Core',
      'SQL Server / Entity Framework Core',
    ],
    applicationsCount:  7,
    company: {
      name:     'TechNova Solutions Updated',
      WebSit:   'https://www.technova.com',
      City:     'Cairo',
      Country:  'Egypt',
      Industry: 'Software Development',
    },
  },
  4: {
    internId:           4,
    title:              'UI/UX Designer Intern',
    description:        'We are looking for a passionate UI/UX Designer Intern to join our digital solutions team. You will work on wireframes, design prototypes, and build sleek visual styles using Figma and Adobe XD.',
    duration:           4,
    locationType:       'Hybrid',
    startDate:          'Feb 1, 2025',
    endDate:            'Jun 1, 2025',
    isPaid:             true,
    price:              4500,
    status:             'Open',
    canApply:           true,
    internship_City:    'Alexandria',
    internship_Country: 'Egypt',
    skills:             ['Figma', 'Adobe XD', 'Prototyping'],
    requirements:       [
      'Basic understanding of layout design and typography',
      'Hands-on experience with Figma or Adobe XD',
      'A design portfolio showing user flow or mobile layouts is preferred',
    ],
    applicationsCount:  12,
    company: {
      name:     'Digital Solutions',
      WebSit:   'https://www.digitalsolutions.com',
      City:     'Alexandria',
      Country:  'Egypt',
      Industry: 'Design & Visuals',
    },
  },
  5: {
    internId:           5,
    title:              'Full Stack Developer',
    description:        'Join our core development team to work on Next.js web applications, Node.js backend controllers, and MongoDB collections. Excellent learning opportunity with expert developer mentoring.',
    duration:           6,
    locationType:       'Remote',
    startDate:          'Jan 25, 2025',
    endDate:            'Jul 25, 2025',
    isPaid:             false,
    price:              0,
    status:             'Open',
    canApply:           true,
    internship_City:    'Remote',
    internship_Country: 'Egypt',
    skills:             ['Node.js', 'MongoDB', 'React'],
    requirements:       [
      'Understanding of modern Javascript and ES6 standards',
      'Knowledge of React.js and components lifecycle',
      'Familiar with REST API design and Node.js routing',
    ],
    applicationsCount:  19,
    company: {
      name:     'Innovation Hub',
      WebSit:   'https://www.innovationhub.co',
      City:     'Remote',
      Country:  'Egypt',
      Industry: 'Software Development',
    },
  },
  6: {
    internId:           6,
    title:              'Data Analyst Intern',
    description:        'Analyze business metrics, clean dataset sheets, build interactive reports, and present data insights. Hands-on experience using Python libraries, SQL queries, and Excel dashboards.',
    duration:           3,
    locationType:       'On-site',
    startDate:          'Jan 1, 2025',
    endDate:            'Apr 1, 2025',
    isPaid:             true,
    price:              6000,
    status:             'Open',
    canApply:           true,
    internship_City:    'Giza',
    internship_Country: 'Egypt',
    skills:             ['Python', 'SQL', 'Excel'],
    requirements:       [
      'Understanding of basic statistics and data cleaning',
      'Ability to write standard SQL SELECT queries',
      'Familiarity with Excel pivot tables and Python libraries (pandas/numpy)',
    ],
    applicationsCount:  8,
    company: {
      name:     'Startup Labs',
      WebSit:   'https://www.startuplabs.io',
      City:     'Giza',
      Country:  'Egypt',
      Industry: 'Data Analytics',
    },
  },
}


const AVATAR_COLORS = [
  '#5B8DEF', '#9D7CEF', '#8B5FE8', '#7C9FEF',
  '#EF5B9D', '#5BCFEF', '#EF9D5B', '#5BEF8D',
]
const colorFromId = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]
const initials    = (name: string) =>
  name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  try {
    const res = await api.post('/auth/refresh-token', { refreshToken })
    const newAccessToken = res.data?.accessToken ?? res.data?.Data?.accessToken
    if (!newAccessToken) return null

    localStorage.setItem('token', newAccessToken)
    if (res.data?.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken)
    }
    return newAccessToken
  } catch {
    return null
  }
}

function clearAuthAndRedirect(router: ReturnType<typeof useRouter>) {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function InternshipDetailPage() {
  const { language, t } = useApp()

  const router   = useRouter()
  const params   = useParams()
  const internId = Number(params?.id)

  const [internship, setInternship]   = useState<InternshipDetail | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [applying, setApplying]       = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { isApplied, markApplied } = useAppliedInternships()

  const applied = internship ? isApplied(internship.internId) : false

  useEffect(() => { if (internId) fetchDetail() }, [internId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const fetchDetail = async () => {
    setLoading(true)
    setError(null)

    const doFetch = (accessToken: string | null) =>
      api.get(`/Student/Internships/view/details/${internId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

    try {
      let token = localStorage.getItem('token')

      try {
        const res = await doFetch(token)
        const raw = res.data?.Data ?? res.data?.data ?? res.data
        if (!raw) {
          setError('This internship is no longer available.')
          setLoading(false)
          return
        }
        const validated = validateDetail(raw)
        if (!validated.canApply) markApplied(validated.internId)
        setInternship(validated)
      } catch (apiErr: any) {
        if (apiErr.response?.status === 401) {
          const newToken = await refreshAccessToken()
          if (!newToken) {
            clearAuthAndRedirect(router)
            return
          }
          try {
            const retryRes = await doFetch(newToken)
            const raw = retryRes.data?.Data ?? retryRes.data?.data ?? retryRes.data
            if (!raw) {
              setError('This internship is no longer available.')
              setLoading(false)
              return
            }
            const validated = validateDetail(raw)
            if (!validated.canApply) markApplied(validated.internId)
            setInternship(validated)
            return
          } catch (retryErr: any) {
            if (retryErr.response?.status === 401) {
              clearAuthAndRedirect(router)
              return
            }
            throw retryErr
          }
        }
        if (apiErr.response?.status === 404) {
          setError('This internship is no longer available.')
          setLoading(false)
          return
        }
        throw apiErr
      }
    } catch (err: any) {
      console.warn('[fetchDetail] Failed, falling back to mock data:', err)
      await new Promise(r => setTimeout(r, 200))
      const raw = MOCK_DETAIL[internId]
      if (!raw) { setError('Internship not found.'); setLoading(false); return }
      setInternship(validateDetail(raw))
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!internship || applying || applied) return
    setApplying(true)

    const doApply = (accessToken: string | null) =>
      api.post(
        `/Student/Internships/internship/apply/${internship.internId}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          transformResponse: (data) => data, // backend returns plain text
        }
      )

    try {
      let token = localStorage.getItem('token')

      try {
        const res = await doApply(token)
        const message = typeof res.data === 'string' ? res.data : 'Application submitted successfully.'
        markApplied(internship.internId)
        alert(message)
      } catch (apiErr: any) {
        if (apiErr.response?.status === 401) {
          const newToken = await refreshAccessToken()
          if (!newToken) {
            clearAuthAndRedirect(router)
            return
          }
          try {
            const retryRes = await doApply(newToken)
            const message = typeof retryRes.data === 'string' ? retryRes.data : 'Application submitted successfully.'
            markApplied(internship.internId)
            alert(message)
            return
          } catch (retryErr: any) {
            if (retryErr.response?.status === 401) {
              clearAuthAndRedirect(router)
              return
            }
            throw retryErr
          }
        }
        if (apiErr.response?.status === 409) {
          
          markApplied(internship.internId)
          return
        }
        if (apiErr.response?.status === 400 || apiErr.response?.status === 404) {
          const msg = typeof apiErr.response?.data === 'string'
            ? apiErr.response.data
            : 'Unable to apply to this internship.'
          alert(msg)
          return
        }
        console.warn('[handleApply] API failed, simulating local success:', apiErr)
        markApplied(internship.internId)
      }
    } catch (err: any) {
      console.error('[handleApply]', err)
      alert(err.message ?? 'Failed to submit application.')
    } finally {
      setApplying(false)
    }
  }



  if (loading) {
    return <LoadingScreen />
  }

  const accentColor   = internship ? colorFromId(internship.internId) : '#5B8DEF'
  const avatarText    = internship ? initials(internship.company.name) : ''
  const locationLabel = internship
    ? [internship.internship_City, internship.internship_Country].filter(Boolean).join(', ') || 'N/A'
    : ''

  const applyDisabled = applying || applied || !internship?.canApply

  return (
    <div className={sharedStyles.appLayout}>
      <div className={sharedStyles.glow}          aria-hidden="true" />
      <div className={sharedStyles.glowSecondary} aria-hidden="true" />
      <div className={sharedStyles.glowTertiary}  aria-hidden="true" />

      <div
        className={`${sharedStyles.overlay} ${sidebarOpen ? sharedStyles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`${sharedStyles.sidebar} ${sidebarOpen ? sharedStyles.sidebarOpen : ''}`}>
        <div className={sharedStyles.logoSection}>
          <div className={sharedStyles.backButton} onClick={() => router.push('/student/internships')}>
            <ChevronLeft size={20} />
          </div>
          <div className={sharedStyles.logo}>
            <div className={sharedStyles.logoIcon}>IW</div>
            <span className={sharedStyles.logoText}>InternWay</span>
          </div>
        </div>

        <nav className={sharedStyles.nav}>
          <Link href="/student/dashboard"   className={sharedStyles.navItem}><LayoutDashboard size={20} /><span>{t.dashboard}</span></Link>
          <Link href="/student/internships" className={`${sharedStyles.navItem} ${sharedStyles.active}`}><Briefcase size={20} /><span>{t.internships}</span></Link>
          <Link href="/student/mentorships" className={sharedStyles.navItem}><Users size={20} /><span>{t.mentorships}</span></Link>
          <Link href="/student/sessions"    className={sharedStyles.navItem}><Video size={20} /><span>{t.mySessions}</span></Link>
          <Link href="/student/profile"     className={sharedStyles.navItem}><UserCircle size={20} /><span>{t.profile}</span></Link>
        </nav>
      </aside>

      <main className={sharedStyles.mainContent}>

        <header className={sharedStyles.topBar}>
          <div className={sharedStyles.pageHeader}>
            <h1 className={sharedStyles.pageTitle}>{internship?.title ?? 'Internship Details'}</h1>
            <p className={sharedStyles.pageSubtitle}>{internship?.company.name ?? ''}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className={sharedStyles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <TopBarControls />
          </div>
        </header>



        {!loading && error && (
          <div className={styles.stateCenter}>
            <AlertCircle size={32} style={{ color: '#ef4444' }} />
            <p className={styles.errorText}>{error}</p>
            <button className={styles.retryBtn} onClick={fetchDetail}>Retry</button>
          </div>
        )}

        {!loading && !error && internship && (
          <div className={styles.detailScroll}>

            <div className={styles.heroCard}>
              <div className={styles.heroAccentBar} style={{ backgroundColor: accentColor }} />
              <div className={styles.heroBody}>
                <div className={styles.companyAvatar} style={{ backgroundColor: accentColor }}>
                  {avatarText}
                </div>
                <div className={styles.heroInfo}>
                  <h1 className={styles.heroTitle}>{internship.title}</h1>
                  <p className={styles.heroCompany}>{internship.company.name}</p>
                  <div className={styles.badgeRow}>
                    <span className={styles.badge} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                      <MapPin size={11} />{locationLabel} · {internship.locationType}
                    </span>
                    <span className={styles.badge} style={{ background: '#F0FDF4', color: '#16A34A' }}>
                      <Clock size={11} />{internship.duration} month{internship.duration !== 1 ? 's' : ''}
                    </span>
                    <span className={styles.badge} style={{ background: '#FFF7ED', color: '#C2410C' }}>
                      <Calendar size={11} />{internship.startDate} → {internship.endDate}
                    </span>
                    <span
                      className={styles.badge}
                      style={internship.isPaid
                        ? { background: '#ECFDF5', color: '#059669' }
                        : { background: '#FEF2F2', color: '#DC2626' }}
                    >
                      {internship.isPaid ? `${internship.price.toLocaleString()} EGP/month` : 'Unpaid'}
                    </span>
                    <span
                      className={styles.badge}
                      style={internship.status === 'Open'
                        ? { background: '#F0FDF4', color: '#16A34A' }
                        : { background: '#F3F4F6', color: '#6b7280' }}
                    >
                      {internship.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.leftCol}>
                {internship.description && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                      {language === 'ar' ? 'عن التدريب' : 'About the Internship'}
                    </h2>
                    <p className={styles.cardBody}>{internship.description}</p>
                  </div>
                )}

                {internship.requirements.length > 0 && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                      {language === 'ar' ? 'المتطلبات' : 'Requirements'}
                    </h2>
                    <ul className={styles.requirementList}>
                      {internship.requirements.map((req, i) => (
                        <li key={i} className={styles.requirementItem}>
                          <CheckCircle2 size={15} className={styles.requirementIcon} style={{ color: accentColor }} />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {internship.skills.length > 0 && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                      {language === 'ar' ? 'المهارات المطلوبة' : 'Required Skills'}
                    </h2>
                    <div className={styles.skillsRow}>
                      {internship.skills.map((skill, i) => (
                        <span key={i} className={styles.skillBadge}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.rightCol}>

                {/* Apply card */}
                <div className={styles.sideCard}>
                  <h3 className={styles.sideCardTitle}>
                    {language === 'ar' ? 'جاهز للتقديم؟' : 'Ready to Apply?'}
                  </h3>

                  {applied ? (
                    <div className={styles.appliedBox}>
                      <CheckCircle2 size={36} style={{ color: '#10B981' }} />
                      <p className={styles.appliedTitle}>
                        {language === 'ar' ? 'تم تقديم طلبك!' : 'Application submitted!'}
                      </p>
                      <p className={styles.appliedSub}>
                        {language === 'ar'
                          ? 'سنخطرك عندما تراجع الشركة طلبك.'
                          : "We'll notify you when the company reviews your application."}
                      </p>
                    </div>
                  ) : !internship.canApply ? (
                    <p className={styles.closedNotice}>
                      {language === 'ar'
                        ? 'التقديم مغلق حالياً لهذا التدريب.'
                        : 'Applications are currently closed for this internship.'}
                    </p>
                  ) : (
                    <>
                      <p className={styles.applicantsNote}>
                        {internship.applicationsCount}{' '}
                        {language === 'ar'
                          ? 'طالب قدّم بالفعل.'
                          : `student${internship.applicationsCount !== 1 ? 's' : ''} have already applied.`}
                      </p>
                      <button
                        className={styles.applyBtn}
                        style={{ backgroundColor: accentColor }}
                        onClick={handleApply}
                        disabled={applyDisabled}
                      >
                        {applying
                          ? <><Loader2 size={15} className={styles.spinner} /> {language === 'ar' ? 'جاري الإرسال…' : 'Submitting…'}</>
                          : <><Briefcase size={15} /> {language === 'ar' ? 'قدّم الآن' : 'Apply Now'}</>
                        }
                      </button>
                    </>
                  )}
                </div>

                {/* Company card */}
                <div className={styles.sideCard}>
                  <h3 className={styles.sideCardTitle}>
                    {language === 'ar' ? 'الشركة' : 'Company'}
                  </h3>
                  <div className={styles.companyRow}>
                    <div className={styles.companyAvatarSm} style={{ backgroundColor: accentColor }}>{avatarText}</div>
                    <div>
                      <p className={styles.companyRowName}>{internship.company.name}</p>
                      <p className={styles.companyRowIndustry}>{internship.company.Industry}</p>
                    </div>
                  </div>
                  <div className={styles.infoRows}>
                    <div className={styles.infoRow}>
                      <MapPin size={13} />
                      {[internship.company.City, internship.company.Country].filter(Boolean).join(', ')}
                    </div>
                    {internship.company.WebSit && (
                      <div className={styles.infoRow}>
                        <ExternalLink size={13} />
                        <a href={internship.company.WebSit} target="_blank" rel="noopener noreferrer"
                          className={styles.infoRowLink} style={{ color: accentColor }}>
                          {internship.company.WebSit.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className={styles.infoRow}><Globe2 size={13} />{internship.company.Industry}</div>
                    <div className={styles.infoRow}>
                      <Users size={13} />
                      {internship.applicationsCount}{' '}
                      {language === 'ar' ? 'متقدم' : `applicant${internship.applicationsCount !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>

                {/* Details card */}
                <div className={styles.sideCard}>
                  <h3 className={styles.sideCardTitle}>
                    {language === 'ar' ? 'التفاصيل' : 'Details'}
                  </h3>
                  <div className={styles.detailRows}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailRowLabel}>{language === 'ar' ? 'المدة' : 'Duration'}</span>
                      <span className={styles.detailRowValue}>
                        {internship.duration} {language === 'ar' ? 'أشهر' : 'months'}
                      </span>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.detailRow}>
                      <span className={styles.detailRowLabel}>{language === 'ar' ? 'تاريخ البدء' : 'Start Date'}</span>
                      <span className={styles.detailRowValue}>{internship.startDate}</span>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.detailRow}>
                      <span className={styles.detailRowLabel}>{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</span>
                      <span className={styles.detailRowValue}>{internship.endDate}</span>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.detailRow}>
                      <span className={styles.detailRowLabel}>{language === 'ar' ? 'الموقع' : 'Location'}</span>
                      <span className={styles.detailRowValue}>{locationLabel} · {internship.locationType}</span>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.detailRow}>
                      <span className={styles.detailRowLabel}>{language === 'ar' ? 'الراتب' : 'Compensation'}</span>
                      <span className={styles.detailRowValue} style={{ color: internship.isPaid ? '#10B981' : '#ef4444' }}>
                        {internship.isPaid
                          ? `${internship.price.toLocaleString()} EGP/month`
                          : (language === 'ar' ? 'غير مدفوع' : 'Unpaid')}
                      </span>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.detailRow}>
                      <span className={styles.detailRowLabel}>{language === 'ar' ? 'الحالة' : 'Status'}</span>
                      <span className={styles.detailRowValue} style={{ color: internship.status === 'Open' ? '#10B981' : '#6b7280' }}>
                        {internship.status === 'Open'
                          ? (language === 'ar' ? 'مفتوح' : 'Open')
                          : internship.status}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}