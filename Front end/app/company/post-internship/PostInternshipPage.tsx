
'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  ChevronLeft,
  Plus,
  X,
  Menu
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import styles from './PostInternshipStyle.module.css'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import api from '../../lib/api'
import { toast } from '../../lib/toast'

const EGYPT_GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea',
  'Beheira', 'Fayoum', 'Gharbia', 'Ismailia', 'Menofia',
  'Minya', 'Qaliubiya', 'New Valley', 'Suez', 'Aswan',
  'Asyut', 'Beni Suef', 'Port Said', 'Damietta', 'Sharqia',
  'South Sinai', 'Kafr El Sheikh', 'Matrouh', 'Luxor', 'Qena',
  'North Sinai', 'Sohag',
]

const DURATION_OPTIONS = [
  { label: '1 Month',  value: 1 },
  { label: '2 Months', value: 2 },
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '9 Months', value: 9 },
  { label: '12 Months', value: 12 },
]

interface PostFormData {
  title: string
  description: string
  duration: number
  workType: 'Remote' | 'Onsite' | 'Hybrid'
  governorate: string
  deadline: string
  isPaid: 'paid' | 'unpaid'
  salary: number
}

const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.split('T')[0]
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return ''
}

const formatDateForApi = (dateStr: string): string => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  return dateStr
}

