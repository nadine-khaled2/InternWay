
// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import {
//     LayoutDashboard,
//     Briefcase,
//     Users,
//     UserCircle,
//     Video,
//     ChevronLeft,
//     Star,
//     Search,
//     Calendar,
//     Eye,
//     Menu,
//     X
// } from 'lucide-react'
// import { useApp } from '../../context/AppContext'
// import TopBarControls from '../../components/TopBarControls/TopBarControls'
// import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
// import styles from './MentorshipsStyle.module.css'
// import api from '../../lib/api'
// // ─── Types matching the API response exactly ────────────────────────────────

// interface ApiMentor {
//     mentorId: number
//     mentorName: string
//     jobTitle: string | null
//     yearsExperience: number 
//     avgRating: number
//     countReviewers: number
//     description: string | null
//     isAvailable: boolean
//     upcomingAvailability: string | null
//     skills: string[] | null
// }

// interface ApiSlot {
//     slotId: number
//     date: string
// }

// interface ApiTopic {
//     id: number
//     title: string
// }

// // ─── Internal UI shape (keeps the rest of the JSX untouched) ────────────────

// interface Mentor {
//     id: number
//     name: string
//     title: string
//     expertise: string[]
//     experience: number
//     rating: number
//     reviews: number
//     bio: string
//     nextAvailable?: {
//         date: string
//         time: string
//     }
//     isAvailable: boolean
//     longBio?: string
//     stats?: {
//         totalSessions: number
//         menteesHired: number
//     }
//      experiencesList?: string[]
//     field?: string
//     // Real slots fetched on demand: { slotId, date }
//     availableSlots?: ApiSlot[]
// }
// interface ApiMentorDetail {
//     mentorId: number
//     mentorName: string
//     jobTitle: string | null
//     yearsExperience: number
//     avgRating: number
//     countReviewers: number
//     description: string | null
//     skills: string[] | null
//     experiences: string[] | null
//     totalSessions: number
//     numMenteesHired: number
//     isAvailable: boolean
// }

// function mapApiMentorDetail(m: ApiMentorDetail): Mentor {
//     return {
//         id: m.mentorId,
//         name: m.mentorName,
//         title: m.jobTitle ?? '',
//         expertise: m.skills ?? [],
//         experience: m.yearsExperience ?? 0,
//         rating: m.avgRating,
//         reviews: m.countReviewers,
//         bio: m.description ?? '',
//         longBio: m.description ?? '',
//         isAvailable: m.isAvailable,
//         field: m.jobTitle ?? '',
//         experiencesList: m.experiences ?? [],
//         stats: {
//             totalSessions: m.totalSessions ?? 0,
//             menteesHired: m.numMenteesHired ?? 0
//         }
//     }
// }
// // ─── Map API mentor → UI mentor ─────────────────────────────────────────────

// function mapApiMentor(m: ApiMentor): Mentor {

//     let nextAvailable: Mentor['nextAvailable'] | undefined
//     if (m.upcomingAvailability) {
//         const parts = m.upcomingAvailability.split(',')
//         if (parts.length >= 2) {
//             nextAvailable = {
//                 date: parts[0].trim(),
//                 time: parts[1].trim()
//             }
//         } else {
//             nextAvailable = { date: m.upcomingAvailability, time: '' }
//         }
//     }

//     return {
//         id: m.mentorId,
//         name: m.mentorName,
//         title: m.jobTitle ?? '',
//         expertise: m.skills ?? [],
//         experience: m.yearsExperience ?? 0,
//         rating: m.avgRating,
//         reviews: m.countReviewers,
//         bio: m.description ?? '',
//         longBio: m.description ?? '',
//         isAvailable: m.isAvailable,
//         nextAvailable,
//         field: m.jobTitle ?? ''
//     }
// }

// // ─── Mock fallback (kept for offline/dev use only) ───────────────────────────

// const mockMentors: Mentor[] = [
//     {
//         id: 1,
//         name: 'Dr. Ahmed Hassan',
//         title: 'Senior Software Engineer',
//         expertise: ['React', 'Node.js', 'System Design', 'Career Growth'],
//         experience: 15,
//         rating: 4.9,
//         reviews: 127,
//         bio: 'Passionate about mentoring young developers and helping them navigate their career paths.',
//         longBio: 'Passionate about mentoring young developers and helping them navigate their career paths. I have over 15 years of experience building scalable web applications and leading engineering teams at top tech companies. My mentoring style focuses on practical, hands-on learning and preparing you for real-world engineering challenges.',
//         stats: {
//             totalSessions: 342,
//             menteesHired: 45
//         },
//         field: 'Software Engineering',
//         availableSlots: [],
//         nextAvailable: { date: 'Tomorrow', time: '3PM' },
//         isAvailable: true
//     },
//     {
//         id: 2,
//         name: 'Eng. Sara Mohamed',
//         title: 'Lead Data Scientist',
//         expertise: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
//         experience: 10,
//         rating: 4.8,
//         reviews: 89,
//         bio: 'Helping aspiring data scientists break into the field with practical guidance.',
//         longBio: 'Helping aspiring data scientists break into the field with practical guidance. With 10 years in data warehousing, predictive modeling, and analytics, I guide students through building portfolio projects, understanding machine learning pipelines, and preparing for technical interviews.',
//         stats: {
//             totalSessions: 210,
//             menteesHired: 28
//         },
//         field: 'Data Science',
//         availableSlots: [],
//         nextAvailable: { date: 'Dec 28', time: '10AM' },
//         isAvailable: true
//     },
//     {
//         id: 3,
//         name: 'Prof. Karim Ali',
//         title: 'AI Research Director',
//         expertise: ['Deep Learning', 'NLP', 'Computer Vision', 'Research'],
//         experience: 12,
//         rating: 4.7,
//         reviews: 156,
//         bio: 'Research-focused mentor specializing in cutting-edge AI technologies.',
//         longBio: 'Research-focused mentor specializing in cutting-edge AI technologies, deep learning, and natural language processing. I have guided numerous academic and industry projects, helping researchers transition theory into practical models.',
//         stats: {
//             totalSessions: 180,
//             menteesHired: 15
//         },
//         field: 'AI & ML',
//         availableSlots: [],
//         isAvailable: false
//     },
//     {
//         id: 4,
//         name: 'Eng. Nour Khaled',
//         title: 'UX/UI Design Lead',
//         expertise: ['Figma', 'User Research', 'Design Systems', 'Portfolio'],
//         experience: 8,
//         rating: 4.9,
//         reviews: 189,
//         bio: 'Helping designers build stunning portfolios and land their dream jobs.',
//         longBio: 'Helping designers build stunning portfolios and land their dream jobs. Dedicated UI/UX designer with 8 years of experience. We will focus on user research, wireframing, design systems in Figma, and how to present your design decisions to stakeholders.',
//         stats: {
//             totalSessions: 295,
//             menteesHired: 38
//         },
//         field: 'Design',
//         availableSlots: [],
//         nextAvailable: { date: 'Dec 27', time: '2PM' },
//         isAvailable: true
//     }
// ]

// // ─── Refresh-token helper ────────────────────────────────────────────────────

// async function refreshAccessToken(): Promise<string | null> {
//     try {
//         const refreshToken = localStorage.getItem('refreshToken')
//         if (!refreshToken) return null
//         const res = await api.post('/auth/refresh-token', { refreshToken })
//         const newToken: string = res.data?.accessToken ?? res.data?.token
//         if (newToken) {
//             localStorage.setItem('token', newToken)
//             return newToken
//         }
//         return null
//     } catch {
//         return null
//     }
// }

// // ─── Component ───────────────────────────────────────────────────────────────

// function MentorshipsPage() {
//     const { t, language } = useApp()
//     const router = useRouter()

//     const [mentors, setMentors] = useState<Mentor[]>([])
//     const [loading, setLoading] = useState(true)
//     const [searchQuery, setSearchQuery] = useState('')
//     const [selectedField, setSelectedField] = useState('all')

//     const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
//     const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

//     // Slots & topics fetched from the API when the booking modal opens
//     const [availableSlots, setAvailableSlots] = useState<ApiSlot[]>([])
//     const [topics, setTopics] = useState<ApiTopic[]>([])
//     const [slotsLoading, setSlotsLoading] = useState(false)
//     const [topicsLoading, setTopicsLoading] = useState(false)

//     // Selected IDs to send to POST /book
//     const [selectedSlotId, setSelectedSlotId] = useState<number | ''>('')
//     const [selectedTopicId, setSelectedTopicId] = useState<number | ''>('')

//     const [bookingLoading, setBookingLoading] = useState(false)
//     const [bookingError, setBookingError] = useState<string | null>(null)

//     const [detailLoading, setDetailLoading] = useState(false)
//     const [sidebarOpen, setSidebarOpen] = useState(false)

//     const fetchMentorDetail = async (mentorId: number, token?: string) => {
//         try {
//             setDetailLoading(true)
//             const tk = token ?? localStorage.getItem('token')
//             const res = await api.get(`/Student/Mentorships/view/details/mentor/${mentorId}`, {
//                 headers: { Authorization: `Bearer ${tk}` }
//             })
//             const raw: ApiMentorDetail | null = res.data?.data ?? res.data?.Data ?? null
//             if (raw) {
//                 setSelectedMentor(mapApiMentorDetail(raw))
//             }
//         } catch (err: any) {
//             if (err.response?.status === 401) {
//                 const newToken = await refreshAccessToken()
//                 if (newToken) {
//                     fetchMentorDetail(mentorId, newToken)
//                 } else {
//                     router.push('/login')
//                 }
//                 return
//             }
//             console.warn('[fetchMentorDetail] failed:', err)
//             // keep existing card data as fallback (selectedMentor already set)
//         } finally {
//             setDetailLoading(false)
//         }
//     }

//     // ── Fetch all mentors ──────────────────────────────────────────────────

//     const fetchMentors = async (token?: string) => {
//         try {
//             setLoading(true)
//             const tk = token ?? localStorage.getItem('token')
            
