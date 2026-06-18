'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
    Calendar, Clock, Video, Check, X,
    Loader2, CheckCircle, RefreshCw,
    ChevronRight, ChevronDown, ExternalLink, BookOpen, Menu
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import styles from './SessionsPage.module.css'
import api, { getErrorMessage } from '../../lib/api'

// ============================================================
//  TYPES
// ============================================================
type SessionStatus = 'Pending' | 'Confirmed' | 'Declined' | 'Completed' | 'Cancelled' | 'Expired' | 'Started' | 'InProgress'

interface Session {
    id: number
    title: string
    student: string
    studentUniversity?: string
    studentMajor?: string
    studentProfileId?: number
    status: SessionStatus
    date: string
    duration: string
    meetingLink?: string
    notes?: string
    currentDate: string
    currentTime: string
    canStart?: boolean
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
async function updateSessionStatus(id: number, status: string): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (status === 'Confirmed') {
        const res = await api.put(`/Mentor/MySessions/confirmsession/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return res.data
    } else {
        const res = await api.delete(`/Mentor/MySessions/cancelSession/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return res.data
    }
}

async function rescheduleSession(sessionId: number, slotId: number): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    console.log(`[rescheduleSession] Sending PUT request with sessionId: ${sessionId}, slotId: ${slotId}`)
    const res = await api.put(`/Mentor/MySessions/rescheduleSession/${sessionId}/${slotId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    })
    console.log('[rescheduleSession] Success Response:', res.status, res.data)
}

// ============================================================
//  MOCK DATA
// ============================================================
const MOCK_SESSIONS: Session[] = [
    {
        id: 1, title: 'Portfolio Review', student: 'Ahmed Mohamed',
        studentUniversity: 'Cairo University', studentMajor: 'Software Engineering',
        studentProfileId: 1, status: 'Confirmed',
        date: 'Jan 17, 2:00 PM', duration: '1 hour',
        meetingLink: 'https://zoom.us/j/example',
        notes: 'I need help reviewing my portfolio before applying to jobs.',
        currentDate: 'Jan 17', currentTime: '2:00 PM – 3:00 PM',
        canStart: true
    },
    {
        id: 2, title: 'Resume Review', student: 'Sara Ali',
        studentUniversity: 'Ain Shams University', studentMajor: 'Computer Science',
        studentProfileId: 2, status: 'Pending',
        date: 'Tomorrow, 10:00 AM', duration: '45 min',
        notes: 'Please help me improve my resume for software engineering roles.',
        currentDate: 'Tomorrow', currentTime: '10:00 AM – 10:45 AM',
        canStart: true
    },
    {
        id: 3, title: 'Technical Discussion', student: 'Layla Ibrahim',
        studentUniversity: 'Alexandria University', studentMajor: 'UI/UX Design',
        studentProfileId: 3, status: 'Completed',
        date: 'Jan 15, 2024', duration: '1 hour',
        currentDate: 'Jan 15', currentTime: '1:00 PM – 2:00 PM',
        canStart: true
    },
    {
        id: 4, title: 'Mock Cancelled Session', student: 'Omar Hassan',
        studentUniversity: 'Cairo University', studentMajor: 'Engineering',
        status: 'Cancelled', date: 'Jan 10, 2024', duration: '1 hour',
        notes: 'Session cancelled by user.',
        currentDate: 'Jan 10', currentTime: '2:00 PM – 3:00 PM',
        canStart: true
    },
    {
        id: 5, title: 'Mock Expired Session', student: 'Mariam Ali',
        studentUniversity: 'GUC', studentMajor: 'Management',
        status: 'Expired', date: 'Jan 05, 2024', duration: '30 min',
        notes: 'Session expired request.',
        currentDate: 'Jan 05', currentTime: '10:00 AM – 10:30 AM',
        canStart: true
    },
]

// ============================================================
//  STATUS BADGE
// ============================================================
function StatusBadge({ status }: { status: SessionStatus }) {
    const cls: Record<SessionStatus, string> = {
        Confirmed: styles.badgeConfirmed,
        Pending: styles.badgePending,
        Declined: styles.badgeDeclined,
        Completed: styles.badgeCompleted,
        Cancelled: styles.badgeCancelled,
        Expired: styles.badgeExpired,
        Started: styles.badgeConfirmed,
        InProgress: styles.badgeConfirmed,
    }
    return <span className={`${styles.badge} ${cls[status] || styles.badgePending}`}>{status}</span>
}

// ============================================================
//  VIEW DETAILS MODAL
// ============================================================
function ViewDetailsModal({ session, onClose }: {
    session: Session
    onClose: () => void
}) {
    const { theme, language } = useApp()
    const [details, setDetails] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Student profile toggle and data states
    const [isProfileVisible, setIsProfileVisible] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)



    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token')
                const res = await api.get(`/Mentor/MySessions/viewdetails/${session.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setDetails(res.data?.data || res.data)
            } catch (err) {
                console.warn('Failed to fetch session details, using mock details from parent:', err)
                setDetails({
                    topic: session.title || 'Mentorship Session',
                    notes: 'Please prepare your resume and questions before the session.',
                    platformLink: 'https://zoom.us/j/1234567890',
                    student: {
                        name: session.student,
                        university: session.studentUniversity || 'Cairo University',
                        major: session.studentMajor || 'Computer Science'
                    }
                })
            } finally {
                setLoading(false)
            }
        }
        fetchDetails()
    }, [session.id])

    const handleToggleProfile = async () => {
        if (isProfileVisible) {
            setIsProfileVisible(false)
            return
        }

        setIsProfileVisible(true)

        if (!profileData && session.studentProfileId) {
            try {
                setLoadingProfile(true)
                setProfileError(null)
                const token = localStorage.getItem('token')
                const res = await api.get(`/Mentor/MySessions/viewprofile/${session.studentProfileId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const responseData = res.data?.Data || res.data?.data || res.data
                console.log('[ViewProfile] Fetched student profile:', responseData)
                setProfileData(responseData)
            } catch (err: any) {
                console.error('Failed to fetch student profile:', err)
                setProfileError(getErrorMessage(err, 'Failed to load student profile.'))
            } finally {
                setLoadingProfile(false)
            }
        }
    }

    const isConfirmed = session.status === 'Confirmed'
    const studentName = details?.student?.name || session.student
    const university = details?.student?.university || session.studentUniversity || ''
    const major = details?.student?.major || session.studentMajor || ''
    const topic = details?.topic || session.title
    const notes = details?.notes || session.notes
    const meetingLink = details?.platformLink || session.meetingLink

    // Normalize profile data safely supporting both camelCase and PascalCase
    const normalizedProfile = profileData ? {
        name: profileData.fullName || profileData.FullName || profileData.name || profileData.Name || '',
        email: profileData.email || profileData.Email || '',
        phone: profileData.phone || profileData.Phone || profileData.phoneNumber || profileData.PhoneNumber || '',
        location: profileData.location || profileData.Location || '',
        university: profileData.university || profileData.University || '',
        college: profileData.college || profileData.College || '',
        major: profileData.major || profileData.Major || '',
        gradYear: profileData.gradYear || profileData.GradYear || profileData.graduationYear || profileData.GraduationYear || '',
        skills: Array.isArray(profileData.skills) ? profileData.skills : (Array.isArray(profileData.Skills) ? profileData.Skills : [])
    } : null

    return (
        <div
            className={styles.overlay}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className={styles.detailsModal}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Session Details</h2>
                    <button onClick={onClose} className={styles.closeBtn} title="Close">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loadingState} style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Loader2 size={24} className="animate-spin" />
                        <span>Loading session details...</span>
                    </div>
                ) : error ? (
                    <div className={styles.errorState} style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
                ) : (
                    <div className={styles.modalBody}>
                        {/* Student Info Card */}
                        <div className={styles.studentInfoCard}>
                            <div className={styles.studentInfoLeft}>
                                <div className={styles.studentAvatar}>{studentName.charAt(0)}</div>
                                <div>
                                    <p className={styles.studentName}>{studentName}</p>
                                    {university && (
                                        <p className={styles.studentUniversity}>{university}</p>
                                    )}
                                    {major && (
                                        <p className={styles.studentMajor}>{major}</p>
                                    )}
                                </div>
                            </div>
                            {session.studentProfileId && (
                                <button onClick={handleToggleProfile} className={styles.viewProfileBtn}>
                                    {isProfileVisible ? 'Hide Profile' : 'View Profile'}
                                    {isProfileVisible ? <ChevronDown size={13} style={{ marginLeft: 2 }} /> : <ChevronRight size={13} style={{ marginLeft: 2 }} />}
                                </button>
                            )}
                        </div>


                        {/* Collapsible Student Profile Details */}
                        <div
                            style={isProfileVisible ? {
                                maxHeight: '1000px',
                                marginBottom: '16px',
                                transition: 'max-height 0.35s ease, margin-bottom 0.35s ease',
                                overflow: 'visible'
                            } : {
                                maxHeight: '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.35s ease, margin-bottom 0.35s ease'
                            }}
                        >
                            <div style={{
                                background: theme === 'light' ? '#f8fafc' : '#252b3d',
                                border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #3b4f7c',
                                borderRadius: '16px',
                                padding: '16px'
                            }}>
                                {loadingProfile ? (
                                    <div className={styles.profileLoadingState}>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Loading student profile...</span>
                                    </div>
                                ) : profileError ? (
                                    <div className={styles.profileErrorState}>{profileError}</div>
                                ) : normalizedProfile ? (
                                    <div className={styles.profileDetailsContent}>
                                        <p className={styles.infoSectionLabel}>Student Profile</p>
                                        <div className={styles.profileGrid}>
                                            {normalizedProfile.email && (
                                                <div className={styles.profileCell}>
                                                    <p className={styles.infoCellLabel}>Email</p>
                                                    <p className={styles.infoCellValue}>{normalizedProfile.email}</p>
                                                </div>
                                            )}
                                            {normalizedProfile.phone && (
                                                <div className={styles.profileCell}>
                                                    <p className={styles.infoCellLabel}>Phone</p>
                                                    <p className={styles.infoCellValue}>{normalizedProfile.phone}</p>
                                                </div>
                                            )}
                                            {normalizedProfile.location && (
                                                <div className={styles.profileCell}>
                                                    <p className={styles.infoCellLabel}>Location</p>
                                                    <p className={styles.infoCellValue}>{normalizedProfile.location}</p>
                                                </div>
                                            )}
                                            {normalizedProfile.college && (
                                                <div className={styles.profileCell}>
                                                    <p className={styles.infoCellLabel}>College</p>
                                                    <p className={styles.infoCellValue}>{normalizedProfile.college}</p>
                                                </div>
                                            )}
                                            {normalizedProfile.gradYear && (
                                                <div className={styles.profileCell}>
                                                    <p className={styles.infoCellLabel}>Graduation Year</p>
                                                    <p className={styles.infoCellValue}>{normalizedProfile.gradYear}</p>
                                                </div>
                                            )}
                                        </div>
                                        {normalizedProfile.skills && normalizedProfile.skills.length > 0 && (
                                            <div className={styles.skillsSection}>
                                                <p className={styles.infoCellLabel} style={{ marginBottom: '8px' }}>Skills</p>
                                                <div className={styles.skillsContainer}>
                                                    {normalizedProfile.skills.map((skill: string) => (
                                                        <span key={skill} className={styles.skillBadge}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Session Info Grid */}
                        <div>
                            <p className={styles.infoSectionLabel}>Session Info</p>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoCell}>
                                    <p className={styles.infoCellLabel}>Title</p>
                                    <p className={styles.infoCellValue}>{topic}</p>
                                </div>
                                <div className={styles.infoCell}>
                                    <p className={styles.infoCellLabel}>Status</p>
                                    <StatusBadge status={session.status} />
                                </div>
                                <div className={styles.infoCell}>
                                    <p className={styles.infoCellLabel}>Date & Time</p>
                                    <div className={styles.infoCellMeta}>
                                        <Calendar size={12} color="#3b82f6" />
                                        <span>{session.date}</span>
                                    </div>
                                </div>
                                <div className={styles.infoCell}>
                                    <p className={styles.infoCellLabel}>Duration</p>
                                    <div className={styles.infoCellMeta}>
                                        <Clock size={12} color="#3b82f6" />
                                        <span>{session.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {notes && (
                            <div>
                                <p className={styles.infoSectionLabel}>Notes from Student</p>
                                <div className={styles.notesBox}>
                                    <BookOpen size={14} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <p className={styles.notesText}>&quot;{notes}&quot;</p>
                                </div>
                            </div>
                        )}

                        {/* Meeting Link */}
                        {isConfirmed && meetingLink && (
                            <div>
                                <p className={styles.infoSectionLabel}>Session Link</p>
                                <Link
                                    href={meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.meetingLink}
                                >
                                    <div className={styles.meetingLinkIcon}>
                                        <Video size={16} color="white" />
                                    </div>
                                    <div className={styles.meetingLinkBody}>
                                        <p className={styles.meetingLinkTitle}>Join Meeting</p>
                                        <p className={styles.meetingLinkUrl}>{meetingLink}</p>
                                    </div>
                                    <ExternalLink size={14} className={styles.meetingLinkArrow} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className={styles.detailsModalFooter}>
                    <button onClick={onClose} className={styles.closeFullBtn}>Close</button>
                </div>
            </div>
        </div>
    )
}

// ============================================================
//  RESCHEDULE MODAL
// ============================================================
function RescheduleModal({ session, onClose, onSuccess }: {
    session: Session
    onClose: () => void
    onSuccess: (sessionId: number, slotId: number, newSlot: AvailableSlot) => void
}) {
    const [slots, setSlots] = useState<AvailableSlot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
    const [loadingSlots, setLoadingSlots] = useState(true)
    const [confirming, setConfirming] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRescheduleSlots = async () => {
            try {
                setLoadingSlots(true)
                const token = localStorage.getItem('token')
                const res = await api.get(`/Mentor/MySessions/rescheduleSession?t=${Date.now()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = res.data?.data || res.data || []
                const mapped = data.map((s: any) => ({
                    id: s.slotId,
                    displayDate: `${s.day}, ${s.date}`,
                    displayTime: `${s.startTime} - ${s.endTime}`
                }))
                setSlots(mapped)
            } catch (err) {
                console.warn('Failed to fetch reschedule slots, using mock slots:', err)
                setSlots([
                    { id: 101, displayDate: 'Monday, Jan 29', displayTime: '10:00 AM - 11:30 AM' },
                    { id: 102, displayDate: 'Wednesday, Jan 31', displayTime: '2:00 PM - 4:00 PM' },
                    { id: 103, displayDate: 'Friday, Feb 2', displayTime: '1:00 PM - 2:00 PM' }
                ])
            } finally {
                setLoadingSlots(false)
            }
        }
        fetchRescheduleSlots()
    }, [session.id])

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
            await rescheduleSession(session.id, selectedSlot.id)
            setDone(true)
            setTimeout(() => { onSuccess(session.id, selectedSlot.id, selectedSlot); onClose() }, 1200)
        } catch (err: any) {
            console.error('[handleConfirm] rescheduleSession failed:', err)
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
                        <p className={styles.rescheduleEyebrow}>Rescheduling</p>
                        <h2 className={styles.rescheduleTitle}>{session.title}</h2>
                        <p className={styles.rescheduleStudent}>{session.student}</p>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn} title="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Current Slot */}
                <div className={styles.currentSlotBar}>
                    <div className={styles.currentSlotBox}>
                        <Calendar size={13} color="#94a3b8" />
                        <span className={styles.currentSlotLabel}>Current:</span>
                        <span className={styles.currentSlotValue}>
                            {session.currentDate} · {session.currentTime}
                        </span>
                    </div>
                    <p className={styles.slotSelectHint}>Select a new available slot for this session</p>
                    <hr className={styles.divider} />
                </div>

                {/* Error Banner */}
                {error && (
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
                    {!loadingSlots && slots.length === 0 && (
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
                            <p className={styles.summaryLabel}>New Date</p>
                            <p className={styles.summaryValue}>{selectedSlot.displayDate}</p>
                        </div>
                        <div className={styles.summaryDivider} />
                        <div>
                            <p className={styles.summaryLabel}>New Time</p>
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
                            ? <><CheckCircle size={16} /> Rescheduled!</>
                            : confirming
                                ? <><Loader2 size={16} className="animate-spin" /> Confirming...</>
                                : 'Confirm Reschedule'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================
//  SESSION CARD
// ============================================================
function SessionCard({ session, onViewDetails, onReschedule, onUpdate }: {
    session: Session
    onViewDetails: () => void
    onReschedule: () => void
    onUpdate: (id: number, status: string) => Promise<void>
}) {
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const isConfirmed = session.status === 'Confirmed'
    const isPending = session.status === 'Pending'

    const handleAction = async (status: string) => {
        setLoadingAction(status)
        await onUpdate(session.id, status)
        setLoadingAction(null)
    }

    const handleStartMeeting = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await api.get(`/Mentor/MySessions/joinMeeting/${session.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const link = res.data?.link || res.data
            if (link) {
                window.open(link, '_blank', 'noopener,noreferrer')
            } else {
                alert('No meeting link available.')
            }
        } catch (err: any) {
            console.error('Failed to join meeting:', err)
            alert(getErrorMessage(err, 'Failed to get meeting link.'))
        }
    }

    return (
        <div className={styles.sessionCard}>
            <div className={styles.sessionCardTop}>
                <div className={styles.sessionAvatar}>{session.student.charAt(0)}</div>
                <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>{session.title}</h3>
                    <p className={styles.sessionStudent}>with {session.student}</p>
                    <div className={styles.sessionMeta}>
                        <span className={styles.sessionMetaItem}>
                            <Calendar size={13} />{session.date}
                        </span>
                        <span className={styles.sessionMetaItem}>
                            <Clock size={13} />{session.duration}
                        </span>
                    </div>
                </div>
                <StatusBadge status={session.status} />
            </div>

            <div className={styles.cardActions}>
                {isConfirmed && (
                    <button
                        onClick={handleStartMeeting}
                        disabled={!session.canStart}
                        className={styles.btnStartMeeting}
                    >
                        <Video size={14} />
                        Start Meeting
                    </button>
                )}
                {isPending && (
                    <>
                        <button
                            onClick={() => handleAction('Confirmed')}
                            disabled={!!loadingAction}
                            className={styles.btnConfirm}
                        >
                            {loadingAction === 'Confirmed'
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Check size={14} />}
                            Confirm
                        </button>
                        <button
                            onClick={() => handleAction('Declined')}
                            disabled={!!loadingAction}
                            className={styles.btnDecline}
                        >
                            {loadingAction === 'Declined'
                                ? <Loader2 size={14} className="animate-spin" />
                                : <X size={14} />}
                            Decline
                        </button>
                    </>
                )}
                <button onClick={onViewDetails} className={styles.btnViewDetails}>
                    View Details
                </button>
                {(isConfirmed || isPending) && (
                    <button onClick={onReschedule} className={styles.btnReschedule}>
                        <RefreshCw size={13} />
                        Reschedule
                    </button>
                )}
            </div>
        </div>
    )
}

// ============================================================
//  MAIN PAGE
// ============================================================
export default function SessionsPage() {
    const { language, sidebarOpen, setSidebarOpen } = useApp()
    const searchParams = useSearchParams()

    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [pageError, setPageError] = useState<string | null>(null)
    const [detailsSession, setDetailsSession] = useState<Session | null>(null)
    const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null)
    const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Cancelled' | 'Expired' | 'Pending'>('All')

    const filterOptions = [
        { key: 'All', labelAr: 'الكل', labelEn: 'All' },
        { key: 'Confirmed', labelAr: 'مؤكدة', labelEn: 'Confirmed' },
        { key: 'Pending', labelAr: 'قيد الانتظار', labelEn: 'Pending' },
        { key: 'Cancelled', labelAr: 'ملغاة', labelEn: 'Cancelled' },
        { key: 'Expired', labelAr: 'منتهية الصلاحية', labelEn: 'Expired' }
    ] as const

    const filteredSessions = sessions.filter(session => {
        if (statusFilter === 'All') return true
        if (statusFilter === 'Confirmed') return session.status === 'Confirmed'
        if (statusFilter === 'Cancelled') return session.status === 'Cancelled' || session.status === 'Declined'
        if (statusFilter === 'Expired') return session.status === 'Expired'
        if (statusFilter === 'Pending') return session.status === 'Pending'
        return true
    })

    const fetchSessions = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const res = await api.get(`/Mentor/MySessions?t=${Date.now()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
            const data = res.data?.data || res.data || []
            console.log('[fetchSessions] Raw sessions data:', data)
            data.forEach((s: any) => {
                if (s.sessionId === 1 || s.sessionId === 13 || s.sessionId === 14) {
                    console.log(`[fetchSessions] Session ${s.sessionId} raw date from backend:`, s.formattedDate)
                }
            })
            const mapped = data.map((s: any) => ({
                id: s.sessionId,
                title: s.topic || 'Mentorship Session',
                student: s.menteeName || '',
                status: s.status as SessionStatus,
                date: s.formattedDate || '',
                duration: s.duration || '',
                studentProfileId: s.menteeId,
                currentDate: s.formattedDate ? s.formattedDate.split(',')[0] : '',
                currentTime: s.formattedDate ? s.formattedDate.split(',')[1] || '' : '',
                canStart: s.canStart
            }))
            setSessions(mapped)
        } catch (err: any) {
            console.warn('[fetchSessions] API failed, falling back to MOCK_SESSIONS:', err)
            setSessions(MOCK_SESSIONS)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [searchParams])

    // Open reschedule modal when ?reschedule=sessionId is in the URL
    // Runs after sessions are loaded so we can find the real session object
    useEffect(() => {
        if (loading) return
        const rescheduleId = searchParams.get('reschedule')
        if (rescheduleId) {
            const found = sessions.find(s => s.id === Number(rescheduleId))
            if (found) {
                setRescheduleSession(found)
            }
        }
    }, [sessions, loading, searchParams])

    // Open details modal when ?sessionId or ?id is in the URL
    useEffect(() => {
        if (loading) return
        const sessionIdParam = searchParams.get('sessionId') || searchParams.get('id')
        if (sessionIdParam) {
            const found = sessions.find(s => s.id === Number(sessionIdParam))
            if (found) {
                setDetailsSession(found)
            } else if (sessions.length > 0) {
                setDetailsSession({
                    id: Number(sessionIdParam),
                    title: 'Mentorship Session',
                    student: 'Student',
                    status: 'Pending',
                    date: '',
                    duration: '',
                    currentDate: '',
                    currentTime: ''
                })
            }
        }
    }, [sessions, loading, searchParams])

    if (loading) {
        return <LoadingScreen />
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const data = await updateSessionStatus(id, status)
            setSessions(prev =>
                prev.map(s => s.id === id ? { ...s, status: status as SessionStatus } : s)
            )
            const successMsg = data?.message || data?.Message || 
                (language === 'ar'
                    ? (status === 'Confirmed' ? 'تم تأكيد الجلسة بنجاح.' : 'تم إلغاء الجلسة بنجاح.')
                    : (status === 'Confirmed' ? 'Session confirmed successfully.' : 'Session declined successfully.')
                )
            alert(successMsg)
        } catch (err: any) {
            console.error('[handleUpdateStatus] Action failed:', err)
            const errMsg = getErrorMessage(err, language === 'ar' ? 'فشلت العملية. يرجى المحاولة مرة أخرى.' : `Failed to ${status.toLowerCase()} session.`)
            alert(errMsg)
        }
    }

    const handleRescheduleSuccess = (sessionId: number, _slotId: number, newSlot: AvailableSlot) => {
        setSessions(prev =>
            prev.map(s => s.id === sessionId
                ? {
                    ...s,
                    status: 'Confirmed',
                    date: `${newSlot.displayDate}, ${newSlot.displayTime}`,
                    currentDate: newSlot.displayDate,
                    currentTime: newSlot.displayTime,
                }
                : s
            )
        )
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            {language === 'ar' ? 'جلساتي' : 'My Sessions'}
                        </h1>
                        <p className={styles.pageSubtitle}>
                            {language === 'ar' ? 'إدارة الطلبات والجدول الزمني' : 'Manage your session requests and schedule'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <TopBarControls />
                    </div>
                </div>



                {pageError && !loading && (
                    <div className={styles.errorState}>{pageError}</div>
                )}

                {!loading && !pageError && (
                    <>
                        <div className={styles.filterBar}>
                            {filterOptions.map(opt => {
                                const isActive = statusFilter === opt.key
                                const label = language === 'ar' ? opt.labelAr : opt.labelEn
                                return (
                                    <button
                                        key={opt.key}
                                        className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ''}`}
                                        onClick={() => setStatusFilter(opt.key)}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>

                        <div className={styles.sessionsList}>
                            {filteredSessions.map(session => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    onViewDetails={() => setDetailsSession(session)}
                                    onReschedule={() => setRescheduleSession(session)}
                                    onUpdate={handleUpdateStatus}
                                />
                            ))}
                            {filteredSessions.length === 0 && (
                                <p className={styles.emptyState}>
                                    {language === 'ar'
                                        ? 'لا توجد جلسات تطابق هذا التصفية.'
                                        : 'No sessions found matching this filter.'}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {detailsSession && (
                <ViewDetailsModal
                    session={detailsSession}
                    onClose={() => setDetailsSession(null)}
                />
            )}

            {rescheduleSession && (
                <RescheduleModal
                    session={rescheduleSession}
                    onClose={() => setRescheduleSession(null)}
                    onSuccess={handleRescheduleSuccess}
                />
            )}
        </div>
    )
}
