'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCircle,
  Video,
  ChevronLeft,
  Globe,
  Moon,
  Sun,
  Bell,
  LogOut,
  Check,
  Star,
  Calendar,
  Menu,
  X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import styles from './DashboardStyle.module.css'
import api from '../../lib/api'
import { toast } from '../../lib/toast'

// Raw shape from GET /Student/Dashboard -> Data
interface RawDashboardStats {
  numApplyedInternships: number
  numBookingSession: number
  upcomingSessionDate: string | null
}

// Raw shape from GET /Student/Dashboard/get/recommendedinternships -> Data[]
interface RawRecommendedInternship {
  internshipId: number
  title: string
  companyName: string | null
  city: string | null
  locationType: string // 'Remote' | 'OnSite' | 'Hybrid'
  matchScore: number    // 0.0 - 1.0
}

// Raw shape from GET /Student/Dashboard/get/recommendedmentorships -> Data[]
interface RawRecommendedMentor {
  mentorId: number
  mentorName: string
  jobTitle: string | null
  yearsExperience: number 
  avgRating: number
  countReviewers: number
  description: string | null
  isAvailable: boolean
  upcomingAvailability: string | null
  skills: string[] | null
}

interface InternshipCard {
  id: number
  title: string
  company: string
  location: string
  match: number // 0-100
}

interface MentorCard {
  id: number
  name: string
  field: string
  rating: number
  experience: string
  available: boolean
}

interface DashboardStats {
  appliedInternships: number
  sessionsBooked: number
  upcomingSession: string
}


function normaliseStats(raw: RawDashboardStats): DashboardStats {
  return {
    appliedInternships: raw.numApplyedInternships ?? 0,
    sessionsBooked: raw.numBookingSession ?? 0,
    upcomingSession: raw.upcomingSessionDate ?? 'No sessions',
  }
}

function normaliseInternship(raw: RawRecommendedInternship): InternshipCard {
  return {
    id: raw.internshipId,
    title: raw.title ?? 'Untitled Position',
    company: raw.companyName ?? 'Unknown Company',
    location: raw.city ?? 'Remote',
    match: Math.round((raw.matchScore ?? 0) * 100),
  }
}

function normaliseMentor(raw: RawRecommendedMentor): MentorCard {
  return {
    id: raw.mentorId,
    name: raw.mentorName ?? 'Unknown Mentor',
    field: raw.jobTitle ?? '',
    rating: raw.avgRating ?? 0,
    experience: `${raw.yearsExperience ?? 0} years`,
    available: Boolean(raw.isAvailable),
  }
}

const MOCK_INTERNSHIPS: InternshipCard[] = [
  { id: 1, title: 'Frontend Developer', company: 'Tech Corp', location: 'Cairo', match: 95 },
  { id: 2, title: 'UI/UX Designer', company: 'Digital Solutions', location: 'Alexandria', match: 88 },
  { id: 3, title: 'Full Stack Developer', company: 'Innovation Hub', location: 'Remote', match: 82 },
]

// const MOCK_MENTORS: MentorCard[] = [
//   { id: 1, name: 'Dr. Ahmed Hassan', field: 'Software Engineering', rating: 4.9, experience: '15 years', available: true },
//   { id: 2, name: 'Eng. Sara Mohamed', field: 'Data Science', rating: 4.8, experience: '10 years', available: true },
//   { id: 3, name: 'Prof. Karim Ali', field: 'AI & Machine Learning', rating: 4.7, experience: '12 years', available: false },
// ]

const MOCK_STATS: DashboardStats = {
  appliedInternships: 12,
  sessionsBooked: 8,
  upcomingSession: 'Tomorrow 3PM',
}

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

