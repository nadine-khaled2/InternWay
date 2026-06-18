'use client'
import React, { useState, useEffect } from 'react'
import { Search, Mail, Phone, Calendar, User, GraduationCap, Clock, X, Loader2, CheckCircle, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import styles from './MenteesPage.module.css'
import api from '../../lib/api'

// ============================================================
//  TYPES
// ============================================================
interface Mentee {
    id: number
    name: string
    university: string
    major: string
    email: string
    phone: string
    nextSession: string
    totalSessions: number
}

interface AvailableSlot {
    id: number
    displayDate: string
    displayTime: string
}

// ============================================================
//  CONFIG
// ============================================================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://your-api.com'

const authHeader = (): Record<string, string> => ({
    'Content-Type': 'application/json',
})

// ============================================================
//  API CALLS
// ============================================================
async function fetchAvailableSlots(): Promise<AvailableSlot[]> {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await api.get('/Mentor/Profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = res.data?.data || res.data
        const slotsList = data?.availableSlots || []
        // Filter out booked slots
        const freeSlots = slotsList.filter((s: any) => !s.isBooked)
        return freeSlots.map((s: any) => ({
            id: s.slotId,
            displayDate: `${s.day}, ${s.date}`,
            displayTime: `${s.startTime} - ${s.endTime}`
        }))
    } catch (err) {
        console.warn('[fetchAvailableSlots] API failed, falling back to mock slots:', err)
        return [
            { id: 1, displayDate: 'Wednesday, Jan 24', displayTime: '2:00 PM – 4:00 PM' },
            { id: 2, displayDate: 'Friday, Jan 26', displayTime: '1:00 PM – 2:00 PM' },
            { id: 3, displayDate: 'Tuesday, Jan 28', displayTime: '9:00 AM – 10:30 AM' },
        ]
    }
}

async function createSession(menteeId: number, slotId: number): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await api.post('/Mentor/MyMentees/scheduleSession', {
        studentId: menteeId,
        slotId: slotId,
        topicId: 1 // Default topicId as required by backend contract
    }, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ============================================================
//  MOCK DATA
// ============================================================
const MOCK_MENTEES: Mentee[] = [
    { id: 1, name: 'Layla Ibrahim', university: 'Cairo University', major: 'Software Engineering', email: 'layla@example.com', phone: '+20 123 456 7890', nextSession: 'Dec 28, 3:00 PM', totalSessions: 5 },
    { id: 2, name: 'Omar Saeed', university: 'Ain Shams University', major: 'Data Science', email: 'omar@example.com', phone: '+20 123 456 7891', nextSession: 'Dec 30, 10:00 AM', totalSessions: 3 },
    { id: 3, name: 'Nour Khalil', university: 'Alexandria University', major: 'UI/UX Design', email: 'nour@example.com', phone: '+20 123 456 7892', nextSession: 'Jan 2, 1:00 PM', totalSessions: 7 },
    { id: 4, name: 'Ahmed Hassan', university: 'Cairo University', major: 'Mobile Development', email: 'ahmed@example.com', phone: '+20 123 456 7893', nextSession: 'Jan 5, 11:00 AM', totalSessions: 2 },
]

// ============================================================
//  SCHEDULE SESSION MODAL
// ============================================================
function ScheduleSessionModal({ mentee, onClose, onSuccess }: {
    mentee: Mentee
    onClose: () => void
    onSuccess: (menteeId: number) => void
}) {
    const [slots, setSlots] = useState<AvailableSlot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
    const [loadingSlots, setLoadingSlots] = useState(true)
    const [confirming, setConfirming] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAvailableSlots()
            .then((data) => { setSlots(data); setLoadingSlots(false) })
            .catch(() => { setError('Failed to load slots.'); setLoadingSlots(false) })
    }, [])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const handleConfirm = async () => {
        if (!selectedSlot) return
        setConfirming(true)
        setError(null)
        try {
            await createSession(mentee.id, selectedSlot.id)
            setDone(true)
            setTimeout(() => { onSuccess(mentee.id); onClose() }, 1200)
        } catch (err: any) {
            console.error('[handleConfirm] createSession failed:', err)
            let errMsg = 'Something went wrong. Please try again.'
            if (err.response?.data) {
                const data = err.response.data
                if (typeof data === 'string') {
                    errMsg = data
                } else if (typeof data === 'object') {
                    errMsg = data.detail || data.message || data.Message || data.errorMessage || data.title || errMsg
                    if (data.errors && typeof data.errors === 'object') {
                        const errorDetails = Object.values(data.errors).flat().join(', ')
                        if (errorDetails) errMsg = errorDetails
                    }
                }
            }
            setError(errMsg)
            setConfirming(false)
        }
    }

    return (
        <div
            className={styles.overlay}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className={styles.rescheduleModal}>
                {/* Header */}
                <div className={styles.rescheduleHeader}>
                    <div>
                        <p className={styles.rescheduleEyebrow}>Scheduling</p>
                        <h2 className={styles.rescheduleTitle}>New Mentorship Session</h2>
                        <p className={styles.rescheduleStudent}>{mentee.name}</p>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn} title="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Mentee Info / Current Slot Bar equivalent */}
                <div className={styles.currentSlotBar}>
                    <div className={styles.currentSlotBox}>
                        <GraduationCap size={13} color="#94a3b8" />
                        <span className={styles.currentSlotLabel}>Mentee Info:</span>
                        <span className={styles.currentSlotValue}>
                            {mentee.university} · {mentee.major}
                        </span>
                    </div>
                    <p className={styles.slotSelectHint}>Select an available slot for this session</p>
                    <hr className={styles.divider} />
                </div>

                {/* Error Banner */}
                {error && !loadingSlots && (
                    <div style={{
                        margin: '0 24px 12px',
                        padding: '12px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                    }}>
                        <X size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Slots List */}
                <div className={styles.slotsScrollArea}>
                    {loadingSlots && (
                        <div className={styles.loadingState}>
                            <Loader2 size={24} className="animate-spin" />
                            <span>Loading available slots...</span>
                        </div>
                    )}
                    {!loadingSlots && slots.length === 0 && !error && (
                        <p className={styles.emptyState}>No available slots at the moment.</p>
                    )}
                    {!loadingSlots && slots.map(slot => {
                        const isSelected = selectedSlot?.id === slot.id
                        return (
                            <div
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`${styles.slotItem} ${isSelected ? styles.slotItemSelected : styles.slotItemDefault}`}
                            >
                                <div className={styles.slotItemLeft}>
                                    <div className={`${styles.slotIconBox} ${isSelected ? styles.slotIconBoxSelected : styles.slotIconBoxDefault}`}>
                                        <Calendar size={16} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                                    </div>
                                    <div>
                                        <p className={styles.slotDate}>{slot.displayDate}</p>
                                        <div className={styles.slotTimeMeta}>
                                            <Clock size={11} color="#94a3b8" />
                                            <span>{slot.displayTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`${styles.slotSelectBadge} ${isSelected ? styles.slotSelectBadgeSelected : styles.slotSelectBadgeDefault}`}>
                                    {isSelected ? 'Selected' : 'Select'}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Selected Slot Summary */}
                {selectedSlot && (
                    <div className={styles.selectedSummary}>
                        <div>
                            <p className={styles.summaryLabel}>Date</p>
                            <p className={styles.summaryValue}>{selectedSlot.displayDate}</p>
                        </div>
                        <div className={styles.summaryDivider} />
                        <div>
                            <p className={styles.summaryLabel}>Time</p>
                            <p className={styles.summaryValue}>{selectedSlot.displayTime}</p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className={styles.rescheduleFooter}>
                    <button onClick={onClose} className={styles.rescheduleCancelBtn}>Cancel</button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedSlot || confirming || done}
                        className={`${styles.rescheduleConfirmBtn} ${done
                                ? styles.confirmBtnDone
                                : (!selectedSlot || confirming)
                                    ? styles.confirmBtnDisabled
                                    : styles.confirmBtnDefault
                            }`}
                    >
                        {done
                            ? <><CheckCircle size={16} /> Session Scheduled!</>
                            : confirming
                                ? <><Loader2 size={16} className="animate-spin" /> Scheduling...</>
                                : 'Confirm Session'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================
//  MAIN PAGE
// ============================================================
export default function MenteesPage() {
    const { language, sidebarOpen, setSidebarOpen } = useApp()
    const [searchQuery, setSearchQuery] = useState('')
    const [mentees, setMentees] = useState<Mentee[]>(MOCK_MENTEES)
    const [scheduleTarget, setScheduleTarget] = useState<Mentee | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchMentees = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const res = await api.get('/Mentor/MyMentees', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = res.data?.data || res.data || []
            const mapped = data.map((item: any) => ({
                id: item.studentId,
                name: item.fullName || '',
                university: item.university || '',
                major: item.major || '',
                email: item.email || '',
                phone: item.phone || '',
                nextSession: item.nextSession || 'None',
                totalSessions: item.totalSessions || 0
            }))
            setMentees(mapped)
        } catch (err: any) {
            console.warn('[fetchMentees] API failed, falling back to MOCK_MENTEES:', err)
            setMentees(MOCK_MENTEES)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMentees()
    }, [])

    if (loading) {
        return <LoadingScreen />
    }

    const handleScheduleSuccess = (menteeId: number) => {
        setMentees(prev =>
            prev.map(m => m.id === menteeId
                ? { ...m, totalSessions: m.totalSessions + 1 }
                : m
            )
        )
    }

    const filtered = mentees.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.title}>
                            {language === 'ar' ? 'طلابي' : 'My Mentees'}
                        </h1>
                        <p className={styles.subtitle}>
                            {language === 'ar' ? 'إدارة علاقاتك مع الطلاب' : 'Manage your mentee relationships'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <TopBarControls />
                    </div>
                </div>

                {/* Search */}
                <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Search mentees..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Cards Grid */}
                <div className={styles.grid}>
                    {filtered.map((mentee) => (
                        <div key={mentee.id} className={styles.card}>
                            {/* Profile Row */}
                            <div className={styles.cardProfileRow}>
                                <div className={styles.cardAvatar}>
                                    <User size={26} />
                                </div>
                                <div>
                                    <h3 className={styles.cardName}>{mentee.name}</h3>
                                    <p className={styles.cardUniversity}>{mentee.university}</p>
                                    <div className={styles.cardMajor}>
                                        <GraduationCap size={15} />
                                        <span>{mentee.major}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className={styles.contactInfo}>
                                <div className={styles.contactRow}>
                                    <Mail size={16} color="#3b82f6" />
                                    <span>{mentee.email}</span>
                                </div>
                                <div className={styles.contactRow}>
                                    <Phone size={16} color="#3b82f6" />
                                    <span>{mentee.phone}</span>
                                </div>
                                <div className={styles.contactRowBold}>
                                    <Calendar size={16} color="#3b82f6" />
                                    <span>Next: {mentee.nextSession}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={styles.cardFooter}>
                                <div>
                                    <p className={styles.sessionsLabel}>Total Sessions</p>
                                    <p className={styles.sessionsCount}>{mentee.totalSessions}</p>
                                </div>
                                <button
                                    onClick={() => setScheduleTarget(mentee)}
                                    className={styles.scheduleBtn}
                                >
                                    Schedule Session
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {scheduleTarget && (
                <ScheduleSessionModal
                    mentee={scheduleTarget}
                    onClose={() => setScheduleTarget(null)}
                    onSuccess={handleScheduleSuccess}
                />
            )}
        </div>
    )
}
