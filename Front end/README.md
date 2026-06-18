# InternWay Platform

## Overview
InternWay is a comprehensive gateway for internships and professional development opportunities. Built with modern web technologies, this platform delivers a seamless, responsive, and intuitive user experience. The project serves as a sophisticated frontend application developed using Next.js 14 and React 18, featuring advanced styling with CSS Modules and Bootstrap 5 integration.

---

## Key Features

### Modern User Interface & Experience
- **Interactive Landing Page**: Features dynamic sections including Home, Features, and How it Works with smooth scrolling navigation.
- **Responsive Design**: Fully adaptable layout ensuring optimal viewing across all devices (Desktop, Tablet, Mobile).
- **Visual Effects**: Implements modern design principles with subtle animations, gradients, and refined micro-interactions.

### Student Dashboard & Services
- **Sessions Management**: A dedicated "My Sessions" area allowing students to manage mentorship appointments.
    - **Status Tracking**: Visual indicators for Confirmed, Waiting, and Completed sessions.
    - **Action Controls**: Direct options to Join Meeting, Reschedule, Cancel, or Leave Reviews.
- **Profile Management**: Comprehensive profile section for students to manage personal information, education, and skills.
- **Mentorships & Internships**: Browsing capabilities for finding mentors and internship opportunities (UI integrated).

### Theming System
- **Dark/Light Mode**: Full system-wide theme support with persistent user preference storage.
- **Consistent Styling**: Unified color palettes and component styles across both modes.

### Internationalization (i18n)
- **Bilingual Support**: Complete support for English and Arabic languages.
- **RTL/LTR Layouts**: Automatic layout direction adjustment based on the selected language.

### Authentication & Authorization
- **Secure Login**: Robust form validation and secure token handling.
- **Role-Based Access**: Dedicated workflows and interfaces for different user roles (Student, Company, Mentor).
- **Account Recovery**: Integrated password reset and recovery flow.

---

## Technology Stack

| Technology | Purpose |
| --- | --- |
| **Next.js 14** | Core React framework using App Router architecture. |
| **React 18** | UI library for building interactive component-based interfaces. |
| **TypeScript** | Static typing for enhanced code quality and maintainability. |
| **Bootstrap 5** | Responsive grid system and utility classes. |
| **CSS Modules** | Scoped styling for component isolation. |
| **Lucide React** | Modern, lightweight icon set. |
| **Axios** | HTTP client for backend communication. |

---

## Project Structure

```
app/
├── context/          # Global state management (Theme, Language)
├── student/          # Student-specific protected routes
│   ├── dashboard/    # Student main dashboard
│   ├── sessions/     # Mentorship sessions management
│   ├── profile/      # Student profile settings
│   ├── internships/  # Internship listings
│   └── mentorships/  # Mentor browsing
├── login/            # Authentication pages
├── signup/           # Registration flows
├── lib/              # Utilities and API configuration
├── locales/          # Translation files
└── globalStyles.css  # Global design tokens
```

---

## Getting Started

Follow these steps to set up the project locally:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/omarsameh-in/proj-intership.git
    cd proj-intership
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Access the Application**
    Open your browser and navigate to `http://localhost:3000`

---

## Deployment

The application is deployed and hosted on Vercel. Feature updates are automatically built and deployed upon pushing to the main branch.

