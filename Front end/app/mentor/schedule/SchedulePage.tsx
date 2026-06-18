'use client'
import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Plus, Trash2, X, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TopBarControls from '../../components/TopBarControls/TopBarControls'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import styles from './SchedulePage.module.css'

export default function SchedulePage() {
    const { language, slots, addSlots, deleteSlot, sidebarOpen, setSidebarOpen } = useApp()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [day, setDay] = useState('')
    const [time, setTime] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 200)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return <LoadingScreen />
    }

    const handleAddSlot = () => {
        if (!day || !time) return

        const date = new Date(day)
        const displayDay = date.toLocaleDateString('en-US', {
            weekday: 'long', month: 'short', day: 'numeric'
        })
        const [h, m] = time.split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        const displayTime = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`

        addSlots([{ id: Date.now(), day: displayDay, time: displayTime }])
        setDay('')
        setTime('')
        setIsModalOpen(false)
    }

    return (
        <div className={styles.page}>

            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.title}>
                        {language === 'ar' ? 'جدول المواعيد' : 'My Schedule'}
                    </h1>
                    <p className={styles.subtitle}>
                        {language === 'ar' ? 'حدد أوقات فراغك ليحجزها الطلاب' : 'Set your availability for mentees'}
                    </p>
                </div>
                <div className={styles.headerControls}>
                    <button onClick={() => setIsModalOpen(true)} className={styles.addBtn}>
                        <Plus size={20} />
                        {language === 'ar' ? 'إضافة موعد' : 'Add Slot'}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <TopBarControls />
                    </div>
                </div>
            </div>

            {/* Slots List */}
            <div className={styles.slotsGrid}>
                {slots.length === 0 && (
                    <div className={styles.emptyCard}>
                        {language === 'ar' ? 'لا توجد مواعيد بعد' : 'No slots yet. Add your first slot above.'}
                    </div>
                )}
                {slots.map((slot) => (
                    <div key={slot.id} className={styles.slotCard}>
                        <div className={styles.slotLeft}>
                            <div className={styles.slotIcon}>
                                <CalendarIcon size={24} />
                            </div>
                            <div>
                                <h3 className={styles.slotDay}>{slot.day}</h3>
                                <div className={styles.slotTime}>
                                    <Clock size={16} /> {slot.time}
                                </div>
                            </div>
                        </div>
                        <div className={styles.slotRight}>
                            <span className={styles.availableBadge}>Available</span>
                            <button
                                onClick={() => deleteSlot(slot.id)}
                                className={styles.deleteBtn}
                                title="Delete Slot"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Slot Modal */}
            {isModalOpen && (
                <div
                    className={styles.overlay}
                    onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}
                >
                    <div className={styles.modal}>
                        {/* Modal Header */}
                        <div className={styles.modalHeader}>
                            <div>
                                <p className={styles.modalEyebrow}>Availability</p>
                                <h2 className={styles.modalTitle}>
                                    {language === 'ar' ? 'إضافة موعد جديد' : 'Add New Slot'}
                                </h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn} title="Close">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className={styles.modalBody}>
                            <div>
                                <label className={styles.fieldLabel}>
                                    {language === 'ar' ? 'اليوم' : 'Day'}
                                </label>
                                <input
                                    type="date"
                                    value={day}
                                    onChange={e => setDay(e.target.value)}
                                    className={styles.fieldInput}
                                    aria-label="Day"
                                />
                            </div>

                            <div>
                                <label className={styles.fieldLabel}>
                                    {language === 'ar' ? 'الوقت' : 'Time'}
                                </label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className={styles.fieldInput}
                                    aria-label="Time"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={styles.modalFooter}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={styles.cancelBtn}
                            >
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleAddSlot}
                                disabled={!day || !time}
                                className={`${styles.saveBtn} ${!day || !time ? styles.saveBtnDisabled : styles.saveBtnActive}`}
                            >
                                {language === 'ar' ? 'حفظ الموعد' : 'Save Slot'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