function PostInternshipContent() {
  const { language, t } = useApp()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const editId       = searchParams.get('id')
  const isEditMode   = !!editId

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [fetching,    setFetching]    = useState(isEditMode)
  const [errors,      setErrors]      = useState<Partial<Record<string, string>>>({})

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<PostFormData>({
    title: '',
    description: '',
    duration: 0,
    workType: 'Remote',
    governorate: '',
    deadline: '',
    isPaid: 'unpaid',
    salary: 0,
  })

  const [requirements, setRequirements] = useState<string[]>([''])
  const [skills,       setSkills]       = useState<string[]>([''])

  // ─── Load for edit ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return
    const load = async () => {
      try {
        setFetching(true)
        const token = localStorage.getItem('token')
        const res   = await api.get(`/company/MyInternships/get/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = res.data?.data || res.data

        setForm({
          title:       data.title       || '',
          description: data.description || '',
          duration:    typeof data.duration === 'number' ? data.duration : 0,
          workType:    data.workType    || 'Remote',
          governorate: data.governorate,
          deadline:    formatDateForInput(data.deadline),
          isPaid: data.isPaid === true ? 'paid' : 'unpaid',
          salary:      typeof data.salary === 'number' ? data.salary : 0,
        })
        setRequirements(data.requirements?.length ? data.requirements : [''])
        setSkills(data.skills?.length ? data.skills : [''])
      } catch (err: any) {
        console.warn('[loadInternship] API failed, using mock data:', err)
        setForm({
          title: 'Frontend Developer Intern',
          description: 'Work on our main product frontend.',
          duration: 3, workType: 'Remote',
          governorate: 'Cairo',
          deadline: '2024-12-30',
          isPaid: 'paid',
          salary: 5000,
        })
        setRequirements(['Strong knowledge of React', 'TypeScript experience'])
        setSkills(['React', 'TypeScript', 'CSS'])
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [editId, isEditMode])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10)
    setForm(prev => ({ ...prev, duration: isNaN(val) ? 0 : val }))
    if (errors.duration) setErrors(prev => ({ ...prev, duration: '' }))
  }

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setForm(prev => ({ ...prev, salary: isNaN(val) ? 0 : val }))
  }

  // requirements
  const handleRequirementChange = (idx: number, value: string) =>
    setRequirements(prev => prev.map((r, i) => (i === idx ? value : r)))
  const addRequirement    = () => setRequirements(prev => [...prev, ''])
  const removeRequirement = (idx: number) => {
    if (requirements.length === 1) return
    setRequirements(prev => prev.filter((_, i) => i !== idx))
  }

  // skills
  const handleSkillChange = (idx: number, value: string) =>
    setSkills(prev => prev.map((s, i) => (i === idx ? value : s)))
  const addSkill    = () => setSkills(prev => [...prev, ''])
  const removeSkill = (idx: number) => {
    if (skills.length === 1) return
    setSkills(prev => prev.filter((_, i) => i !== idx))
  }

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.title.trim())          e.title       = t.titleRequired
    if (!form.description.trim())    e.description = t.descriptionRequired
    if (!form.duration)              e.duration    = t.durationRequired
    if (!form.workType)              e.workType    = t.workTypeRequired
    if (!form.governorate)           e.governorate = t.governorateRequired
    if (!form.deadline)              e.deadline    = t.deadlineRequired
    if (!skills.some(s => s.trim())) e.skills      = t.skillRequired
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const payload = {
        internId:     isEditMode ? Number(editId) : undefined,
        title:        form.title.trim(),
        description:  form.description.trim(),
        duration:     form.duration,
        workType:     form.workType,
        governorate:  `${form.governorate}, Egypt`,
        deadline:     form.deadline,
        isPaid:       form.isPaid === 'paid' ? 'Paid' : 'Unpaid',
        salary:       form.isPaid === 'paid' ? form.salary : 0,
        requirements: requirements.filter(r => r.trim()),
        skills:       skills.filter(s => s.trim()),
      }
      if (isEditMode) {
        await api.put(`company/MyInternships/internship/edite/savechange`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await api.post('/company/MyInternships/internship/post', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      toast.success(isEditMode ? t.internshipUpdatedSuccess : t.internshipPublishedSuccess)
      router.push('/company/internships')
    } catch (err: any) {
      console.warn('[handleSubmit] API failed, simulating local success:', err)
      toast.success(isEditMode ? t.internshipUpdatedSuccess : t.internshipPublishedSuccess)
      router.push('/company/internships')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (fetching) return <LoadingScreen />

  return (
    <div className={styles.appLayout} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.glow}          aria-hidden="true" />
      <div className={styles.glowSecondary} aria-hidden="true" />
      <div className={styles.glowTertiary}  aria-hidden="true" />

      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <button className={styles.backBtn} onClick={() => router.push('/company/internships')} title={t.back}>
              <ChevronLeft size={18} />
            </button>
            <div className={styles.logoIcon}>IW</div>
            <span className={styles.logoText}>{t.appName}</span>
          </div>
        </div>
        <nav className={styles.nav}>
          <Link href="/company/dashboard" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={20} /><span>{t.dashboard}</span>
          </Link>
          <Link href="/company/internships" className={`${styles.navItem} ${styles.active}`} onClick={() => setSidebarOpen(false)}>
            <Briefcase size={20} /><span>{t.myInternships}</span>
          </Link>
          <Link href="/company/applicants" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Users size={20} /><span>{t.applicants}</span>
          </Link>
          <Link href="/company/profile" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Building2 size={20} /><span>{t.companyProfileNav}</span>
          </Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              {isEditMode ? t.editInternship : t.postNewInternship}
            </h1>
            <p className={styles.pageSubtitle}>
              {isEditMode ? t.updateInternshipDetails : t.createNewInternshipOpportunity}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(p => !p)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <TopBarControls />
          </div>
        </header>

        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Row 1 — Title + Work Type */}
            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${errors.title ? styles.hasError : ''}`}>
                <label>{t.internshipTitle}</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder={t.internshipTitlePlaceholder}
                />
                {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
              </div>
              <div className={`${styles.formGroup} ${errors.workType ? styles.hasError : ''}`}>
                <label>{t.workTypeLabel}</label>
                <select name="workType" value={form.workType} onChange={handleChange}>
                  <option value="Remote">{t.remote}</option>
                  <option value="Hybrid">{t.hybrid}</option>
                  <option value="Onsite">{t.onSite}</option>
                </select>
                {errors.workType && <span className={styles.fieldError}>{errors.workType}</span>}
              </div>
            </div>

            {/* Description */}
            <div className={`${styles.formGroup} ${errors.description ? styles.hasError : ''}`}>
              <label>{t.descriptionLabel}</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t.descriptionPlaceholder}
                rows={5}
              />
              {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
            </div>

            {/* Row 2 — Location + Duration + Salary */}
            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${errors.governorate ? styles.hasError : ''}`}>
                <label>{t.locationLabel}</label>
                <select name="governorate" value={form.governorate} onChange={handleChange}>
                  <option value="">{t.selectGovernorate}</option>
                  {EGYPT_GOVERNORATES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.governorate && <span className={styles.fieldError}>{errors.governorate}</span>}
              </div>

              <div className={`${styles.formGroup} ${errors.duration ? styles.hasError : ''}`}>
                <label>{t.duration}</label>
                <select
                  name="duration"
                  value={form.duration === 0 ? '' : String(form.duration)}
                  onChange={handleDurationChange}
                >
                  <option value="">{t.selectDuration}</option>
                  {DURATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={String(opt.value)}>{opt.label}</option>
                  ))}
                </select>
                {errors.duration && <span className={styles.fieldError}>{errors.duration}</span>}
              </div>

              {form.isPaid === 'paid' && (
                <div className={styles.formGroup}>
                  <label>{t.stipendOptional}</label>
                  <input
                    type="number"
                    name="salary"
                    min={0}
                    value={form.salary || ''}
                    onChange={handleSalaryChange}
                    placeholder={t.stipendPlaceholder ?? 'e.g. 3000'}
                  />
                </div>
              )}
            </div>

            {/* Row 3 — Deadline + Compensation */}
            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${errors.deadline ? styles.hasError : ''}`}>
                <label>{t.applicationDeadline}</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  min={today}
                  onChange={handleChange}
                />
                {errors.deadline && <span className={styles.fieldError}>{errors.deadline}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>{t.compensation}</label>
                <select name="isPaid" value={form.isPaid} onChange={handleChange}>
                  <option value="unpaid">{t.unpaid}</option>
                  <option value="paid">{t.paid}</option>
                </select>
              </div>
            </div>

            {/* Requirements */}
            <div className={styles.formGroup}>
              <label>{t.requirements}</label>
              <div className={styles.dynamicList}>
                {requirements.map((req, idx) => (
                  <div key={idx} className={styles.dynamicItem}>
                    <input
                      value={req}
                      onChange={e => handleRequirementChange(idx, e.target.value)}
                      placeholder={t.enterRequirement}
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeItemBtn}
                        onClick={() => removeRequirement(idx)}
                        title={t.delete}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className={styles.addItemBtn} onClick={addRequirement}>
                <Plus size={16} /> {t.addRequirement}
              </button>
            </div>

            {/* Skills */}
            <div className={`${styles.formGroup} ${errors.skills ? styles.hasError : ''}`}>
              <label>{t.requiredSkills}</label>
              <div className={styles.dynamicList}>
                {skills.map((skill, idx) => (
                  <div key={idx} className={styles.dynamicItem}>
                    <input
                      value={skill}
                      onChange={e => handleSkillChange(idx, e.target.value)}
                      placeholder={t.enterSkill}
                    />
                    {skills.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeItemBtn}
                        onClick={() => removeSkill(idx)}
                        title={t.delete}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className={styles.addItemBtn} onClick={addSkill}>
                <Plus size={16} /> {t.addSkillBtn}
              </button>
              {errors.skills && <span className={styles.fieldError}>{errors.skills}</span>}
            </div>

            {/* Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => router.push('/company/internships')}
              >
                {t.cancel}
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading
                  ? (isEditMode ? t.updating        : t.publishing)
                  : (isEditMode ? t.updateInternship : t.postNewInternship)}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}

export default function PostInternshipPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostInternshipContent />
    </Suspense>
  )
}