//             const res = await api.get('/Student/Mentorships', {
//                 headers: { Authorization: `Bearer ${tk}` }
//             })
            
// const raw: ApiMentor[] | null = res.data?.data ?? res.data?.Data ?? null
//             setMentors(raw ? raw.map(mapApiMentor) : [])
//         } catch (err: any) {
//             if (err.response?.status === 401) {
//                 const newToken = await refreshAccessToken()
//                 if (newToken) {
//                     fetchMentors(newToken)
//                 } else {
//                     router.push('/login')
//                 }
//                 return
//             }
//             // Any other error → fall back to mock data so the UI stays functional
//             console.warn('[fetchMentors] API failed, falling back to mockMentors:', err)
//             setMentors(mockMentors)
//         } finally {
//             setLoading(false)
//         }
//     }
 
//   useEffect(() => {
//     fetchMentors()
// }, [])

// useEffect(() => {
//     if (mentors.length === 0) return
// const params = new URLSearchParams(window.location.search)
// const mentorIdParam = params.get('mentorId')
//     if (mentorIdParam) {
//         const mentor = mentors.find(m => m.id === Number(mentorIdParam))
//         if (mentor) {
//             setSelectedMentor(mentor)
//             if (mentor.isAvailable) {
//                 handleOpenBookingModal(mentor)
//             }
//         }
//     }
// }, [mentors])

//     // ── Open booking modal: fetch slots + topics in parallel ──────────────

//     const handleOpenBookingModal = async (mentor: Mentor) => {
//         setSelectedMentor(mentor)
//         setIsBookingModalOpen(true)
//         setSelectedSlotId('')
//         setSelectedTopicId('')
//         setBookingError(null)

//         const token = localStorage.getItem('token')
//           setSlotsLoading(true)
//         api.get(`/Student/Mentorships/mentors/available-slots/${mentor.id}`, {
//             headers: { Authorization: `Bearer ${token}` }
//         })
//             .then(res => {
//                 // Response: { Message, Data: { slotId, date }[] | null }
//                 setAvailableSlots(res.data?.data ?? res.data?.Data ?? [])
//             })
//             .catch(err => {
//                 if (err.response?.status === 404) {
//                     // 404 = no available slots
//                     setAvailableSlots([])
//                 } else {
//                     console.warn('[fetchSlots] failed:', err)
//                     setAvailableSlots([])
//                 }
//             })
//             .finally(() => setSlotsLoading(false))

//         setTopicsLoading(true)
//         api.get('/Student/Mentorships/session/topic', {
//             headers: { Authorization: `Bearer ${token}` }
//         })
//             .then(res => {
//         setTopics(res.data?.data ?? res.data?.Data ?? [])  
//           })
//             .catch(err => {
//                 console.warn('[fetchTopics] failed:', err)
//                 setTopics([])
//             })
//             .finally(() => setTopicsLoading(false))
//     }

//     // ── Confirm booking ────────────────────────────────────────────────────

//     const handleConfirmBooking = async () => {
//         if (selectedSlotId === 0 || selectedTopicId === 0) {
//             setBookingError(t.selectSlotAndTopic ?? 'Please select a time slot and a topic.')
//             return
//         }

//         setBookingLoading(true)
//         setBookingError(null)

//         const token = localStorage.getItem('token')

//         try {
//             await api.post(
//                 '/Student/Mentorships/mentors/Session/book',
//                 { slotId: selectedSlotId, topicId: selectedTopicId },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             )

//             // Success → close modal and show feedback
//             setIsBookingModalOpen(false)
//             setSelectedSlotId('')
//             setSelectedTopicId('')
//             alert(`${t.bookingSuccess ?? 'Booking confirmed with'} ${selectedMentor?.name}!`)

          
//         } catch (err: any) {
//             if (err.response?.status === 401) {
//                 const newToken = await refreshAccessToken()
//                 if (newToken) {
//                     // Retry once
//                     try {
//                         await api.post(
//                             '/Student/Mentorships/mentors/Session/book',
//                             { slotId: selectedSlotId, topicId: selectedTopicId },
//                             { headers: { Authorization: `Bearer ${newToken}` } }
//                         )
//                         setIsBookingModalOpen(false)
//                         setSelectedSlotId('')
//                         setSelectedTopicId('')
//                         alert(`${t.bookingSuccess ?? 'Booking confirmed with'} ${selectedMentor?.name}!`)
//                         return
//                     } catch (retryErr: any) {
//                         setBookingError(retryErr.response?.data ?? 'Booking failed. Please try again.')
//                     }
//                 } else {
//                     router.push('/login')
//                 }
//                 return
//             }

//             const msg =
//                 typeof err.response?.data === 'string'
//                     ? err.response.data
//                     : err.response?.data?.message ?? 'Booking failed. Please try again.'
//             setBookingError(msg)
//         } finally {
//             setBookingLoading(false)
//         }
//     }

//     // ── Filter mentors ─────────────────────────────────────────────────────

//     const filteredMentors = mentors.filter(mentor => {
//         const matchesSearch =
//             mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

//         let matchesField = true
//         if (selectedField !== 'all') {
//             const expertiseStr = mentor.expertise.join(' ').toLowerCase()
//             const titleStr = mentor.title.toLowerCase()

//             switch (selectedField) {
//                 case 'software':
//                     matchesField = expertiseStr.includes('react') || expertiseStr.includes('node') ||
//                         expertiseStr.includes('system') || titleStr.includes('software')
//                     break
//                 case 'data':
//                     matchesField = expertiseStr.includes('data') || expertiseStr.includes('python') ||
//                         titleStr.includes('data')
//                     break
//                 case 'ai':
//                     matchesField = expertiseStr.includes('ai') || expertiseStr.includes('machine') ||
//                         expertiseStr.includes('learning') || expertiseStr.includes('deep') ||
//                         expertiseStr.includes('nlp') || titleStr.includes('ai')
//                     break
//                 case 'design':
//                     matchesField = expertiseStr.includes('design') || expertiseStr.includes('figma') ||
//                         expertiseStr.includes('ux') || titleStr.includes('design')
//                     break
//             }
//         }

//         return matchesSearch && matchesField
//     })

//     if (loading) {
//         return <LoadingScreen />
//     }

//     // ── JSX (100% identical to original — zero style changes) ─────────────

//     return (
//         <div className={styles.appLayout}>
//             <div className={styles.glow} aria-hidden="true" />
//             <div className={styles.glowSecondary} aria-hidden="true" />
//             <div className={styles.glowTertiary} aria-hidden="true" />

//             {/* Overlay */}
//             <div
//                 className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
//                 onClick={() => setSidebarOpen(false)}
//             />

//             {/* Sidebar */}
//             <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
//                 <div className={styles.logoSection}>
//                     <div
//                         className={styles.backButton}
//                         onClick={() => {
//                             if (selectedMentor) {
//                                 setSelectedMentor(null)
//                             } else {
//                                 router.push('/student/dashboard')
//                             }
//                         }}
//                         role="button"
//                         title={selectedMentor ? 'Back to Mentors List' : 'Back to Dashboard'}
//                     >
//                         <ChevronLeft size={20} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
//                     </div>
//                     <div className={styles.logo}>
//                         <div className={styles.logoIcon}>IW</div>
//                         <span className={styles.logoText}>InternWay</span>
//                     </div>
//                 </div>

//                 <nav className={styles.nav}>
//                     <Link href="/student/dashboard" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <LayoutDashboard size={20} />
//                         <span>{t.dashboard}</span>
//                     </Link>
//                     <Link href="/student/internships" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <Briefcase size={20} />
//                         <span>{t.internships}</span>
//                     </Link>
//                     <Link href="/student/mentorships" className={`${styles.navItem} ${styles.active}`} onClick={() => setSidebarOpen(false)}>
//                         <Users size={20} />
//                         <span>{t.mentorships}</span>
//                     </Link>
//                     <Link href="/student/sessions" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <Video size={20} />
//                         <span>{t.mySessions}</span>
//                     </Link>
//                     <Link href="/student/profile" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <UserCircle size={20} />
//                         <span>{t.profile}</span>
//                     </Link>
//                 </nav>
//             </aside>

//             <main className={styles.mainContent}>
//                 <header className={styles.topBar}>
//                     <div className={styles.pageHeader}>
//                         {selectedMentor ? (
//                             <div className={styles.detailBreadcrumb} onClick={() => setSelectedMentor(null)} role="button">
//                                 <ChevronLeft size={20} className={styles.breadcrumbBackIcon} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
//                                 <span className={styles.breadcrumbText}>{t.back}</span>
//                             </div>
//                         ) : (
//                             <>
//                                 <h1 className={styles.pageTitle}>{t.findMentor}</h1>
//                                 <p className={styles.pageSubtitle}>{t.connectWithProfessionals}</p>
//                             </>
//                         )}
//                     </div>
                    
//                     <div className={styles.headerActions}>
//                         <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
//                             {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
//                         </button>
//                         <TopBarControls />
//                     </div>
//                 </header>

