
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    BookOpen,
    User,
    Calendar,
    Clock,
    LayoutDashboard,
    Briefcase,
    Users,
    UserCircle,
    Video,
    ChevronLeft,
    Menu,
    X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import styles from './sessions.module.css'
import api, { getErrorMessage } from '../../lib/api'
import { toast } from '../../lib/toast'

interface ApiSession {
    session_id: number
    mentor_id: number
    mentorName: string
    date: string
    start_time: string
    end_time: string
    topic: string
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Expired' | 'Started' | 'InProgress'
    isPaid: boolean
}

interface CancelResponse {
    decision: 'Allow' | 'Block' | 'ConfirmPenalty'
    message: string
    penaltyAmount: number | null
}

interface RescheduleResponse {
    decision: 'Allow' | 'Block'
    message: string
    penaltyAmount: number | null
}

interface TopicOption {
    id: number
    title: string
}

interface AvailabilitySlot {
    slotId: number
    date: string
    startTime: string
    endTime: string
    isBooked: boolean
    isPaid: boolean
    price?: number
}

interface RescheduleState {
    sessionId: number
    mentorId: number
    slotId: number
    topicId: number
}

interface JoinResponse {
    message: string
    link: string
}

interface Session {
    id: number
    mentorId: number
    title: string
    mentor: {
        name: string
        avatar: string
        role: string
    }
    date: string
    time: string
    duration: string
    skills: string[]
    description: string
    isBooked: boolean
    rating: number
    completed: boolean
    status: ApiSession['status']
    isPaid: boolean
}

interface PaymentResponse {
    success: boolean
    url: string | null
    message: string
}

interface PenaltyState {
    sessionId: number
    penaltyAmount: number
    message: string
}

interface ReviewState {
    sessionId: number
    rate: number
    message: string
}

function mapApiSession(s: ApiSession): Session {
    const isBooked = s.status === 'Confirmed' || s.status === 'Started' || s.status === 'InProgress'
    const completed = s.status === 'Completed'

    return {
        id: s.session_id,
        mentorId: s.mentor_id,
        title: s.topic,
        mentor: {
            name: s.mentorName,
            avatar: '👨‍💻',
            role: ''
        },
        date: s.date,
        time: `${s.start_time} - ${s.end_time}`,
        duration: '1 hour',
        skills: [s.topic],
        description: '',
        isBooked,
        rating: 0,
        completed,
        status: s.status,
        isPaid: s.isPaid
    }
}

function getStatusBadgeClass(status: ApiSession['status'], styles: any): string {
    switch (status) {
        case 'Pending':
            return styles.badgePending
        case 'Confirmed':
            return styles.badgeConfirmed
        case 'Started':
        case 'InProgress':
            return styles.badgeInProgress
        case 'Completed':
            return styles.badgeCompleted
        case 'Cancelled':
            return styles.badgeCancelled
        case 'Expired':
            return styles.badgeExpired
        default:
            return styles.badgeDefault
    }
}

function getStatusLabel(status: ApiSession['status'], t: any): string {
    switch (status) {
        case 'Pending':
            return t.waitingForConfirmation
        case 'Confirmed':
            return t.confirmed
        case 'Started':
            return 'Started'
        case 'InProgress':
            return 'In Progress'
        case 'Completed':
            return t.completed
        case 'Cancelled':
            return 'Cancelled'
        case 'Expired':
            return 'Expired'
        default:
            return status
    }
}

