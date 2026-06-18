# دليل الفريق - Mentor Pages

## 📋 نظرة عامة

هذا الدليل موجه لأعضاء الفريق الذين سيعملون على صفحات المنتور (Mentor Pages).

## 🏗️ البنية الحالية

حالياً، المشروع يحتوي على صفحة واحدة فقط للمنتور:
- ✅ **Dashboard** (`app/mentor/dashboard/`)

## 📝 الصفحات المطلوبة

يجب إنشاء الصفحات التالية:

### 1. My Sessions (`app/mentor/mySessions/`)
صفحة لعرض وإدارة جلسات المنتور مع الطلاب.

**الملفات المطلوبة:**
```
app/mentor/mySessions/
├── page.tsx                    # Next.js page wrapper
├── mySessions.tsx              # المكون الرئيسي
└── mySessionsStyle.module.css  # الأنماط
```

### 2. My Mentees (`app/mentor/myMentees/`)
صفحة لعرض قائمة الطلاب الذين يتم إرشادهم.

**الملفات المطلوبة:**
```
app/mentor/myMentees/
├── page.tsx                    # Next.js page wrapper
├── myMentees.tsx               # المكون الرئيسي
└── myMenteesStyle.module.css   # الأنماط
```

### 3. Profile (`app/mentor/profile/`)
صفحة الملف الشخصي للمنتور.

**الملفات المطلوبة:**
```
app/mentor/profile/
├── page.tsx                    # Next.js page wrapper
├── mentorProfile.tsx           # المكون الرئيسي
└── mentorProfileStyle.module.css  # الأنماط
```

## 🎨 معايير التصميم

### استخدام AppContext
يجب استخدام `AppContext` للوصول إلى:
- `theme` - السمة الحالية (dark/light)
- `language` - اللغة الحالية (en/ar)
- `t` - دالة الترجمة
- `toggleTheme()` - تبديل السمة
- `setLanguage()` - تغيير اللغة

**مثال:**
```typescript
import { useApp } from '../../context/AppContext'

function MyComponent() {
    const { theme, language, t, toggleTheme, setLanguage } = useApp()
    // ...
}
```

### البنية الأساسية لكل صفحة

#### 1. ملف `page.tsx` (Next.js wrapper)
```typescript
import MyComponent from './myComponent';

export default function MyComponentPage() {
    return <MyComponent />;
}
```

#### 2. المكون الرئيسي
يجب أن يحتوي على:
- **Sidebar** مع روابط التنقل
- **Top Bar** مع أدوات التحكم (Language, Theme, Notifications, Logout)
- **Main Content** محتوى الصفحة

**مثال للبنية:**
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    UserCircle,
    Video,
    ChevronLeft,
    Globe,
    Moon,
    Sun,
    Bell,
    LogOut,
    Check
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import styles from './myComponentStyle.module.css'

function MyComponent() {
    const { theme, toggleTheme, language, setLanguage, t } = useApp()
    const [showLanguageMenu, setShowLanguageMenu] = useState(false)
    const router = useRouter()

    const changeLanguage = (lang: 'en' | 'ar') => {
        setLanguage(lang)
        setShowLanguageMenu(false)
    }

    return (
        <div className={styles.appLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logoSection}>
                    <div className={styles.backButton} onClick={() => router.push('/mentor/dashboard')}>
                        <ChevronLeft size={20} />
                    </div>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>IW</div>
                        <span className={styles.logoText}>InternWay</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <Link href="/mentor/dashboard" className={styles.navItem}>
                        <LayoutDashboard size={20} />
                        <span>{t.dashboard}</span>
                    </Link>
                    <Link href="/mentor/mySessions" className={styles.navItem}>
                        <Video size={20} />
                        <span>{t.mySessions}</span>
                    </Link>
                    <Link href="/mentor/myMentees" className={styles.navItem}>
                        <Users size={20} />
                        <span>{t.myMentees}</span>
                    </Link>
                    <Link href="/mentor/profile" className={styles.navItem}>
                        <UserCircle size={20} />
                        <span>{t.profile}</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>{t.pageTitle}</h1>
                        <p className={styles.pageSubtitle}>{t.pageSubtitle}</p>
                    </div>

                    <div className={styles.topBarControls}>
                        <div className={styles.languageWrapper}>
                            <button
                                className={styles.iconButton}
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                title={t.changeLanguage}
                            >
                                <Globe size={20} />
                            </button>
                            <div className={`${styles.languageMenu} ${showLanguageMenu ? styles.show : ''}`}>
                                <div
                                    className={`${styles.languageOption} ${language === 'en' ? styles.active : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    {language === 'en' && <Check size={16} />}
                                    English
                                </div>
                                <div
                                    className={`${styles.languageOption} ${language === 'ar' ? styles.active : ''}`}
                                    onClick={() => changeLanguage('ar')}
                                >
                                    {language === 'ar' && <Check size={16} />}
                                    العربية
                                </div>
                            </div>
                        </div>
                        <button className={styles.iconButton} onClick={toggleTheme} title={t.toggleTheme}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className={styles.iconButton} title={t.notifications}>
                            <Bell size={20} />
                        </button>
                        <button className={styles.iconButton} onClick={() => router.push('/')} title={t.logout}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {/* Your page content here */}
                <div className={styles.content}>
                    {/* Add your content */}
                </div>
            </main>
        </div>
    )
}

export default MyComponent
```

### CSS Modules
استخدم CSS Modules لكل صفحة. يمكنك الرجوع إلى:
- `app/mentor/dashboard/mentorDashboardStyle.module.css` كمثال

الأنماط الأساسية المطلوبة:
- `.appLayout` - التخطيط الرئيسي
- `.sidebar` - الشريط الجانبي
- `.mainContent` - المحتوى الرئيسي
- `.topBar` - الشريط العلوي
- `.navItem` - عناصر التنقل
- `.iconButton` - أزرار الأيقونات

## 🌐 الترجمات

### إضافة مفاتيح ترجمة جديدة
يجب إضافة جميع النصوص في ملف الترجمات:
`app/locales/translations.ts`

**مثال:**
```typescript
export const translations = {
    en: {
        // ... existing translations
        myNewKey: "My New Text",
    },
    ar: {
        // ... existing translations
        myNewKey: "النص الجديد",
    }
}
```

### استخدام الترجمات
```typescript
<h1>{t.myNewKey}</h1>
```

## 📦 تسليم الكود

عند الانتهاء من صفحتك، قم بما يلي:

1. **تأكد من أن الكود يعمل بدون أخطاء:**
   ```bash
   npm run dev
   ```

2. **تحقق من التصميم في كلا السمتين (Dark/Light)**

3. **تحقق من الترجمة في كلتا اللغتين (English/Arabic)**

4. **قم بإرسال الملفات التالية:**
   - المجلد الكامل للصفحة (مثلاً: `app/mentor/mySessions/`)
   - أي تحديثات على ملف الترجمات (`app/locales/translations.ts`)
   - لقطات شاشة للصفحة في الوضعين (Dark/Light) واللغتين

## 🔗 روابط مفيدة

- **Next.js Documentation:** https://nextjs.org/docs
- **Lucide React Icons:** https://lucide.dev/icons/
- **CSS Modules:** https://nextjs.org/docs/app/building-your-application/styling/css-modules

## ❓ أسئلة؟

إذا كان لديك أي أسئلة، تواصل مع قائد الفريق.

---

**آخر تحديث:** 2026-02-10
