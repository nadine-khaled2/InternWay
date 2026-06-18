
'use client'

import { useEffect, useState, startTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Briefcase,
    Users,
    UserCircle,
    Video,
    ChevronLeft,
    X,
    User,
    GraduationCap,
    Edit,
    Menu,
    Upload,
    Check
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import styles from './ProfileStyle.module.css'
import api from '../../lib/api'
import { toast } from '../../lib/toast'

interface RawProfile {
    fullName:   string | null
    email:      string
    phone:      string | null
    university: string | null
    college:    string | null
    major:      string | null
    location:   string | null
    gradYear:   string | null
    skills:     string[] | null
}

interface ProfileData {
    name:           string
    email:          string
    phoneNumber:    string
    location:       string
    university:     string
    college:        string
    major:          string
    graduationYear: string
    skills:         string[]
}

const DEFAULT_PROFILE: ProfileData = {
    name:           '',
    email:          '',
    phoneNumber:    '',
    location:       '',
    university:     '',
    college:        '',
    major:          '',
    graduationYear: '',
    skills:         [],
}

function normaliseProfile(raw: RawProfile): ProfileData {
    return {
        name:           raw.fullName   ?? '',
        email:          raw.email      ?? '',
        phoneNumber:    raw.phone      ?? '',
        location:       raw.location   ?? '',
        university:     raw.university ?? '',
        college:        raw.college    ?? '',
        major:          raw.major      ?? '',
        graduationYear: raw.gradYear   ?? '',
        skills:         Array.isArray(raw.skills) ? raw.skills.filter(Boolean) : [],
    }
}

function ProfilePage() {
    const { t } = useApp()
    const router = useRouter()

    const [loading, setLoading] = useState<boolean>(true)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [cvFile, setCvFile] = useState<File | null>(null)

    const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE)
    const [editData, setEditData] = useState<ProfileData>(DEFAULT_PROFILE)

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const res = await api.get('/Student/Profile')
            const raw: RawProfile | null = res.data?.Data ?? res.data?.data ?? null

            if (raw) {
                const normalised = normaliseProfile(raw)
                setProfileData(normalised)
                setEditData(normalised)
            }
        } catch (err: any) {
            console.warn('[fetchProfile] API failed, using default empty profile:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleSaveProfile = async () => {
        try {
            const formData = new FormData()
            formData.append('fullName',   editData.name)
            formData.append('email',      editData.email)
            formData.append('phone',      editData.phoneNumber)
            formData.append('university', editData.university)
            formData.append('college',    editData.college)
            formData.append('major',      editData.major)
            formData.append('gradYear',   editData.graduationYear)
            if (cvFile) formData.append('CvFile', cvFile)

            const res = await api.put('/Student/Profile/SaveChange', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            const info = res.data?.Info ?? res.data?.info
            if (info?.cvChange) {
                toast.success('Profile updated!')
            }

            const updatedRaw: RawProfile | null = res.data?.Data ?? res.data?.data ?? null
            if (updatedRaw) {
                const normalised = normaliseProfile(updatedRaw)
                setProfileData(normalised)
                setEditData(normalised)
            } else {
                setProfileData({ ...editData })
            }

            setIsEditing(false)
            setCvFile(null)
        } catch (err: any) {
            console.error('[handleSaveProfile]', err)
            if (err.response?.status === 409) {
                toast.error('This email is already in use by another account.')
            } else if (err.response?.status === 400) {
                toast.error('Please check your inputs and try again.')
            } else {
                toast.error(err.message ?? 'Failed to save profile. Please try again.')
            }
        }
    }

    const handleEdit = () => {
        setEditData({ ...profileData })
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setCvFile(null)
    }

    const handleFieldChange = (field: keyof Omit<ProfileData, 'skills'>, value: string) => {
        setEditData(prev => ({ ...prev, [field]: value }))
    }

    const validateAndSetFile = (file: File | undefined) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        if (file && allowedTypes.includes(file.type)) {
            setCvFile(file)
        } else {
            toast.error('Please upload a PDF, DOC, or DOCX file')
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        validateAndSetFile(e.target.files?.[0])
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        validateAndSetFile(e.dataTransfer.files?.[0])
    }

    const displayed = isEditing ? editData : profileData

    if (loading) {
        return <LoadingScreen />
    }

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
                    <div
                        className={styles.backButton}
                        onClick={() => startTransition(() => router.push('/student/dashboard'))}
                        role="button"
                        title="Back to Dashboard"
                    >
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
                        <span>{(t as any).dashboard ?? 'Dashboard'}</span>
                    </Link>
                    <Link href="/student/internships" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
                        <Briefcase size={20} />
                        <span>{(t as any).internships ?? 'Internships'}</span>
                    </Link>
                    <Link href="/student/mentorships" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
                        <Users size={20} />
                        <span>{(t as any).mentorships ?? 'Mentorships'}</span>
                    </Link>
                    <Link href="/student/sessions" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
                        <Video size={20} />
                        <span>{(t as any).mySessions ?? 'My Sessions'}</span>
                    </Link>
                    <Link href="/student/profile" className={`${styles.navItem} ${styles.active}`} onClick={() => setSidebarOpen(false)}>
                        <UserCircle size={20} />
                        <span>{(t as any).profile ?? 'Profile'}</span>
                    </Link>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>{(t as any).myProfile ?? 'My Profile'}</h1>
                        <p className={styles.pageSubtitle}>{(t as any).updateInfo ?? 'Update your info'}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <TopBarControls />
                    </div>
                </header>

                <div className={styles.editBarTop}>
                    {!isEditing ? (
                        <button className={styles.editProfileBtn} onClick={handleEdit}>
                            <Edit size={16} />
                            {(t as any).editProfile ?? 'Edit Profile'}
                        </button>
                    ) : (
                        <div className={styles.editActionBtns}>
                            <button className={styles.cancelEditBtn} onClick={handleCancel}>
                                <X size={16} />
                                {(t as any).cancel ?? 'Cancel'}
                            </button>
                            <button className={styles.saveEditBtn} onClick={handleSaveProfile}>
                                <Check size={16} />
                                {(t as any).saveChanges ?? 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.card}>
                    <div className={styles.profileSection}>
                        {/* Personal Information Section */}
                        <div className={styles.sectionContainer}>
                            <div className={styles.sectionHeader}>
                                <User size={20} />
                                <h3>{(t as any).personalInformation ?? 'Personal Information'}</h3>
                            </div>
                            <div className={styles.twoColumnGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).fullNameLabel ?? 'Full Name'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={displayed.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).fullNameLabel ?? 'Full Name'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).emailAddress ?? 'Email Address'}</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        value={displayed.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).emailPlaceholder ?? 'Email'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).phoneNumberLabel ?? 'Phone Number'}</label>
                                    <input
                                        type="tel"
                                        className={styles.input}
                                        value={displayed.phoneNumber}
                                        onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).phoneNumberPlaceholder ?? 'Phone Number'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).locationLabel ?? 'Location'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={displayed.location}
                                        onChange={(e) => handleFieldChange('location', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).locationPlaceholder ?? 'Location'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className={styles.sectionContainer}>
                            <div className={styles.sectionHeader}>
                                <GraduationCap size={20} />
                                <h3>{(t as any).education ?? 'Education'}</h3>
                            </div>
                            <div className={styles.twoColumnGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).universityLabel ?? 'University'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={displayed.university}
                                        onChange={(e) => handleFieldChange('university', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).universityPlaceholder ?? 'University'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).collegeLabel ?? 'College'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={displayed.college}
                                        onChange={(e) => handleFieldChange('college', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).collegePlaceholder ?? 'College'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).majorLabel ?? 'Major'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={displayed.major}
                                        onChange={(e) => handleFieldChange('major', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).majorPlaceholder ?? 'Major'}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{(t as any).graduationYearLabel ?? 'Graduation Year'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={displayed.graduationYear}
                                        onChange={(e) => handleFieldChange('graduationYear', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={(t as any).graduationYearPlaceholder ?? 'Graduation Year'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upload CV Section */}
                        <div className={styles.sectionContainer}>
                            <h3 className={styles.uploadSectionTitle}>{(t as any).uploadCvTitle ?? 'Upload CV'}</h3>
                            <input
                                id="cv-file-input"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className={styles.hiddenFileInput}
                                aria-label={(t as any).uploadCvTitle ?? 'Upload CV'}
                            />
                            <div
                                className={styles.uploadArea}
                                onClick={() => document.getElementById('cv-file-input')?.click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <Upload size={48} className={styles.uploadIcon} />
                                {cvFile ? (
                                    <>
                                        <p className={styles.uploadText}>{(t as any).fileSelected ?? 'File Selected:'} {cvFile.name}</p>
                                        <p className={styles.uploadSubtext}>{(t as any).clickToChange ?? 'Click to change'}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className={styles.uploadText}>{(t as any).dragDropCv ?? 'Drag & Drop CV'}</p>
                                        <p className={styles.uploadSubtext}>{(t as any).clickBrowse ?? 'or click to browse'}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Skills Section — read only, no delete button */}
                        <div className={styles.sectionContainer}>
                            <h3 className={styles.uploadSectionTitle}>{(t as any).skillsLabel ?? 'Skills'}</h3>
                            <div className={styles.skillsContainer}>
                                {displayed.skills.map((skill) => (
                                    <span key={skill} className={styles.skillBadge}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ProfilePage