const mockSessions: Session[] = [
    {
        id: 1,
        mentorId: 1,
        title: 'Career Path in Software Engineering',
        mentor: { name: 'Dr. Ahmed Hassan', avatar: '👨‍💻', role: 'Senior Software Engineer' },
        date: 'Dec 28, 2024',
        time: '3:00 PM - 4:00 PM',
        duration: '1 hour',
        skills: ['Career Guidance'],
        description: '',
        isBooked: true,
        rating: 4.8,
        completed: false,
        status: 'Confirmed',
        isPaid: false
    },
    {
        id: 2,
        mentorId: 2,
        title: 'Machine Learning Fundamentals',
        mentor: { name: 'Eng. Sara Mohamed', avatar: '👩‍💻', role: 'ML Engineer' },
        date: 'Dec 30, 2024',
        time: '10:00 AM - 11:00 AM',
        duration: '1 hour',
        skills: ['Technical'],
        description: '',
        isBooked: false,
        rating: 4.9,
        completed: false,
        status: 'Pending',
        isPaid: true
    },
    {
        id: 3,
        mentorId: 3,
        title: 'Portfolio Review Session',
        mentor: { name: 'Eng. Nour Khaled', avatar: '👨‍🏫', role: 'Senior Designer' },
        date: 'Jan 2, 2025',
        time: '2:00 PM - 3:00 PM',
        duration: '1 hour',
        skills: ['Design Review'],
        description: '',
        isBooked: true,
        rating: 4.7,
        completed: false,
        status: 'Confirmed',
        isPaid: true
    },
    {
        id: 4,
        mentorId: 4,
        title: 'Deep Learning Research Discussion',
        mentor: { name: 'Prof. Karim Ali', avatar: '👩‍🎨', role: 'AI Researcher' },
        date: 'Dec 25, 2024',
        time: '4:00 PM - 5:00 PM',
        duration: '1 hour',
        skills: ['Research'],
        description: '',
        isBooked: true,
        rating: 5.0,
        completed: true,
        status: 'Completed',
        isPaid: true
    },
    {
        id: 5,
        mentorId: 5,
        title: 'System Design Interview Prep',
        mentor: { name: 'Eng. Omar Youssef', avatar: '👨‍🔬', role: 'Tech Lead' },
        date: 'Dec 29, 2024',
        time: '1:00 PM - 2:00 PM',
        duration: '1 hour',
        skills: ['Career Guidance'],
        description: '',
        isBooked: false,
        rating: 4.6,
        completed: false,
        status: 'Pending',
        isPaid: false
    },
    {
        id: 6,
        mentorId: 6,
        title: 'Mobile App Development Workshop',
        mentor: { name: 'Eng. Laila Ahmed', avatar: '👩‍💼', role: 'Mobile Developer' },
        date: 'Jan 5, 2025',
        time: '3:00 PM - 4:00 PM',
        duration: '1 hour',
        skills: ['Technical'],
        description: '',
        isBooked: false,
        rating: 4.8,
        completed: false,
        status: 'Pending',
        isPaid: false
    }
]

async function refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) return null
        const res = await api.post('/auth/refresh-token', { refreshToken })
        const newToken: string = res.data?.accessToken ?? res.data?.token
        if (newToken) {
            localStorage.setItem('token', newToken)
            return newToken
        }
        return null
    } catch {
        return null
    }
}