**[Live Demo Link](https://proj-intership-fux4o1e95-omars-projects-1e4409a8.vercel.app)**

---

## Copyright

© 2024 InternWay Platform. All Rights Reserved.

---
---

# منصة InternWay

## نظرة عامة
تعد منصة **InternWay** بوابتك الشاملة لفرص التدريب والتطوير المهني. تم بناء هذه المنصة باستخدام أحدث تقنيات الويب لتوفير تجربة مستخدم سلسة وسريعة الاستجابة. تم تطوير المشروع كتطبيق واجهة أمامية (Frontend) متطور باستخدام **Next.js 14** و **React 18**، مع تصميم عصري يعتمد على CSS Modules و Bootstrap 5.

---

## المميزات الرئيسية

### واجهة مستخدم عصرية وتفاعلية
- **صفحة هبوط تفاعلية**: تتضمن أقساماً ديناميكية مثل الرئيسية، المميزات، وكيفية العمل، مع تنقل سلس.
- **تصميم متجاوب**: تخطيط مرن يتكيف تماماً مع جميع الأجهزة (سطح المكتب، الأجهزة اللوحية، الهواتف المحمولة).
- **مؤثرات بصرية**: تطبيق مبادئ التصميم الحديث مع رسوم متحركة خفيفة، تدرجات لونية، وتفاعلات دقيقة.

### لوحة تحكم الطالب والخدمات
- **إدارة الجلسات**: قسم مخصص "جلساتي" يتيح للطلاب إدارة مواعيد الإرشاد.
    - **تتبع الحالة**: مؤشرات بصرية للجلسات المؤكدة، قيد الانتظار، والمكتملة.
    - **خيارات التحكم**: خيارات مباشرة للانضمام للاجتماع، إعادة الجدولة، الإلغاء، أو كتابة تقييم.
- **إدارة الملف الشخصي**: قسم شامل للطلاب لإدارة البيانات الشخصية، التعليم، والمهارات.
- **الإرشاد والتدريب**: تصفح المشرفين وفرص التدريب المتاحة.

### نظام الثيمات (Theming)
- **الوضع الداكن/الفاتح**: دعم كامل لتبديل الثيمات مع حفظ تفضيلات المستخدم.
- **تنسيق موحد**: لوحات ألوان وأنماط مكونات متسقة عبر كلا الوضعين.

### تعدد اللغات (i18n)
- **دعم ثنائي اللغة**: دعم كامل للغتين العربية والإنجليزية.
- **تخطيط RTL/LTR**: ضبط تلقائي لاتجاه الصفحة بناءً على اللغة المختارة.

### المصادقة والأمان
- **تسجيل دخول آمن**: التحقق من صحة النماذج والتعامل الآمن مع الرموز (Tokens).
- **صلاحيات متعددة الأدوار**: مسارات وواجهات مخصصة لكل دور (طالب، شركة، مرشد).
- **استعادة الحساب**: تدفق متكامل لاستعادة وتعيين كلمة المرور.

---

## التقنيات المستخدمة

| التقنية | الغرض |
| --- | --- |
| **Next.js 14** | إطار العمل الأساسي باستخدام معمارية App Router. |
| **React 18** | مكتبة بناء الواجهات التفاعلية. |
| **TypeScript** | الكتابة الثابتة (Static Types) لتحسين جودة الكود والصيانة. |
| **Bootstrap 5** | نظام الشبكة وفئات التصميم المساعدة. |
| **CSS Modules** | تنسيق المكونات بشكل معزول. |
| **Lucide React** | مجموعة أيقونات حديثة وخفيفة. |
| **Axios** | عميل HTTP للتواصل مع الخوادم الخلفية. |

---

## التثبيت والتشغيل

اتبع الخطوات التالية لتشغيل المشروع محلياً:

1.  **نسخ المستودع**
    ```bash
    git clone https://github.com/omarsameh-in/proj-intership.git
    cd proj-intership
    ```

2.  **تثبيت الحزم**
    ```bash
    npm install
    ```

3.  **تشغيل خادم التطوير**
    ```bash
    npm run dev
    ```

4.  **تصفح التطبيق**
    افتح المتصفح وانتقل إلى الرابط `http://localhost:3000`

---

## النشر (Deployment)

تم نشر التطبيق واستضافته على **Vercel**. يتم بناء ونشر التحديثات تلقائياً عند رفع التغييرات إلى الفرع الرئيسي (main branch).

**[رابط المعاينة المباشرة](https://proj-intership-fux4o1e95-omars-projects-1e4409a8.vercel.app)**

---

## حقوق الملكية

© 2026 منصة InternWay. جميع الحقوق محفوظة.