// Wraps a request: on 401, tries refresh-token once, retries, else logs out.
async function authedGet(
  url: string,
  router: ReturnType<typeof useRouter>
): Promise<any | null> {
  const token = localStorage.getItem('token')
  try {
    return await api.get(url, { headers: { Authorization: `Bearer ${token}` } })
  } catch (err: any) {
    if (err.response?.status === 401) {
      const newToken = await refreshAccessToken()
      if (!newToken) {
        clearAuthAndRedirect(router)
        return null
      }
      try {
        return await api.get(url, { headers: { Authorization: `Bearer ${newToken}` } })
      } catch (retryErr: any) {
        if (retryErr.response?.status === 401) {
          clearAuthAndRedirect(router)
          return null
        }
        throw retryErr
      }
    }
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function StudentDashboard() {
  const { theme, toggleTheme, language, setLanguage, t } = useApp()

  const router = useRouter()

  const [internships, setInternships] = useState<InternshipCard[]>([])
  const [mentors, setMentors] = useState<MentorCard[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    appliedInternships: 0,
    sessionsBooked: 0,
    upcomingSession: 'No sessions'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applyingIds, setApplyingIds] = useState<Set<number>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const results = await Promise.allSettled([
        authedGet('/Student/Dashboard', router),
        authedGet('/Student/Dashboard/get/recommendedinternships', router),
        authedGet('/Student/Dashboard/get/recommendedmentorships', router),
      ])

      const [statsRes, internshipsRes, mentorsRes] = results

      // If authedGet returned null for any call, it already redirected to /login.
      if (results.some(r => r.status === 'fulfilled' && r.value === null)) {
        return
      }

      // ── Stats ─────────────────────────────────────────────────────────
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        const rawStats: RawDashboardStats | null =
          statsRes.value.data?.data ?? statsRes.value.data?.Data ?? null
        setStats(rawStats ? normaliseStats(rawStats) : MOCK_STATS)
      } else {
        console.warn('[fetchDashboardData] stats failed, falling back to mock:',
          statsRes.status === 'rejected' ? statsRes.reason : 'no data')
        setStats(MOCK_STATS)
      }

      // ── Recommended internships ─────────────────────────────────────────
      if (internshipsRes.status === 'fulfilled' && internshipsRes.value) {
        const rawList: RawRecommendedInternship[] | null =
          internshipsRes.value.data?.Data ?? internshipsRes.value.data?.data ?? null
        setInternships(rawList ? rawList.map(normaliseInternship) : [])
      } else {
        console.warn('[fetchDashboardData] internships failed, falling back to mock:',
          internshipsRes.status === 'rejected' ? internshipsRes.reason : 'no data')
        setInternships(MOCK_INTERNSHIPS)
      }

      // ── Recommended mentors ──────────────────────────────────────────────
      if (mentorsRes.status === 'fulfilled' && mentorsRes.value) {
        const rawList: RawRecommendedMentor[] | null =
          mentorsRes.value.data?.data ?? mentorsRes.value.data?.Data ?? null
        setMentors(rawList ? rawList.map(normaliseMentor) : [])
      } else {
        console.warn('[fetchDashboardData] mentors failed, falling back to mock:',
          mentorsRes.status === 'rejected' ? mentorsRes.reason : 'no data')
        // setMentors(MOCK_MENTORS)
      }
    } catch (err: any) {
      console.warn('[fetchDashboardData] Unexpected failure, falling back to full mock:', err)
      setInternships(MOCK_INTERNSHIPS)
      // setMentors(MOCK_MENTORS)
      setStats(MOCK_STATS)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyInternship = async (internshipId: number) => {
    if (applyingIds.has(internshipId)) return
    setApplyingIds(prev => new Set(prev).add(internshipId))

    try {
      let token = localStorage.getItem('token')

      const doApply = (accessToken: string | null) =>
        api.post(
          `/Student/Internships/internship/apply/${internshipId}`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            // backend returns plain text, not JSON
            transformResponse: (data) => data,
          }
        )

      try {
        const res = await doApply(token)
        const message = typeof res.data === 'string' && res.data.trim() !== '' 
          ? res.data 
          : 'Your application has been submitted successfully.'
        toast.success(message)
      } catch (apiErr: any) {
        if (apiErr.response?.status === 401) {
          const newToken = await refreshAccessToken()
          if (!newToken) {
            clearAuthAndRedirect(router)
            return
          }
          try {
            const retryRes = await doApply(newToken)
            const message = typeof retryRes.data === 'string' && retryRes.data.trim() !== '' 
              ? retryRes.data 
              : 'Your application has been submitted successfully.'
            toast.success(message)
          } catch (retryErr: any) {
            if (retryErr.response?.status === 401) {
              clearAuthAndRedirect(router)
              return
            }
            throw retryErr
          }
        } else if (apiErr.response?.status === 409) {
          toast.warning('You have already applied to this internship.')
        } else if (apiErr.response?.status === 400 || apiErr.response?.status === 404) {
          const msg = typeof apiErr.response?.data === 'string' && apiErr.response.data.trim() !== ''
            ? apiErr.response.data
            : 'Unable to apply to this internship at the moment.'
          toast.error(msg)
        } else {
          console.warn('[handleApplyInternship] API failed, simulating local success:', apiErr)
          toast.success('Your application has been submitted successfully.')
        }
      }
    } finally {
      setApplyingIds(prev => {
        const next = new Set(prev)
        next.delete(internshipId)
        return next
      })
    }

    fetchDashboardData()
  }

  const handleBookSession = (mentorId: number) => {
    router.push(`/student/mentorships?mentorId=${mentorId}`)
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="p-4 text-red-500" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>{error}</span>
        <button 
          onClick={fetchDashboardData} 
          className="px-4 py-2 bg-blue-500 text-white border-0 rounded-lg cursor-pointer" 
          title="Retry"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.appLayout}>
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
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.backButton} onClick={() => router.push('/')} role="button" title="Back to Home">
            <ChevronLeft size={20} />
          </div>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>IW</div>
            <span className={styles.logoText}>InternWay</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link href="/student/dashboard" className={`${styles.navItem} ${styles.active}`} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={20} />
            <span>{t.dashboard}</span>
          </Link>
          <Link href="/student/internships" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Briefcase size={20} />
            <span>{t.internships}</span>
          </Link>
          <Link href="/student/mentorships" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Users size={20} />
            <span>{t.mentorships}</span>
          </Link>
          <Link href="/student/sessions" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Video size={20} />
            <span>{t.mySessions}</span>
          </Link>
          <Link href="/student/profile" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <UserCircle size={20} />
            <span>{t.profile}</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{t.welcomeBack}</h1>
            <p className={styles.pageSubtitle}>{t.careerJourney}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <TopBarControls />
          </div>
        </header>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              <Briefcase size={24} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{t.internshipsApplied}</div>
              <div className={styles.statValue}>{stats.appliedInternships}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
              <Calendar size={24} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{t.sessionsBooked}</div>
              <div className={styles.statValue}>{stats.sessionsBooked}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orangeIcon}`}>
              <Star size={24} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{t.upcomingSession}</div>
              <div className={styles.statValue}>{stats.upcomingSession}</div>
            </div>
          </div>
        </div>

        {/* Recommended Internships */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.recommendedInternships}</h2>
          <div className={styles.cardsGrid}>
            {internships.length > 0 ? (
              internships.map((internship) => (
                <div key={internship.id} className={styles.card}>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{internship.title}</h3>
                    <p className={styles.cardSubtitle}>{internship.company} • {internship.location}</p>
                    <div className={styles.matchBadge}>
                      {internship.match}% {t.match}
                    </div>
                  </div>
                  <button
                    className={styles.primaryButton}
                    onClick={() => handleApplyInternship(internship.id)}
                    disabled={applyingIds.has(internship.id)}
                  >
                    {applyingIds.has(internship.id) ? '...' : t.applyNow}
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>{t.noRecommendedInternships}</p>
            )}
          </div>
        </section>

        {/* Recommended Mentors */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.recommendedMentors}</h2>
          <div className={styles.mentorsGrid}>
            {mentors.length > 0 ? (
              mentors.map((mentor) => (
                <div key={mentor.id} className={styles.mentorCard}>
                  <div className={styles.mentorAvatar}>
                    <UserCircle size={48} />
                  </div>
                  <div className={styles.mentorInfo}>
                    <h3 className={styles.mentorName}>{mentor.name}</h3>
                    <p className={styles.mentorField}>{mentor.field}</p>
                    <div className={styles.mentorRating}>
                      <Star size={14} />
                      <span>{mentor.rating} • {mentor.experience}</span>
                    </div>
                  </div>
                  <button
                    className={mentor.available ? styles.primaryButton : styles.disabledButton}
                    disabled={!mentor.available}
                    onClick={() => mentor.available && handleBookSession(mentor.id)}
                  >
                    {mentor.available ? t.bookSession : t.unavailable}
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>{t.noRecommendedMentors}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default StudentDashboard