export default function SessionsPage() {
    const { t } = useApp()
    const router = useRouter()

    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const [penaltyState, setPenaltyState] = useState<PenaltyState | null>(null)
    const [penaltyLoading, setPenaltyLoading] = useState(false)

    const [reviewState, setReviewState] = useState<ReviewState | null>(null)
    const [reviewLoading, setReviewLoading] = useState(false)
    const [reviewError, setReviewError] = useState<string | null>(null)

    const [rescheduleState, setRescheduleState] = useState<RescheduleState | null>(null)
    const [rescheduleLoading, setRescheduleLoading] = useState(false)
    const [rescheduleError, setRescheduleError] = useState<string | null>(null)

    const [topics, setTopics] = useState<TopicOption[]>([])
    const [topicsLoading, setTopicsLoading] = useState(false)

    const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
    const [slotsLoading, setSlotsLoading] = useState(false)

    const fetchSessions = async (token?: string) => {
        try {
            setLoading(true)
            const tk = token ?? localStorage.getItem('token')
            const res = await api.get('/Student/Sessions/get', {
                headers: { Authorization: `Bearer ${tk}` }
            })

            const raw: ApiSession[] | null = res.data?.data ?? res.data?.Data ?? null

            setSessions(raw ? raw.map(mapApiSession) : [])
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) { fetchSessions(newToken); return }
                router.push('/login')
                return
            }
            console.warn('[fetchSessions] API failed, falling back to mock:', err)
            setSessions(mockSessions)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchSessions() }, [])

    const handleJoin = async (sessionId: number) => {
        const token = localStorage.getItem('token')
        try {
            const res = await api.get<JoinResponse>(
                `/Student/Sessions/meeting/join/${sessionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const { link, message } = res.data

            if (link) {
                window.open(link, '_blank')
            } else {
                toast.info(message)
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) { handleJoin(sessionId); return }
                router.push('/login')
                return
            }
            const msg = getErrorMessage(err, 'Cannot join session right now.')
            toast.error(msg)
        }
    }

    const handleCancel = async (sessionId: number) => {
        const token = localStorage.getItem('token')
        try {
            const res = await api.delete<CancelResponse>(
                `/Student/Sessions/session/cancel/${sessionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const { decision, message, penaltyAmount } = res.data

            if (decision === 'Allow') {
                await fetchSessions()
                toast.success(message)
            } else if (decision === 'ConfirmPenalty') {
                setPenaltyState({
                    sessionId,
                    penaltyAmount: penaltyAmount ?? 0,
                    message: message
                })
            } else {
                toast.warning(message)
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) { handleCancel(sessionId); return }
                router.push('/login')
                return
            }
            const msg = getErrorMessage(err, 'Cancellation failed.')
            toast.error(msg)
        }
    }

    const handlePay = async (sessionId: number) => {
        const token = localStorage.getItem('token')
        try {
            const res = await api.post<PaymentResponse>(
                `/Payment/pay/session/${sessionId}`,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const { success, url, message } = res.data
            if (success && url) {
                window.open(url, '_blank')
            } else {
                toast.warning(message)
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) { handlePay(sessionId); return }
                router.push('/login')
                return
            }
            const msg = getErrorMessage(err, 'Payment failed. Please try again.')
            toast.error(msg)
        }
    }

    const handleConfirmPenalty = async () => {
        if (!penaltyState) return
        setPenaltyLoading(true)
        const token = localStorage.getItem('token')
        try {
            await api.post(
                `/wallets/compensate-mentor/${penaltyState.sessionId}`,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setPenaltyState(null)
            await fetchSessions()
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) { handleConfirmPenalty(); return }
                router.push('/login')
                return
            }
            const msg = getErrorMessage(err, 'Could not apply penalty.')
            toast.error(msg)
        } finally {
            setPenaltyLoading(false)
        }
    }

    const fetchTopics = (token: string | null) => {
        setTopicsLoading(true)
        api.get('/Student/Mentorships/session/topic', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setTopics(res.data?.data ?? res.data?.Data ?? [])
            })
            .catch(err => {
                console.warn('[fetchTopics] failed:', err)
                setTopics([])
            })
            .finally(() => setTopicsLoading(false))
    }

    const fetchMentorAvailability = (mentorId: number, token: string | null) => {
        setSlotsLoading(true)
        api.get(`/Student/Mentorships/mentors/available-slots/${mentorId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const raw: AvailabilitySlot[] = res.data?.data ?? res.data?.Data ?? []
                setAvailableSlots(raw.filter(s => !s.isBooked))
            })
            .catch(err => {
                if (err.response?.status === 404) {
                    setAvailableSlots([])
                } else {
                    console.warn('[fetchMentorAvailability] failed:', err)
                    setAvailableSlots([])
                }
            })
            .finally(() => setSlotsLoading(false))
    }

    const handleReschedule = (sessionId: number, mentorId: number) => {
        setRescheduleState({ sessionId, mentorId, slotId: -1, topicId: -1 })
        setRescheduleError(null)
        setAvailableSlots([])
        setTopics([])
        const token = localStorage.getItem('token')
        fetchTopics(token)
        fetchMentorAvailability(mentorId, token)
    }

    const handleSubmitReschedule = async () => {
        if (!rescheduleState) return

        if (rescheduleState.slotId === -1) {
            setRescheduleError('Please select a time slot.')
            return
        }
        if (rescheduleState.topicId === -1) {
            setRescheduleError('Please select a topic.')
            return
        }

        setRescheduleLoading(true)
        setRescheduleError(null)
        const token = localStorage.getItem('token')

        try {
            const res = await api.put<RescheduleResponse>(
                `/Student/Sessions/session/reschedule/${rescheduleState.sessionId}`,
                { slotId: rescheduleState.slotId, topicId: rescheduleState.topicId },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            const { decision, message } = res.data

            if (decision === 'Allow') {
                setRescheduleState(null)
                await fetchSessions()
                toast.success(message)
            } else {
                setRescheduleError(message)
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) { handleSubmitReschedule(); return }
                router.push('/login')
                return
            }
            const msg = getErrorMessage(err, 'Reschedule failed. Please try again.')
            setRescheduleError(msg)
        } finally {
            setRescheduleLoading(false)
        }
    }

    const handleSubmitReview = async () => {
        if (!reviewState) return
        if (reviewState.rate < 1 || reviewState.rate > 5) {
            setReviewError('Rating must be between 1 and 5.')
            return
        }
        setReviewLoading(true)
        setReviewError(null)
        const token = localStorage.getItem('token')
        try {
            await api.post(
                '/Student/Sessions/session/review',
                {
                    sessionId: reviewState.sessionId,
                    rate: reviewState.rate,
                    message: reviewState.message || null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setReviewState(null)
            toast.success('Review submitted successfully!')
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) { handleSubmitReview(); return }
                router.push('/login')
                return
            }
            const msg = getErrorMessage(err, 'Failed to submit review.')
            setReviewError(msg)
        } finally {
            setReviewLoading(false)
        }
    }

    if (loading) return <LoadingScreen />

    return (
        <div className={styles.appLayout}>
            <div className={styles.glow} aria-hidden="true" />
            <div className={styles.glowSecondary} aria-hidden="true" />
            <div className={styles.glowTertiary} aria-hidden="true" />

            <div
                className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.logoSection}>
                    <div className={styles.backButton} onClick={() => router.push('/student/dashboard')} role="button" title="Back to Dashboard">
                        <ChevronLeft size={20} />
                    </div>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>IW</div>
                        <span className={styles.logoText}>InternWay</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <Link href="/student/dashboard" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
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
                    <Link href="/student/sessions" className={`${styles.navItem} ${styles.active}`} onClick={() => setSidebarOpen(false)}>
                        <Video size={20} />
                        <span>{t.mySessions}</span>
                    </Link>
                    <Link href="/student/profile" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
                        <UserCircle size={20} />
                        <span>{t.profile}</span>
                    </Link>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>{t.pageTitle}</h1>
                        <p className={styles.pageSubtitle}>{t.pageSubtitle}</p>
                    </div>

                    <div className={styles.headerActions}>
                        <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <TopBarControls />
                    </div>
                </header>

                <div className={styles.sessionsGrid}>
                    {sessions.length === 0 ? (
                        <div className={styles.noSessions}>
                            <BookOpen size={48} />
                            <p>{t.noSessions}</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div key={session.id} className={styles.sessionCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}><User size={24} /></div>

                                    <div className={styles.sessionInfo}>
                                        <h2 className={styles.sessionTitle}>{session.title}</h2>
                                        <p className={styles.mentorName}>{t.with} {session.mentor.name}</p>

                                        <div className={styles.sessionMeta}>
                                            <div className={styles.metaItem}>
                                                <Calendar size={14} />
                                                <span>{session.date}</span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Clock size={14} />
                                                <span>{session.time}</span>
                                            </div>
                                            <span className={styles.categoryTag}>{session.skills[0]}</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.statusBadge} ${getStatusBadgeClass(session.status, styles)}`}
                                    >
                                        {getStatusLabel(session.status, t)}
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    {session.completed ? (
                                        <button
                                            className={styles.reviewButton}
                                            onClick={() => setReviewState({
                                                sessionId: session.id,
                                                rate: 5,
                                                message: ''
                                            })}
                                        >
                                            {t.leaveReview || 'Leave Review'}
                                        </button>
                                    ) : session.status === 'Cancelled' || session.status === 'Expired' ? null : (
                                        <>
                                            <button
                                                className={session.isBooked ? styles.primaryButton : styles.waitingButton}
                                                onClick={() => session.isBooked && handleJoin(session.id)}
                                                disabled={!session.isBooked}
                                            >
                                                <BookOpen size={16} />
                                                {session.isBooked ? t.joinMeeting : t.waitingButtonText}
                                            </button>

                                            {session.isPaid && session.status === 'Pending' && (
                                                <>
                                                    <div className={styles.actionDivider} />
                                                    <button
                                                        className={styles.primaryButton}
                                                        onClick={() => handlePay(session.id)}
                                                    >
                                                        Pay Now
                                                    </button>
                                                </>
                                            )}

                                            <div className={styles.actionDivider} />

                                            <button
                                                className={styles.secondaryButton}
                                                onClick={() => handleReschedule(session.id, session.mentorId)}
                                            >
                                                {t.reschedule}
                                            </button>

                                            <div className={styles.actionDivider} />

                                            <button
                                                className={styles.dangerButton}
                                                onClick={() => handleCancel(session.id)}
                                            >
                                                {t.cancel}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* ── Penalty Confirmation Dialog ── */}
            {penaltyState && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setPenaltyState(null)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className={styles.modalTitle}>
                            Late Cancellation Fee
                        </h3>
                        <p className={styles.modalDescription}>
                            {penaltyState.message}
                        </p>
                        <p className={styles.modalPenaltyText}>
                            Penalty: {penaltyState.penaltyAmount} EGP
                        </p>
                        <div className={styles.modalButtonGroup}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => setPenaltyState(null)}
                                disabled={penaltyLoading}
                            >
                                Keep Session
                            </button>
                            <button
                                className={styles.dangerButton}
                                onClick={handleConfirmPenalty}
                                disabled={penaltyLoading}
                            >
                                {penaltyLoading ? 'Processing…' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Review Modal ── */}
            {reviewState && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setReviewState(null)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className={styles.modalTitle}>
                            Leave a Review
                        </h3>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Rating (1–5)
                            </label>
                            <div className={styles.starRatingGroup}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewState(r => r ? { ...r, rate: star } : r)}
                                        className={`${styles.starButton} ${star <= reviewState.rate ? styles.starActive : styles.starInactive}`}
                                        title={`Rate ${star} star`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Comment (optional)
                            </label>
                            <textarea
                                value={reviewState.message}
                                onChange={e => setReviewState(r => r ? { ...r, message: e.target.value } : r)}
                                rows={3}
                                className={styles.formTextarea}
                                placeholder="Share your experience…"
                            />
                        </div>

                        {reviewError && (
                            <p className={styles.errorMessage}>
                                {reviewError}
                            </p>
                        )}

                        <div className={styles.modalButtonGroup}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => { setReviewState(null); setReviewError(null) }}
                                disabled={reviewLoading}
                            >
                                {t.cancel}
                            </button>
                            <button
                                className={styles.primaryButton}
                                onClick={handleSubmitReview}
                                disabled={reviewLoading}
                            >
                                {reviewLoading ? 'Submitting…' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reschedule Modal ── */}
            {rescheduleState && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => { setRescheduleState(null); setRescheduleError(null) }}
                >
                    <div
                        className={styles.modalContent}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className={styles.modalTitle}>
                            Reschedule Session
                        </h3>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Available Time Slot
                            </label>
                            {slotsLoading ? (
                                <p className={styles.loadingText}>
                                    Loading available slots…
                                </p>
                            ) : (
                                <select
                                    value={rescheduleState.slotId}
                                    onChange={e => setRescheduleState(r => r ? { ...r, slotId: Number(e.target.value) } : r)}
                                    className={styles.formSelect}
                                    title="Available Time Slot"
                                >
                                    <option value={-1}>Select a slot…</option>
                                    {availableSlots.map(slot => (
                                        <option key={slot.slotId} value={slot.slotId}>
                                            {slot.date} • {slot.startTime} - {slot.endTime}
                                            {slot.isPaid && slot.price ? ` (${slot.price} EGP)` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {!slotsLoading && availableSlots.length === 0 && (
                                <p className={styles.warningMessage}>
                                    No available slots for this mentor right now.
                                </p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Topic
                            </label>
                            {topicsLoading ? (
                                <p className={styles.loadingText}>
                                    Loading topics…
                                </p>
                            ) : (
                                <select
                                    value={rescheduleState.topicId}
                                    onChange={e => setRescheduleState(r => r ? { ...r, topicId: Number(e.target.value) } : r)}
                                    className={styles.formSelect}
                                    title="Topic"
                                >
                                    <option value={-1}>Select a topic…</option>
                                    {topics.map(topic => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {rescheduleError && (
                            <p className={styles.errorMessage}>
                                {rescheduleError}
                            </p>
                        )}

                        <div className={styles.modalButtonGroup}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => { setRescheduleState(null); setRescheduleError(null) }}
                                disabled={rescheduleLoading}
                            >
                                {t.cancel}
                            </button>
                            <button
                                className={styles.primaryButton}
                                onClick={handleSubmitReschedule}
                                disabled={rescheduleLoading}
                            >
                                {rescheduleLoading ? 'Processing…' : 'Confirm Reschedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}