//                 {selectedMentor ? (
//                     /* ── Mentor Detail View ─────────────────────────────────────── */
//                     <div className={styles.detailContainer}>
//                         <div className={styles.detailHeaderCard}>
//                             <div className={styles.detailHeaderLeft}>
//                                 <div className={styles.detailAvatar}>
//                                     <UserCircle size={80} />
//                                 </div>
//                                 <div className={styles.detailHeaderInfo}>
//                                     <h2 className={styles.detailName}>{selectedMentor.name}</h2>
//                                     <p className={styles.detailTitle}>{selectedMentor.title}</p>
//                                     <div className={styles.detailMeta}>
//                                         <div className={styles.detailMetaItem}>
//                                             <Star size={16} fill="#fbbf24" color="#fbbf24" />
//                                             <span className={styles.rating}>{selectedMentor.rating}</span>
//                                             <span className={styles.metaText}>({selectedMentor.reviews} {t.reviews})</span>
//                                         </div>
//                                         <span className={styles.metaDivider}>|</span>
//                                         <div className={styles.detailMetaItem}>
//                                             <Briefcase size={16} className={styles.metaIcon} />
//                                             <span className={styles.metaText}>{selectedMentor.experience} {t.years}</span>
//                                         </div>
//                                         <span className={styles.metaDivider}>|</span>
//                                         <div className={styles.detailMetaItem}>
//                                             <Calendar size={16} className={styles.metaIcon} />
//                                             <span className={styles.metaText}>{selectedMentor.field || selectedMentor.title}</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className={styles.detailHeaderRight}>
//                                 {selectedMentor.isAvailable ? (
//                                     <button
//                                         className={styles.detailBookButton}
//                                         onClick={() => handleOpenBookingModal(selectedMentor)}
//                                     >
//                                         {t.bookSession}
//                                     </button>
//                                 ) : (
//                                     <button className={styles.detailUnavailableButton} disabled>
//                                         {t.unavailable}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         <div className={styles.detailBody}>
//                             <div className={styles.detailMainContent}>
//                                 <div className={styles.detailSection}>
//                                     <h3 className={styles.detailSectionTitle}>{t.about}</h3>
//                                     <p className={styles.detailLongBio}>
//                                         {selectedMentor.longBio || selectedMentor.bio}
//                                     </p>
//                                 </div>

//                                 <div className={styles.detailSection}>
//                                     <h3 className={styles.detailSectionTitle}>{t.expertise}</h3>
//                                     <div className={styles.detailExpertiseTags}>
//                                         {selectedMentor.expertise.map((skill, index) => (
//                                             <span key={index} className={styles.detailExpertiseTag}>
//                                                 {skill}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                                    {selectedMentor.experiencesList && selectedMentor.experiencesList.length > 0 && (
//                                     <div className={styles.detailSection}>
//                                         <h3 className={styles.detailSectionTitle}>{(t as any).experience ?? 'Experience'}</h3>
//                                         <div className={styles.detailExpertiseTags}>
//                                             {selectedMentor.experiencesList.map((exp, index) => (
//                                                 <span key={index} className={styles.detailExpertiseTag}>
//                                                     {exp}
//                                                 </span>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
                            
//                             </div>

//                             <div className={styles.detailSidebar}>
//                                 <div className={styles.statsCard}>
//                                     <h3 className={styles.statsCardTitle}>
//                                         <Users size={18} className={styles.statsIcon} />
//                                         {t.mentorStats}
//                                     </h3>
//                                     <div className={styles.statsList}>
//                                         <div className={styles.statsItem}>
//                                             <span className={styles.statsLabel}>{t.totalSessions}</span>
//                                             <span className={styles.statsValue}>
//                                                 {selectedMentor.stats?.totalSessions ?? '—'}
//                                             </span>
//                                         </div>
                                       
//                                         <div className={styles.statsItem}>
//                                             <span className={styles.statsLabel}>{t.menteesHired}</span>
//                                             <span className={styles.statsValue}>
//                                                 {selectedMentor.stats?.menteesHired ?? '—'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     /* ── Mentor Listing View ────────────────────────────────────── */
//                     <>
//                         <div className={styles.searchFilterSection}>
//                             <div className={styles.searchBarWrapper}>
//                                 <Search className={styles.searchIcon} size={20} />
//                                 <input
//                                     type="text"
//                                     placeholder={t.searchMentors}
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     className={styles.searchBar}
//                                 />
//                             </div>
//                             <select
//                                 value={selectedField}
//                                 onChange={(e) => setSelectedField(e.target.value)}
//                                 className={styles.filterDropdown}
//                                 aria-label="Filter by field"
//                             >
//                                 <option value="all">{t.allFields}</option>
//                                 <option value="software">Software Engineering</option>
//                                 <option value="data">Data Science</option>
//                                 <option value="ai">AI & ML</option>
//                                 <option value="design">Design</option>
//                             </select>
//                         </div>

//                         <div className={styles.mentorsGrid}>
//                             {filteredMentors.length > 0 ? (
//                                 filteredMentors.map((mentor) => (
//                                     <div
//                                         key={mentor.id}
//                                         className={styles.mentorCardHorizontal}
//                                         onClick={() => fetchMentorDetail(mentor.id)}
//                                     >
//                                         <div className={styles.mentorAvatarLarge}>
//                                             <UserCircle size={64} />
//                                         </div>
//                                         <div className={styles.mentorDetails}>
//                                             <div className={styles.mentorHeader}>
//                                                 <h3 className={styles.mentorName}>{mentor.name}</h3>
//                                                 <p className={styles.mentorField}>{mentor.title}</p>
//                                             </div>
//                                             <div className={styles.mentorMeta}>
//                                                 <Star size={14} fill="#fbbf24" color="#fbbf24" />
//                                                 <span className={styles.rating}>{mentor.rating}</span>
//                                                 <span className={styles.metaText}>({mentor.reviews} {t.reviews}) • {mentor.experience}+ {t.years}</span>
//                                             </div>
//                                             <p className={styles.mentorBio}>{mentor.bio}</p>
//                                             <div className={styles.expertiseBadges}>
//                                                 <span className={styles.expertiseLabel}>{t.expertise}:</span>
//                                                 {mentor.expertise.map((skill, index) => (
//                                                     <span key={index} className={styles.expertiseBadge}>
//                                                         {skill}
//                                                     </span>
//                                                 ))}
//                                             </div>
//                                             {mentor.nextAvailable && (
//                                                 <div className={styles.availabilitySection}>
//                                                     <Calendar size={14} />
//                                                     <span className={styles.availabilityLabel}>{t.nextAvailable}:</span>
//                                                     <span className={styles.availabilityTime}>{mentor.nextAvailable.date} {mentor.nextAvailable.time}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
//                                             {mentor.isAvailable ? (
//                                                 <button
//                                                     className={styles.bookButton}
//                                                     onClick={() => handleOpenBookingModal(mentor)}
//                                                 >
//                                                     {t.bookSession}
//                                                 </button>
//                                             ) : (
//                                                 <button className={styles.unavailableButton} disabled>
//                                                     {t.unavailable}
//                                                 </button>
//                                             )}
//                                             <button
//                                                 className={styles.viewDetailsButton}
//                                                 onClick={() => fetchMentorDetail(mentor.id)}
//                                                 title="View Profile"
//                                             >
//                                                 <Eye size={18} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className={styles.emptyMessage}>
//                                     {t.noMentorsFound}
//                                 </div>
//                             )}
//                         </div>
//                     </>
//                 )}
//             </main>

//             {/* ── Booking Modal ──────────────────────────────────────────────── */}
//             {isBookingModalOpen && selectedMentor && (
//                 <div className={styles.modalOverlay} onClick={() => setIsBookingModalOpen(false)}>
//                     <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
//                         <div className={styles.modalHeader}>
//                             <h3 className={styles.modalTitle}>
//                                 {t.bookSessionWith} {selectedMentor.name}
//                             </h3>
//                             <button
//                                 className={styles.modalCloseBtn}
//                                 onClick={() => setIsBookingModalOpen(false)}
//                                 aria-label="Close modal"
//                             >
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         <div className={styles.modalBody}>
//                             <p className={styles.modalSubtext}>
//                                 Select a preferred time slot and topic for your mentorship session.
//                             </p>

//                             {/* Time slot select */}
//                             <div className={styles.formGroup}>
//                                 <label htmlFor="timeSlot" className={styles.formLabel}>
//                                     {t.selectTimeSlot}
//                                 </label>
//                                 {slotsLoading ? (
//                                     <select id="timeSlot" className={styles.formSelect} disabled title="Loading slots">
//                                         <option>Loading slots…</option>
//                                     </select>
//                                 ) : (
//                                     <select
//                                         id="timeSlot"
//                                         value={selectedSlotId}
//                                         onChange={(e) => setSelectedSlotId(Number(e.target.value))}
//                                         className={styles.formSelect}
//                                     >
//                                         <option value="">{t.chooseTime ?? 'Choose a time…'}</option>
//                                         {availableSlots.length > 0 ? (
//                                             availableSlots.map((slot) => (
//                                                 // slot.slotId → sent to API; slot.date → displayed to user
//                                                 <option key={slot.slotId} value={slot.slotId}>
//                                                     {slot.date}
//                                                 </option>
//                                             ))
//                                         ) : (
//                                             <option value="" disabled>No available slots</option>
//                                         )}
//                                     </select>
//                                 )}
//                             </div>

//                             {/* Topic select */}
//                             <div className={styles.formGroup}>
//                                 <label htmlFor="sessionTopic" className={styles.formLabel}>
//                                     {t.sessionTopic}
//                                 </label>
//                                 {topicsLoading ? (
//                                     <select id="sessionTopic" className={styles.formSelect} disabled title="Loading topics">
//                                         <option>Loading topics…</option>
//                                     </select>
//                                 ) : (
//                                     <select
//                                         id="sessionTopic"
//                                         value={selectedTopicId}
//                                         onChange={(e) => setSelectedTopicId(Number(e.target.value))}
//                                         className={styles.formSelect}
//                                     >
//                                         <option value="">{t.whatDiscuss ?? 'What would you like to discuss?'}</option>
//                                         {topics.map((topic) => (
//                                             // topic.Id → sent to API; topic.Title → displayed to user
//                                             <option key={topic.id} value={topic.id}>
//                                                 {topic.title}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}
//                             </div>

//                             {/* Inline error */}
//                             {bookingError && (
//                                 <p className={styles.errorMessage}>
//                                     {bookingError}
//                                 </p>
//                             )}
//                         </div>

//                         <div className={styles.modalFooter}>
//                             <button
//                                 className={styles.cancelBtn}
//                                 onClick={() => setIsBookingModalOpen(false)}
//                                 disabled={bookingLoading}
//                             >
//                                 {t.cancel}
//                             </button>
//                             <button
//                                 className={styles.confirmBtn}
//                                 onClick={handleConfirmBooking}
//                                 disabled={bookingLoading || slotsLoading || topicsLoading}
//                             >
//                                 {bookingLoading ? 'Booking…' : t.confirmBooking}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default MentorshipsPage




























// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import {
//     LayoutDashboard,
//     Briefcase,
//     Users,
//     UserCircle,
//     Video,
//     ChevronLeft,
//     Star,
//     Search,
//     Calendar,
//     Eye,
//     Menu,
//     X
// } from 'lucide-react'
// import { useApp } from '../../context/AppContext'
// import TopBarControls from '../../components/TopBarControls/TopBarControls'
// import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
// import styles from './MentorshipsStyle.module.css'
// import api from '../../lib/api'
// import { toast } from '../../lib/toast'

// // ─── Types matching the API response exactly ────────────────────────────────

// interface ApiMentor {
//     mentorId: number
//     mentorName: string
//     jobTitle: string | null
//     yearsExperience: number 
//     avgRating: number
//     countReviewers: number
//     description: string | null
//     isAvailable: boolean
//     upcomingAvailability: string | null
//     skills: string[] | null
// }

// interface ApiSlot {
//     slotId: number
//     date: string
// }

// interface ApiTopic {
//     id: number
//     title: string
// }

// // ─── Internal UI shape (keeps the rest of the JSX untouched) ────────────────

// interface Mentor {
//     id: number
//     name: string
//     title: string
//     expertise: string[]
//     experience: number
//     rating: number
//     reviews: number
//     bio: string
//     nextAvailable?: {
//         date: string
//         time: string
//     }
//     isAvailable: boolean
//     longBio?: string
//     stats?: {
//         totalSessions: number
//         menteesHired: number
//     }
//      experiencesList?: string[]
//     field?: string
//     availableSlots?: ApiSlot[]
// }

// interface ApiMentorDetail {
//     mentorId: number
//     mentorName: string
//     jobTitle: string | null
//     yearsExperience: number
//     avgRating: number
//     countReviewers: number
//     description: string | null
//     skills: string[] | null
//     experiences: string[] | null
//     totalSessions: number
//     numMenteesHired: number
//     isAvailable: boolean
// }

// function mapApiMentorDetail(m: ApiMentorDetail): Mentor {
//     return {
//         id: m.mentorId,
//         name: m.mentorName,
//         title: m.jobTitle ?? '',
//         expertise: m.skills ?? [],
//         experience: m.yearsExperience ?? 0,
//         rating: m.avgRating,
//         reviews: m.countReviewers,
//         bio: m.description ?? '',
//         longBio: m.description ?? '',
//         isAvailable: m.isAvailable,
//         field: m.jobTitle ?? '',
//         experiencesList: m.experiences ?? [],
//         stats: {
//             totalSessions: m.totalSessions ?? 0,
//             menteesHired: m.numMenteesHired ?? 0
//         }
//     }
// }

// // ─── Map API mentor → UI mentor ─────────────────────────────────────────────

// function mapApiMentor(m: ApiMentor): Mentor {

//     let nextAvailable: Mentor['nextAvailable'] | undefined
//     if (m.upcomingAvailability) {
//         const parts = m.upcomingAvailability.split(',')
//         if (parts.length >= 2) {
//             nextAvailable = {
//                 date: parts[0].trim(),
//                 time: parts[1].trim()
//             }
//         } else {
//             nextAvailable = { date: m.upcomingAvailability, time: '' }
//         }
//     }

//     return {
//         id: m.mentorId,
//         name: m.mentorName,
//         title: m.jobTitle ?? '',
//         expertise: m.skills ?? [],
//         experience: m.yearsExperience ?? 0,
//         rating: m.avgRating,
//         reviews: m.countReviewers,
//         bio: m.description ?? '',
//         longBio: m.description ?? '',
//         isAvailable: m.isAvailable,
//         nextAvailable,
//         field: m.jobTitle ?? ''
//     }
// }

// // ─── Mock fallback (kept for offline/dev use only) ───────────────────────────

// const mockMentors: Mentor[] = [
//     {
//         id: 1,
//         name: 'Dr. Ahmed Hassan',
//         title: 'Senior Software Engineer',
//         expertise: ['React', 'Node.js', 'System Design', 'Career Growth'],
//         experience: 15,
//         rating: 4.9,
//         reviews: 127,
//         bio: 'Passionate about mentoring young developers and helping them navigate their career paths.',
//         longBio: 'Passionate about mentoring young developers and helping them navigate their career paths. I have over 15 years of experience building scalable web applications and leading engineering teams at top tech companies. My mentoring style focuses on practical, hands-on learning and preparing you for real-world engineering challenges.',
//         stats: {
//             totalSessions: 342,
//             menteesHired: 45
//         },
//         field: 'Software Engineering',
//         availableSlots: [],
//         nextAvailable: { date: 'Tomorrow', time: '3PM' },
//         isAvailable: true
//     },
//     {
//         id: 2,
//         name: 'Eng. Sara Mohamed',
//         title: 'Lead Data Scientist',
//         expertise: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
//         experience: 10,
//         rating: 4.8,
//         reviews: 89,
//         bio: 'Helping aspiring data scientists break into the field with practical guidance.',
//         longBio: 'Helping aspiring data scientists break into the field with practical guidance. With 10 years in data warehousing, predictive modeling, and analytics, I guide students through building portfolio projects, understanding machine learning pipelines, and preparing for technical interviews.',
//         stats: {
//             totalSessions: 210,
//             menteesHired: 28
//         },
//         field: 'Data Science',
//         availableSlots: [],
//         nextAvailable: { date: 'Dec 28', time: '10AM' },
//         isAvailable: true
//     },
//     {
//         id: 3,
//         name: 'Prof. Karim Ali',
//         title: 'AI Research Director',
//         expertise: ['Deep Learning', 'NLP', 'Computer Vision', 'Research'],
//         experience: 12,
//         rating: 4.7,
//         reviews: 156,
//         bio: 'Research-focused mentor specializing in cutting-edge AI technologies.',
//         longBio: 'Research-focused mentor specializing in cutting-edge AI technologies, deep learning, and natural language processing. I have guided numerous academic and industry projects, helping researchers transition theory into practical models.',
//         stats: {
//             totalSessions: 180,
//             menteesHired: 15
//         },
//         field: 'AI & ML',
//         availableSlots: [],
//         isAvailable: false
//     },
//     {
//         id: 4,
//         name: 'Eng. Nour Khaled',
//         title: 'UX/UI Design Lead',
//         expertise: ['Figma', 'User Research', 'Design Systems', 'Portfolio'],
//         experience: 8,
//         rating: 4.9,
//         reviews: 189,
//         bio: 'Helping designers build stunning portfolios and land their dream jobs.',
//         longBio: 'Helping designers build stunning portfolios and land their dream jobs. Dedicated UI/UX designer with 8 years of experience. We will focus on user research, wireframing, design systems in Figma, and how to present your design decisions to stakeholders.',
//         stats: {
//             totalSessions: 295,
//             menteesHired: 38
//         },
//         field: 'Design',
//         availableSlots: [],
//         nextAvailable: { date: 'Dec 27', time: '2PM' },
//         isAvailable: true
//     }
// ]

// // ─── Refresh-token helper ────────────────────────────────────────────────────

// async function refreshAccessToken(): Promise<string | null> {
//     try {
//         const refreshToken = localStorage.getItem('refreshToken')
//         if (!refreshToken) return null
//         const res = await api.post('/auth/refresh-token', { refreshToken })
//         const newToken: string = res.data?.accessToken ?? res.data?.token
//         if (newToken) {
//             localStorage.setItem('token', newToken)
//             return newToken
//         }
//         return null
//     } catch {
//         return null
//     }
// }

// // ─── Component ───────────────────────────────────────────────────────────────

// function MentorshipsPage() {
//     const { t, language } = useApp()
//     const router = useRouter()

//     const [mentors, setMentors] = useState<Mentor[]>([])
//     const [loading, setLoading] = useState(true)
//     const [searchQuery, setSearchQuery] = useState('')
//     const [selectedField, setSelectedField] = useState('all')

//     const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
//     const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

//     const [availableSlots, setAvailableSlots] = useState<ApiSlot[]>([])
//     const [topics, setTopics] = useState<ApiTopic[]>([])
//     const [slotsLoading, setSlotsLoading] = useState(false)
//     const [topicsLoading, setTopicsLoading] = useState(false)

//     const [selectedSlotId, setSelectedSlotId] = useState<number | ''>('')
//     const [selectedTopicId, setSelectedTopicId] = useState<number | ''>('')

//     const [bookingLoading, setBookingLoading] = useState(false)
//     const [bookingError, setBookingError] = useState<string | null>(null)

//     const [detailLoading, setDetailLoading] = useState(false)
//     const [sidebarOpen, setSidebarOpen] = useState(false)

//     const fetchMentorDetail = async (mentorId: number, token?: string) => {
//         try {
//             setDetailLoading(true)
//             const tk = token ?? localStorage.getItem('token')
//             const res = await api.get(`/Student/Mentorships/view/details/mentor/${mentorId}`, {
//                 headers: { Authorization: `Bearer ${tk}` }
//             })
//             const raw: ApiMentorDetail | null = res.data?.data ?? res.data?.Data ?? null
//             if (raw) {
//                 setSelectedMentor(mapApiMentorDetail(raw))
//             }
//         } catch (err: any) {
//             if (err.response?.status === 401) {
//                 const newToken = await refreshAccessToken()
//                 if (newToken) {
//                     fetchMentorDetail(mentorId, newToken)
//                 } else {
//                     router.push('/login')
//                 }
//                 return
//             }
//             console.warn('[fetchMentorDetail] failed:', err)
//         } finally {
//             setDetailLoading(false)
//         }
//     }

//     const fetchMentors = async (token?: string) => {
//         try {
//             setLoading(true)
//             const tk = token ?? localStorage.getItem('token')
            
//             const res = await api.get('/Student/Mentorships', {
//                 headers: { Authorization: `Bearer ${tk}` }
//             })
            
//             const raw: ApiMentor[] | null = res.data?.data ?? res.data?.Data ?? null
//             setMentors(raw ? raw.map(mapApiMentor) : [])
//         } catch (err: any) {
//             if (err.response?.status === 401) {
//                 const newToken = await refreshAccessToken()
//                 if (newToken) {
//                     fetchMentors(newToken)
//                 } else {
//                     router.push('/login')
//                 }
//                 return
//             }
//             console.warn('[fetchMentors] API failed, falling back to mockMentors:', err)
//             setMentors(mockMentors)
//         } finally {
//             setLoading(false)
//         }
//     }
 
//     useEffect(() => {
//         fetchMentors()
//     }, [])

//     useEffect(() => {
//         if (mentors.length === 0) return
//         const params = new URLSearchParams(window.location.search)
//         const mentorIdParam = params.get('mentorId')
//         if (mentorIdParam) {
//             const mentor = mentors.find(m => m.id === Number(mentorIdParam))
//             if (mentor) {
//                 setSelectedMentor(mentor)
//                 if (mentor.isAvailable) {
//                     handleOpenBookingModal(mentor)
//                 }
//             }
//         }
//     }, [mentors])

//     const handleOpenBookingModal = async (mentor: Mentor) => {
//         setSelectedMentor(mentor)
//         setIsBookingModalOpen(true)
//         setSelectedSlotId('')
//         setSelectedTopicId('')
//         setBookingError(null)

//         const token = localStorage.getItem('token')
//         setSlotsLoading(true)
//         api.get(`/Student/Mentorships/mentors/available-slots/${mentor.id}`, {
//             headers: { Authorization: `Bearer ${token}` }
//         })
//             .then(res => {
//                 setAvailableSlots(res.data?.data ?? res.data?.Data ?? [])
//             })
//             .catch(err => {
//                 if (err.response?.status === 404) {
//                     setAvailableSlots([])
//                 } else {
//                     console.warn('[fetchSlots] failed:', err)
//                     setAvailableSlots([])
//                 }
//             })
//             .finally(() => setSlotsLoading(false))

//         setTopicsLoading(true)
//         api.get('/Student/Mentorships/session/topic', {
//             headers: { Authorization: `Bearer ${token}` }
//         })
//             .then(res => {
//                 setTopics(res.data?.data ?? res.data?.Data ?? [])  
//             })
//             .catch(err => {
//                 console.warn('[fetchTopics] failed:', err)
//                 setTopics([])
//             })
//             .finally(() => setTopicsLoading(false))
//     }

//     const handleConfirmBooking = async () => {
//         if (selectedSlotId === 0 || selectedTopicId === 0) {
//             setBookingError(t.selectSlotAndTopic ?? 'Please select a time slot and a topic.')
//             return
//         }

//         setBookingLoading(true)
//         setBookingError(null)

//         const token = localStorage.getItem('token')

//         try {
//             await api.post(
//                 '/Student/Mentorships/mentors/Session/book',
//                 { slotId: selectedSlotId, topicId: selectedTopicId },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             )

//             setIsBookingModalOpen(false)
//             setSelectedSlotId('')
//             setSelectedTopicId('')
//             toast.success(`${t.bookingSuccess ?? 'Booking confirmed with'} ${selectedMentor?.name}!`)

//         } catch (err: any) {
//             if (err.response?.status === 401) {
//                 const newToken = await refreshAccessToken()
//                 if (newToken) {
//                     try {
//                         await api.post(
//                             '/Student/Mentorships/mentors/Session/book',
//                             { slotId: selectedSlotId, topicId: selectedTopicId },
//                             { headers: { Authorization: `Bearer ${newToken}` } }
//                         )
//                         setIsBookingModalOpen(false)
//                         setSelectedSlotId('')
//                         setSelectedTopicId('')
//                         toast.success(`${t.bookingSuccess ?? 'Booking confirmed with'} ${selectedMentor?.name}!`)
//                         return
//                     } catch (retryErr: any) {
//                         setBookingError(retryErr.response?.data ?? 'Booking failed. Please try again.')
//                     }
//                 } else {
//                     router.push('/login')
//                 }
//                 return
//             }

//             const msg =
//                 typeof err.response?.data === 'string'
//                     ? err.response.data
//                     : err.response?.data?.message ?? 'Booking failed. Please try again.'
//             setBookingError(msg)
//         } finally {
//             setBookingLoading(false)
//         }
//     }

//     const filteredMentors = mentors.filter(mentor => {
//         const matchesSearch =
//             mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

//         let matchesField = true
//         if (selectedField !== 'all') {
//             const expertiseStr = mentor.expertise.join(' ').toLowerCase()
//             const titleStr = mentor.title.toLowerCase()

//             switch (selectedField) {
//                 case 'software':
//                     matchesField = expertiseStr.includes('react') || expertiseStr.includes('node') ||
//                         expertiseStr.includes('system') || titleStr.includes('software')
//                     break
//                 case 'data':
//                     matchesField = expertiseStr.includes('data') || expertiseStr.includes('python') ||
//                         titleStr.includes('data')
//                     break
//                 case 'ai':
//                     matchesField = expertiseStr.includes('ai') || expertiseStr.includes('machine') ||
//                         expertiseStr.includes('learning') || expertiseStr.includes('deep') ||
//                         expertiseStr.includes('nlp') || titleStr.includes('ai')
//                     break
//                 case 'design':
//                     matchesField = expertiseStr.includes('design') || expertiseStr.includes('figma') ||
//                         expertiseStr.includes('ux') || titleStr.includes('design')
//                     break
//             }
//         }

//         return matchesSearch && matchesField
//     })

//     if (loading) {
//         return <LoadingScreen />
//     }

//     return (
//         <div className={styles.appLayout}>
//             <div className={styles.glow} aria-hidden="true" />
//             <div className={styles.glowSecondary} aria-hidden="true" />
//             <div className={styles.glowTertiary} aria-hidden="true" />

//             <div
//                 className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
//                 onClick={() => setSidebarOpen(false)}
//             />

//             <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
//                 <div className={styles.logoSection}>
//                     <div
//                         className={styles.backButton}
//                         onClick={() => {
//                             if (selectedMentor) {
//                                 setSelectedMentor(null)
//                             } else {
//                                 router.push('/student/dashboard')
//                             }
//                         }}
//                         role="button"
//                         title={selectedMentor ? 'Back to Mentors List' : 'Back to Dashboard'}
//                     >
//                         <ChevronLeft size={20} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
//                     </div>
//                     <div className={styles.logo}>
//                         <div className={styles.logoIcon}>IW</div>
//                         <span className={styles.logoText}>InternWay</span>
//                     </div>
//                 </div>

//                 <nav className={styles.nav}>
//                     <Link href="/student/dashboard" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <LayoutDashboard size={20} />
//                         <span>{t.dashboard}</span>
//                     </Link>
//                     <Link href="/student/internships" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <Briefcase size={20} />
//                         <span>{t.internships}</span>
//                     </Link>
//                     <Link href="/student/mentorships" className={`${styles.navItem} ${styles.active}`} onClick={() => setSidebarOpen(false)}>
//                         <Users size={20} />
//                         <span>{t.mentorships}</span>
//                     </Link>
//                     <Link href="/student/sessions" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <Video size={20} />
//                         <span>{t.mySessions}</span>
//                     </Link>
//                     <Link href="/student/profile" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
//                         <UserCircle size={20} />
//                         <span>{t.profile}</span>
//                     </Link>
//                 </nav>
//             </aside>

//             <main className={styles.mainContent}>
//                 <header className={styles.topBar}>
//                     <div className={styles.pageHeader}>
//                         {selectedMentor ? (
//                             <div className={styles.detailBreadcrumb} onClick={() => setSelectedMentor(null)} role="button">
//                                 <ChevronLeft size={20} className={styles.breadcrumbBackIcon} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
//                                 <span className={styles.breadcrumbText}>{t.back}</span>
//                             </div>
//                         ) : (
//                             <>
//                                 <h1 className={styles.pageTitle}>{t.findMentor}</h1>
//                                 <p className={styles.pageSubtitle}>{t.connectWithProfessionals}</p>
//                             </>
//                         )}
//                     </div>
                    
//                     <div className={styles.headerActions}>
//                         <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
//                             {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
//                         </button>
//                         <TopBarControls />
//                     </div>
//                 </header>

//                 {selectedMentor ? (
//                     <div className={styles.detailContainer}>
//                         <div className={styles.detailHeaderCard}>
//                             <div className={styles.detailHeaderLeft}>
//                                 <div className={styles.detailAvatar}>
//                                     <UserCircle size={80} />
//                                 </div>
//                                 <div className={styles.detailHeaderInfo}>
//                                     <h2 className={styles.detailName}>{selectedMentor.name}</h2>
//                                     <p className={styles.detailTitle}>{selectedMentor.title}</p>
//                                     <div className={styles.detailMeta}>
//                                         <div className={styles.detailMetaItem}>
//                                             <Star size={16} fill="#fbbf24" color="#fbbf24" />
//                                             <span className={styles.rating}>{selectedMentor.rating}</span>
//                                             <span className={styles.metaText}>({selectedMentor.reviews} {t.reviews})</span>
//                                         </div>
//                                         <span className={styles.metaDivider}>|</span>
//                                         <div className={styles.detailMetaItem}>
//                                             <Briefcase size={16} className={styles.metaIcon} />
//                                             <span className={styles.metaText}>{selectedMentor.experience} {t.years}</span>
//                                         </div>
//                                         <span className={styles.metaDivider}>|</span>
//                                         <div className={styles.detailMetaItem}>
//                                             <Calendar size={16} className={styles.metaIcon} />
//                                             <span className={styles.metaText}>{selectedMentor.field || selectedMentor.title}</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className={styles.detailHeaderRight}>
//                                 {selectedMentor.isAvailable ? (
//                                     <button
//                                         className={styles.detailBookButton}
//                                         onClick={() => handleOpenBookingModal(selectedMentor)}
//                                     >
//                                         {t.bookSession}
//                                     </button>
//                                 ) : (
//                                     <button className={styles.detailUnavailableButton} disabled>
//                                         {t.unavailable}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         <div className={styles.detailBody}>
//                             <div className={styles.detailMainContent}>
//                                 <div className={styles.detailSection}>
//                                     <h3 className={styles.detailSectionTitle}>{t.about}</h3>
//                                     <p className={styles.detailLongBio}>
//                                         {selectedMentor.longBio || selectedMentor.bio}
//                                     </p>
//                                 </div>

//                                 <div className={styles.detailSection}>
//                                     <h3 className={styles.detailSectionTitle}>{t.expertise}</h3>
//                                     <div className={styles.detailExpertiseTags}>
//                                         {selectedMentor.expertise.map((skill, index) => (
//                                             <span key={index} className={styles.detailExpertiseTag}>
//                                                 {skill}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {selectedMentor.experiencesList && selectedMentor.experiencesList.length > 0 && (
//                                     <div className={styles.detailSection}>
//                                         <h3 className={styles.detailSectionTitle}>{(t as any).experience ?? 'Experience'}</h3>
//                                         <div className={styles.detailExpertiseTags}>
//                                             {selectedMentor.experiencesList.map((exp, index) => (
//                                                 <span key={index} className={styles.detailExpertiseTag}>
//                                                     {exp}
//                                                 </span>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className={styles.detailSidebar}>
//                                 <div className={styles.statsCard}>
//                                     <h3 className={styles.statsCardTitle}>
//                                         <Users size={18} className={styles.statsIcon} />
//                                         {t.mentorStats}
//                                     </h3>
//                                     <div className={styles.statsList}>
//                                         <div className={styles.statsItem}>
//                                             <span className={styles.statsLabel}>{t.totalSessions}</span>
//                                             <span className={styles.statsValue}>
//                                                 {selectedMentor.stats?.totalSessions ?? '—'}
//                                             </span>
//                                         </div>
//                                         <div className={styles.statsItem}>
//                                             <span className={styles.statsLabel}>{t.menteesHired}</span>
//                                             <span className={styles.statsValue}>
//                                                 {selectedMentor.stats?.menteesHired ?? '—'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     <>
//                         <div className={styles.searchFilterSection}>
//                             <div className={styles.searchBarWrapper}>
//                                 <Search className={styles.searchIcon} size={20} />
//                                 <input
//                                     type="text"
//                                     placeholder={t.searchMentors}
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     className={styles.searchBar}
//                                 />
//                             </div>
//                             <select
//                                 value={selectedField}
//                                 onChange={(e) => setSelectedField(e.target.value)}
//                                 className={styles.filterDropdown}
//                                 aria-label="Filter by field"
//                             >
//                                 <option value="all">{t.allFields}</option>
//                                 <option value="software">Software Engineering</option>
//                                 <option value="data">Data Science</option>
//                                 <option value="ai">AI & ML</option>
//                                 <option value="design">Design</option>
//                             </select>
//                         </div>

//                         <div className={styles.mentorsGrid}>
//                             {filteredMentors.length > 0 ? (
//                                 filteredMentors.map((mentor) => (
//                                     <div
//                                         key={mentor.id}
//                                         className={styles.mentorCardHorizontal}
//                                         onClick={() => fetchMentorDetail(mentor.id)}
//                                     >
//                                         <div className={styles.mentorAvatarLarge}>
//                                             <UserCircle size={64} />
//                                         </div>
//                                         <div className={styles.mentorDetails}>
//                                             <div className={styles.mentorHeader}>
//                                                 <h3 className={styles.mentorName}>{mentor.name}</h3>
//                                                 <p className={styles.mentorField}>{mentor.title}</p>
//                                             </div>
//                                             <div className={styles.mentorMeta}>
//                                                 <Star size={14} fill="#fbbf24" color="#fbbf24" />
//                                                 <span className={styles.rating}>{mentor.rating}</span>
//                                                 <span className={styles.metaText}>({mentor.reviews} {t.reviews}) • {mentor.experience}+ {t.years}</span>
//                                             </div>
//                                             <p className={styles.mentorBio}>{mentor.bio}</p>
//                                             <div className={styles.expertiseBadges}>
//                                                 <span className={styles.expertiseLabel}>{t.expertise}:</span>
//                                                 {mentor.expertise.map((skill, index) => (
//                                                     <span key={index} className={styles.expertiseBadge}>
//                                                         {skill}
//                                                     </span>
//                                                 ))}
//                                             </div>
//                                             {mentor.nextAvailable && (
//                                                 <div className={styles.availabilitySection}>
//                                                     <Calendar size={14} />
//                                                     <span className={styles.availabilityLabel}>{t.nextAvailable}:</span>
//                                                     <span className={styles.availabilityTime}>{mentor.nextAvailable.date} {mentor.nextAvailable.time}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
//                                             {mentor.isAvailable ? (
//                                                 <button
//                                                     className={styles.bookButton}
//                                                     onClick={() => handleOpenBookingModal(mentor)}
//                                                 >
//                                                     {t.bookSession}
//                                                 </button>
//                                             ) : (
//                                                 <button className={styles.unavailableButton} disabled>
//                                                     {t.unavailable}
//                                                 </button>
//                                             )}
//                                             <button
//                                                 className={styles.viewDetailsButton}
//                                                 onClick={() => fetchMentorDetail(mentor.id)}
//                                                 title="View Profile"
//                                             >
//                                                 <Eye size={18} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className={styles.emptyMessage}>
//                                     {t.noMentorsFound}
//                                 </div>
//                             )}
//                         </div>
//                     </>
//                 )}
//             </main>

//             {/* ── Booking Modal ──────────────────────────────────────────────── */}
//             {isBookingModalOpen && selectedMentor && (
//                 <div className={styles.modalOverlay} onClick={() => setIsBookingModalOpen(false)}>
//                     <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
//                         <div className={styles.modalHeader}>
//                             <h3 className={styles.modalTitle}>
//                                 {t.bookSessionWith} {selectedMentor.name}
//                             </h3>
//                             <button
//                                 className={styles.modalCloseBtn}
//                                 onClick={() => setIsBookingModalOpen(false)}
//                                 aria-label="Close modal"
//                             >
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         <div className={styles.modalBody}>
//                             <p className={styles.modalSubtext}>
//                                 Select a preferred time slot and topic for your mentorship session.
//                             </p>

//                             <div className={styles.formGroup}>
//                                 <label htmlFor="timeSlot" className={styles.formLabel}>
//                                     {t.selectTimeSlot}
//                                 </label>
//                                 {slotsLoading ? (
//                                     <select id="timeSlot" className={styles.formSelect} disabled title="Loading slots">
//                                         <option>Loading slots…</option>
//                                     </select>
//                                 ) : (
//                                     <select
//                                         id="timeSlot"
//                                         value={selectedSlotId}
//                                         onChange={(e) => setSelectedSlotId(Number(e.target.value))}
//                                         className={styles.formSelect}
//                                     >
//                                         <option value="">{t.chooseTime ?? 'Choose a time…'}</option>
//                                         {availableSlots.length > 0 ? (
//                                             availableSlots.map((slot) => (
//                                                 <option key={slot.slotId} value={slot.slotId}>
//                                                     {slot.date}
//                                                 </option>
//                                             ))
//                                         ) : (
//                                             <option value="" disabled>No available slots</option>
//                                         )}
//                                     </select>
//                                 )}
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label htmlFor="sessionTopic" className={styles.formLabel}>
//                                     {t.sessionTopic}
//                                 </label>
//                                 {topicsLoading ? (
//                                     <select id="sessionTopic" className={styles.formSelect} disabled title="Loading topics">
//                                         <option>Loading topics…</option>
//                                     </select>
//                                 ) : (
//                                     <select
//                                         id="sessionTopic"
//                                         value={selectedTopicId}
//                                         onChange={(e) => setSelectedTopicId(Number(e.target.value))}
//                                         className={styles.formSelect}
//                                     >
//                                         <option value="">{t.whatDiscuss ?? 'What would you like to discuss?'}</option>
//                                         {topics.map((topic) => (
//                                             <option key={topic.id} value={topic.id}>
//                                                 {topic.title}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}
//                             </div>

//                             {bookingError && (
//                                 <p className={styles.errorMessage}>
//                                     {bookingError}
//                                 </p>
//                             )}
//                         </div>

//                         <div className={styles.modalFooter}>
//                             <button
//                                 className={styles.cancelBtn}
//                                 onClick={() => setIsBookingModalOpen(false)}
//                                 disabled={bookingLoading}
//                             >
//                                 {t.cancel}
//                             </button>
//                             <button
//                                 className={styles.confirmBtn}
//                                 onClick={handleConfirmBooking}
//                                 disabled={bookingLoading || slotsLoading || topicsLoading}
//                             >
//                                 {bookingLoading ? 'Booking…' : t.confirmBooking}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default MentorshipsPage





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
    Star,
    Search,
    Calendar,
    Eye,
    Menu,
    X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import styles from './MentorshipsStyle.module.css'
import api from '../../lib/api'
import { toast } from '../../lib/toast'

// ─── Types matching the API response exactly ────────────────────────────────

interface ApiMentor {
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

interface ApiSlot {
    slotId: number
    date: string
}

interface ApiTopic {
    id: number
    title: string
}

interface Mentor {
    id: number
    name: string
    title: string
    expertise: string[]
    experience: number
    rating: number
    reviews: number
    bio: string
    nextAvailable?: {
        date: string
        time: string
    }
    isAvailable: boolean
    longBio?: string
    stats?: {
        totalSessions: number
        menteesHired: number
    }
    experiencesList?: string[]
    field?: string
    availableSlots?: ApiSlot[]
}

interface ApiMentorDetail {
    mentorId: number
    mentorName: string
    jobTitle: string | null
    yearsExperience: number
    avgRating: number
    countReviewers: number
    description: string | null
    skills: string[] | null
    experiences: string[] | null
    totalSessions: number
    numMenteesHired: number
    isAvailable: boolean
}

function mapApiMentorDetail(m: ApiMentorDetail): Mentor {
    return {
        id: m.mentorId,
        name: m.mentorName,
        title: m.jobTitle ?? '',
        expertise: m.skills ?? [],
        experience: m.yearsExperience ?? 0,
        rating: m.avgRating,
        reviews: m.countReviewers,
        bio: m.description ?? '',
        longBio: m.description ?? '',
        isAvailable: m.isAvailable,
        field: m.jobTitle ?? '',
        experiencesList: m.experiences ?? [],
        stats: {
            totalSessions: m.totalSessions ?? 0,
            menteesHired: m.numMenteesHired ?? 0
        }
    }
}

function mapApiMentor(m: ApiMentor): Mentor {
    let nextAvailable: Mentor['nextAvailable'] | undefined
    if (m.upcomingAvailability) {
        const parts = m.upcomingAvailability.split(',')
        if (parts.length >= 2) {
            nextAvailable = {
                date: parts[0].trim(),
                time: parts[1].trim()
            }
        } else {
            nextAvailable = { date: m.upcomingAvailability, time: '' }
        }
    }

    return {
        id: m.mentorId,
        name: m.mentorName,
        title: m.jobTitle ?? '',
        expertise: m.skills ?? [],
        experience: m.yearsExperience ?? 0,
        rating: m.avgRating,
        reviews: m.countReviewers,
        bio: m.description ?? '',
        longBio: m.description ?? '',
        isAvailable: m.isAvailable,
        nextAvailable,
        field: m.jobTitle ?? ''
    }
}

const mockMentors: Mentor[] = [
    {
        id: 1,
        name: 'Dr. Ahmed Hassan',
        title: 'Senior Software Engineer',
        expertise: ['React', 'Node.js', 'System Design', 'Career Growth'],
        experience: 15,
        rating: 4.9,
        reviews: 127,
        bio: 'Passionate about mentoring young developers and helping them navigate their career paths.',
        longBio: 'Passionate about mentoring young developers and helping them navigate their career paths. I have over 15 years of experience building scalable web applications and leading engineering teams at top tech companies.',
        stats: { totalSessions: 342, menteesHired: 45 },
        field: 'Software Engineering',
        availableSlots: [],
        nextAvailable: { date: 'Tomorrow', time: '3PM' },
        isAvailable: true
    },
    {
        id: 2,
        name: 'Eng. Sara Mohamed',
        title: 'Lead Data Scientist',
        expertise: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
        experience: 10,
        rating: 4.8,
        reviews: 89,
        bio: 'Helping aspiring data scientists break into the field with practical guidance.',
        longBio: 'Helping aspiring data scientists break into the field with practical guidance.',
        stats: { totalSessions: 210, menteesHired: 28 },
        field: 'Data Science',
        availableSlots: [],
        nextAvailable: { date: 'Dec 28', time: '10AM' },
        isAvailable: true
    },
    {
        id: 3,
        name: 'Prof. Karim Ali',
        title: 'AI Research Director',
        expertise: ['Deep Learning', 'NLP', 'Computer Vision', 'Research'],
        experience: 12,
        rating: 4.7,
        reviews: 156,
        bio: 'Research-focused mentor specializing in cutting-edge AI technologies.',
        longBio: 'Research-focused mentor specializing in cutting-edge AI technologies.',
        stats: { totalSessions: 180, menteesHired: 15 },
        field: 'AI & ML',
        availableSlots: [],
        isAvailable: false
    },
    {
        id: 4,
        name: 'Eng. Nour Khaled',
        title: 'UX/UI Design Lead',
        expertise: ['Figma', 'User Research', 'Design Systems', 'Portfolio'],
        experience: 8,
        rating: 4.9,
        reviews: 189,
        bio: 'Helping designers build stunning portfolios and land their dream jobs.',
        longBio: 'Helping designers build stunning portfolios and land their dream jobs.',
        stats: { totalSessions: 295, menteesHired: 38 },
        field: 'Design',
        availableSlots: [],
        nextAvailable: { date: 'Dec 27', time: '2PM' },
        isAvailable: true
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

function MentorshipsPage() {
    const { t, language } = useApp()
    const router = useRouter()

    const [mentors, setMentors] = useState<Mentor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedField, setSelectedField] = useState('all')

    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

    const [availableSlots, setAvailableSlots] = useState<ApiSlot[]>([])
    const [topics, setTopics] = useState<ApiTopic[]>([])
    const [slotsLoading, setSlotsLoading] = useState(false)
    const [topicsLoading, setTopicsLoading] = useState(false)

    // ✅ FIX: initial value is '' not 0
    const [selectedSlotId, setSelectedSlotId] = useState<number | ''>('')
    const [selectedTopicId, setSelectedTopicId] = useState<number | ''>('')

    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingError, setBookingError] = useState<string | null>(null)

    const [detailLoading, setDetailLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // ✅ FIX: fetchMentorDetail only sets selectedMentor — does NOT open booking modal
    const fetchMentorDetail = async (mentorId: number, token?: string) => {
        try {
            setDetailLoading(true)
            const tk = token ?? localStorage.getItem('token')
            const res = await api.get(`/Student/Mentorships/view/details/mentor/${mentorId}`, {
                headers: { Authorization: `Bearer ${tk}` }
            })
            const raw: ApiMentorDetail | null = res.data?.data ?? res.data?.Data ?? null
            if (raw) {
                setSelectedMentor(mapApiMentorDetail(raw))
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) {
                    fetchMentorDetail(mentorId, newToken)
                } else {
                    router.push('/login')
                }
                return
            }
            console.warn('[fetchMentorDetail] failed:', err)
        } finally {
            setDetailLoading(false)
        }
    }

    const fetchMentors = async (token?: string) => {
        try {
            setLoading(true)
            const tk = token ?? localStorage.getItem('token')
            const res = await api.get('/Student/Mentorships', {
                headers: { Authorization: `Bearer ${tk}` }
            })
            const raw: ApiMentor[] | null = res.data?.data ?? res.data?.Data ?? null
            setMentors(raw ? raw.map(mapApiMentor) : [])
        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) {
                    fetchMentors(newToken)
                } else {
                    router.push('/login')
                }
                return
            }
            console.warn('[fetchMentors] API failed, falling back to mockMentors:', err)
            setMentors(mockMentors)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMentors()
    }, [])

    useEffect(() => {
        if (mentors.length === 0) return
        const params = new URLSearchParams(window.location.search)
        const mentorIdParam = params.get('mentorId')
        if (mentorIdParam) {
            const mentor = mentors.find(m => m.id === Number(mentorIdParam))
            if (mentor) {
                setSelectedMentor(mentor)
                if (mentor.isAvailable) {
                    handleOpenBookingModal(mentor)
                }
            }
        }
    }, [mentors])

    // ✅ FIX: handleOpenBookingModal takes the mentor directly — no fromCard flag needed
    const handleOpenBookingModal = async (mentor: Mentor) => {
        setIsBookingModalOpen(true)
        setSelectedSlotId('')
        setSelectedTopicId('')
        setBookingError(null)

        const token = localStorage.getItem('token')

        setSlotsLoading(true)
        api.get(`/Student/Mentorships/mentors/available-slots/${mentor.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setAvailableSlots(res.data?.data ?? res.data?.Data ?? [])
            })
            .catch(err => {
                if (err.response?.status === 404) {
                    setAvailableSlots([])
                } else {
                    console.warn('[fetchSlots] failed:', err)
                    setAvailableSlots([])
                }
            })
            .finally(() => setSlotsLoading(false))

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

    const handleConfirmBooking = async () => {
        // ✅ FIX: check against '' not 0
        if (selectedSlotId === '' || selectedTopicId === '') {
            setBookingError(t.selectSlotAndTopic ?? 'Please select a time slot and a topic.')
            return
        }

        setBookingLoading(true)
        setBookingError(null)

        const token = localStorage.getItem('token')

        try {
            await api.post(
                '/Student/Mentorships/mentors/Session/book',
                { slotId: selectedSlotId, topicId: selectedTopicId },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setIsBookingModalOpen(false)
            setSelectedSlotId('')
            setSelectedTopicId('')
            toast.success(`${t.bookingSuccess ?? 'Booking confirmed with'} ${selectedMentor?.name}!`)

        } catch (err: any) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken()
                if (newToken) {
                    try {
                        await api.post(
                            '/Student/Mentorships/mentors/Session/book',
                            { slotId: selectedSlotId, topicId: selectedTopicId },
                            { headers: { Authorization: `Bearer ${newToken}` } }
                        )
                        setIsBookingModalOpen(false)
                        setSelectedSlotId('')
                        setSelectedTopicId('')
                        toast.success(`${t.bookingSuccess ?? 'Booking confirmed with'} ${selectedMentor?.name}!`)
                        return
                    } catch (retryErr: any) {
                        setBookingError(retryErr.response?.data ?? 'Booking failed. Please try again.')
                    }
                } else {
                    router.push('/login')
                }
                return
            }

            const msg =
                typeof err.response?.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message ?? 'Booking failed. Please try again.'
            setBookingError(msg)
        } finally {
            setBookingLoading(false)
        }
    }

    const filteredMentors = mentors.filter(mentor => {
        const matchesSearch =
            mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

        let matchesField = true
        if (selectedField !== 'all') {
            const expertiseStr = mentor.expertise.join(' ').toLowerCase()
            const titleStr = mentor.title.toLowerCase()

            switch (selectedField) {
                case 'software':
                    matchesField = expertiseStr.includes('react') || expertiseStr.includes('node') ||
                        expertiseStr.includes('system') || titleStr.includes('software')
                    break
                case 'data':
                    matchesField = expertiseStr.includes('data') || expertiseStr.includes('python') ||
                        titleStr.includes('data')
                    break
                case 'ai':
                    matchesField = expertiseStr.includes('ai') || expertiseStr.includes('machine') ||
                        expertiseStr.includes('learning') || expertiseStr.includes('deep') ||
                        expertiseStr.includes('nlp') || titleStr.includes('ai')
                    break
                case 'design':
                    matchesField = expertiseStr.includes('design') || expertiseStr.includes('figma') ||
                        expertiseStr.includes('ux') || titleStr.includes('design')
                    break
            }
        }

        return matchesSearch && matchesField
    })

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
                        onClick={() => {
                            if (selectedMentor) {
                                setSelectedMentor(null)
                            } else {
                                router.push('/student/dashboard')
                            }
                        }}
                        role="button"
                        title={selectedMentor ? 'Back to Mentors List' : 'Back to Dashboard'}
                    >
                        <ChevronLeft size={20} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
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
                    <Link href="/student/mentorships" className={`${styles.navItem} ${styles.active}`} onClick={() => setSidebarOpen(false)}>
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

            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <div className={styles.pageHeader}>
                        {selectedMentor ? (
                            <div className={styles.detailBreadcrumb} onClick={() => setSelectedMentor(null)} role="button">
                                <ChevronLeft size={20} className={styles.breadcrumbBackIcon} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                                <span className={styles.breadcrumbText}>{t.back}</span>
                            </div>
                        ) : (
                            <>
                                <h1 className={styles.pageTitle}>{t.findMentor}</h1>
                                <p className={styles.pageSubtitle}>{t.connectWithProfessionals}</p>
                            </>
                        )}
                    </div>

                    <div className={styles.headerActions}>
                        <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <TopBarControls />
                    </div>
                </header>

                {selectedMentor ? (
                    <div className={styles.detailContainer}>
                        <div className={styles.detailHeaderCard}>
                            <div className={styles.detailHeaderLeft}>
                                <div className={styles.detailAvatar}>
                                    <UserCircle size={80} />
                                </div>
                                <div className={styles.detailHeaderInfo}>
                                    <h2 className={styles.detailName}>{selectedMentor.name}</h2>
                                    <p className={styles.detailTitle}>{selectedMentor.title}</p>
                                    <div className={styles.detailMeta}>
                                        <div className={styles.detailMetaItem}>
                                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                            <span className={styles.rating}>{selectedMentor.rating}</span>
                                            <span className={styles.metaText}>({selectedMentor.reviews} {t.reviews})</span>
                                        </div>
                                        <span className={styles.metaDivider}>|</span>
                                        <div className={styles.detailMetaItem}>
                                            <Briefcase size={16} className={styles.metaIcon} />
                                            <span className={styles.metaText}>{selectedMentor.experience} {t.years}</span>
                                        </div>
                                        <span className={styles.metaDivider}>|</span>
                                        <div className={styles.detailMetaItem}>
                                            <Calendar size={16} className={styles.metaIcon} />
                                            <span className={styles.metaText}>{selectedMentor.field || selectedMentor.title}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.detailHeaderRight}>
                                {selectedMentor.isAvailable ? (
                                    <button
                                        className={styles.detailBookButton}
                                        onClick={() => handleOpenBookingModal(selectedMentor)}
                                    >
                                        {t.bookSession}
                                    </button>
                                ) : (
                                    <button className={styles.detailUnavailableButton} disabled>
                                        {t.unavailable}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.detailBody}>
                            <div className={styles.detailMainContent}>
                                <div className={styles.detailSection}>
                                    <h3 className={styles.detailSectionTitle}>{t.about}</h3>
                                    <p className={styles.detailLongBio}>
                                        {selectedMentor.longBio || selectedMentor.bio}
                                    </p>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3 className={styles.detailSectionTitle}>{t.expertise}</h3>
                                    <div className={styles.detailExpertiseTags}>
                                        {selectedMentor.expertise.map((skill, index) => (
                                            <span key={index} className={styles.detailExpertiseTag}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedMentor.experiencesList && selectedMentor.experiencesList.length > 0 && (
                                    <div className={styles.detailSection}>
                                        <h3 className={styles.detailSectionTitle}>{(t as any).experience ?? 'Experience'}</h3>
                                        <div className={styles.detailExpertiseTags}>
                                            {selectedMentor.experiencesList.map((exp, index) => (
                                                <span key={index} className={styles.detailExpertiseTag}>
                                                    {exp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.detailSidebar}>
                                <div className={styles.statsCard}>
                                    <h3 className={styles.statsCardTitle}>
                                        <Users size={18} className={styles.statsIcon} />
                                        {t.mentorStats}
                                    </h3>
                                    <div className={styles.statsList}>
                                        <div className={styles.statsItem}>
                                            <span className={styles.statsLabel}>{t.totalSessions}</span>
                                            <span className={styles.statsValue}>
                                                {selectedMentor.stats?.totalSessions ?? '—'}
                                            </span>
                                        </div>
                                        <div className={styles.statsItem}>
                                            <span className={styles.statsLabel}>{t.menteesHired}</span>
                                            <span className={styles.statsValue}>
                                                {selectedMentor.stats?.menteesHired ?? '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.searchFilterSection}>
                            <div className={styles.searchBarWrapper}>
                                <Search className={styles.searchIcon} size={20} />
                                <input
                                    type="text"
                                    placeholder={t.searchMentors}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchBar}
                                />
                            </div>
                            <select
                                value={selectedField}
                                onChange={(e) => setSelectedField(e.target.value)}
                                className={styles.filterDropdown}
                                aria-label="Filter by field"
                            >
                                <option value="all">{t.allFields}</option>
                                <option value="software">Software Engineering</option>
                                <option value="data">Data Science</option>
                                <option value="ai">AI & ML</option>
                                <option value="design">Design</option>
                            </select>
                        </div>

                        <div className={styles.mentorsGrid}>
                            {filteredMentors.length > 0 ? (
                                filteredMentors.map((mentor) => (
                                    <div
                                        key={mentor.id}
                                        className={styles.mentorCardHorizontal}
                                        onClick={() => fetchMentorDetail(mentor.id)}
                                    >
                                        <div className={styles.mentorAvatarLarge}>
                                            <UserCircle size={64} />
                                        </div>
                                        <div className={styles.mentorDetails}>
                                            <div className={styles.mentorHeader}>
                                                <h3 className={styles.mentorName}>{mentor.name}</h3>
                                                <p className={styles.mentorField}>{mentor.title}</p>
                                            </div>
                                            <div className={styles.mentorMeta}>
                                                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                                <span className={styles.rating}>{mentor.rating}</span>
                                                <span className={styles.metaText}>({mentor.reviews} {t.reviews}) • {mentor.experience}+ {t.years}</span>
                                            </div>
                                            <p className={styles.mentorBio}>{mentor.bio}</p>
                                            <div className={styles.expertiseBadges}>
                                                <span className={styles.expertiseLabel}>{t.expertise}:</span>
                                                {mentor.expertise.map((skill, index) => (
                                                    <span key={index} className={styles.expertiseBadge}>
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            {mentor.nextAvailable && (
                                                <div className={styles.availabilitySection}>
                                                    <Calendar size={14} />
                                                    <span className={styles.availabilityLabel}>{t.nextAvailable}:</span>
                                                    <span className={styles.availabilityTime}>{mentor.nextAvailable.date} {mentor.nextAvailable.time}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                                            {mentor.isAvailable ? (
                                                <button
                                                    className={styles.bookButton}
                                                    onClick={() => {
                                                        setSelectedMentor(mentor)
                                                        handleOpenBookingModal(mentor)
                                                    }}
                                                >
                                                    {t.bookSession}
                                                </button>
                                            ) : (
                                                <button className={styles.unavailableButton} disabled>
                                                    {t.unavailable}
                                                </button>
                                            )}
                                            <button
                                                className={styles.viewDetailsButton}
                                                onClick={() => fetchMentorDetail(mentor.id)}
                                                title="View Profile"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyMessage}>
                                    {t.noMentorsFound}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* ── Booking Modal ──────────────────────────────────────────────── */}
            {isBookingModalOpen && selectedMentor && (
                <div className={styles.modalOverlay} onClick={() => setIsBookingModalOpen(false)}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {t.bookSessionWith} {selectedMentor.name}
                            </h3>
                            <button
                                className={styles.modalCloseBtn}
                                onClick={() => setIsBookingModalOpen(false)}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p className={styles.modalSubtext}>
                                Select a preferred time slot and topic for your mentorship session.
                            </p>

                            <div className={styles.formGroup}>
                                <label htmlFor="timeSlot" className={styles.formLabel}>
                                    {t.selectTimeSlot}
                                </label>
                                {slotsLoading ? (
                                    <select id="timeSlot" className={styles.formSelect} disabled title="Loading slots">
                                        <option>Loading slots…</option>
                                    </select>
                                ) : (
                                    <select
                                        id="timeSlot"
                                        value={selectedSlotId}
                                        onChange={(e) => setSelectedSlotId(Number(e.target.value))}
                                        className={styles.formSelect}
                                    >
                                        <option value="">{t.chooseTime ?? 'Choose a time…'}</option>
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map((slot) => (
                                                <option key={slot.slotId} value={slot.slotId}>
                                                    {slot.date}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No available slots</option>
                                        )}
                                    </select>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="sessionTopic" className={styles.formLabel}>
                                    {t.sessionTopic}
                                </label>
                                {topicsLoading ? (
                                    <select id="sessionTopic" className={styles.formSelect} disabled title="Loading topics">
                                        <option>Loading topics…</option>
                                    </select>
                                ) : (
                                    <select
                                        id="sessionTopic"
                                        value={selectedTopicId}
                                        onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                                        className={styles.formSelect}
                                    >
                                        <option value="">{t.whatDiscuss ?? 'What would you like to discuss?'}</option>
                                        {topics.map((topic) => (
                                            <option key={topic.id} value={topic.id}>
                                                {topic.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {bookingError && (
                                <p className={styles.errorMessage}>
                                    {bookingError}
                                </p>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setIsBookingModalOpen(false)}
                                disabled={bookingLoading}
                            >
                                {t.cancel}
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={handleConfirmBooking}
                                disabled={bookingLoading || slotsLoading || topicsLoading}
                            >
                                {bookingLoading ? 'Booking…' : t.confirmBooking}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MentorshipsPage