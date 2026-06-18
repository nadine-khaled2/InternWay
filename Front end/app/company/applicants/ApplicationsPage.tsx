
"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  ChevronLeft,
  Search,
  Mail,
  Phone,
  Download,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import TopBarControls from "../../components/TopBarControls/TopBarControls";
import styles from "./ApplicationsStyle.module.css";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import api from "../../lib/api";
import { toast } from "../../lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Applicant {
  id: number;
  internId: number;
  internTitle: string;
  name: string;
  university: string;
  major: string;
  email: string;
  phone: string;
  appliedAt: string; // 2 hour age
  status: "Pending" | "Accepted" | "Rejected";
  cvUrl: string;
}

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 1,
    internId: 1,
    internTitle: "Frontend Developer Intern",
    name: "Ahmed Khaled",
    university: "Cairo University",
    major: "Computer Science",
    email: "ahmed@example.com",
    phone: "+20 123 456 7890",
    appliedAt: "2 hours ago",
    status: "Pending",
    cvUrl: "/cv/ahmed-khaled.pdf",
  },
  {
    id: 2,
    internId: 2,
    internTitle: "Back end Developer Intern",
    name: "maryam Khaled",
    university: "Cairo University",
    major: "Computer Science",
    email: "ahmed@example.com",
    phone: "+20 123 456 7890",
    appliedAt: "2 hours ago",
    status: "Pending",
    cvUrl: "/cv/ahmed-khaled.pdf",
  },
  {
    id: 3,
    internId: 3,
    internTitle: "Frontend Developer Intern",
    name: "dina Khaled",
    university: "Cairo University",
    major: "IT",
    email: "ahmed@example.com",
    phone: "+20 123 456 7890",
    appliedAt: "2 hours ago",
    status: "Pending",
    cvUrl: "/cv/ahmed-khaled.pdf",
  },
  {
    id: 4,
    internId: 4,
    internTitle: "Frontend Developer Intern",
    name: "amira ahmed",
    university: "Cairo University",
    major: "AI",
    email: "ahmed@example.com",
    phone: "+20 123 456 7890",
    appliedAt: "2 hours ago",
    status: "Pending",
    cvUrl: "/cv/ahmed-khaled.pdf",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
function ApplicationsContent() {
  const { language, t } = useApp();

  const router = useRouter();
  const searchParams = useSearchParams();
  const internshipId = searchParams.get("internId");

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Accepted" | "Rejected"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const endpoint = internshipId
        ? `/company/Applicants?internId=${internshipId}`
        : "/company/Applicants";
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || res.data;
      setApplicants(data || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      console.warn(
        "[fetchApplicants] API failed, falling back to mock applicants:",
        err,
      );
      if (internshipId) {
        setApplicants(
          MOCK_APPLICANTS.filter((a) => a.internId === Number(internshipId)),
        );
      } else {
        setApplicants(MOCK_APPLICANTS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [internshipId]);

  const handleAccept = async (applicant: Applicant) => {
    try {
      const token = localStorage.getItem("token");
      const internId = internshipId ? Number(internshipId) : applicant.internId;
      await api.put(
        `/company/Applicants/accept/${applicant.id}/${internId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: "Accepted" as const } : a,
        ),
      );
      toast.success(t.statusAccepted || "Applicant accepted successfully");
    } catch (err: any) {
      toast.error(err.message || t.failedToAccept);
    }
  };

  const handleReject = async (applicant: Applicant) => {
    try {
      const token = localStorage.getItem("token");
      const internId = internshipId ? Number(internshipId) : applicant.internId;
      await api.put(
        `/company/Applicants/reject/${applicant.id}/${internId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: "Rejected" as const } : a,
        ),
      );
      toast.success(t.statusRejected || "Applicant rejected");
    } catch (err: any) {
      toast.error(err.message || t.failedToReject);
    }
  };

  const handleDownloadCV = async (applicant: Applicant) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        `/company/Applicants/downloadCV/${applicant.id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${applicant.name}-CV.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t.failedToDownloadCv);
    }
  };

  const filtered = applicants.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.major.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className={styles.appLayout}>
        <div className={styles.loadingCenter}>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryBtn} onClick={fetchApplicants}>
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appLayout} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.glowSecondary} aria-hidden="true" />
      <div className={styles.glowTertiary} aria-hidden="true" />

      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <button
              className={styles.backBtn}
              onClick={() => router.push("/company/internships")}
              title={t.back}
            >
              <ChevronLeft size={18} />
            </button>
            <div className={styles.logoIcon}>IW</div>
            <span className={styles.logoText}>{t.appName}</span>
          </div>
        </div>
        <nav className={styles.nav}>
          <Link
            href="/company/dashboard"
            className={styles.navItem}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>{t.dashboard}</span>
          </Link>
          <Link
            href="/company/internships"
            className={styles.navItem}
            onClick={() => setSidebarOpen(false)}
          >
            <Briefcase size={20} />
            <span>{t.myInternships}</span>
          </Link>
          <Link
            href="/company/applicants"
            className={`${styles.navItem} ${styles.active}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            <span>{t.applicants}</span>
          </Link>
          <Link
            href="/company/profile"
            className={styles.navItem}
            onClick={() => setSidebarOpen(false)}
          >
            <Building2 size={20} />
            <span>{t.companyProfileNav}</span>
          </Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{t.applicantsPageTitle}</h1>
            <p className={styles.pageSubtitle}>{t.applicantsPageSubtitle}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className={styles.hamburgerBtn}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <TopBarControls />
          </div>
        </header>

        <div className={styles.searchRow}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder={t.searchApplicants}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            title={t.allApplications}
          >
            <option value="all">{t.allApplications}</option>
            <option value="Pending">{t.statusPending}</option>
            <option value="Accepted">{t.statusAccepted}</option>
            <option value="Rejected">{t.statusRejected}</option>
          </select>
        </div>

        <div className={styles.cardsList}>
          {filtered.length === 0 && (
            <div className={styles.emptyMessage}>{t.noApplicantsFound}</div>
          )}
          {filtered.map((applicant) => (
            <div key={applicant.id} className={styles.applicantCard}>
              <div className={styles.cardLeft}>
                <div className={styles.avatar}>
                  {getInitials(applicant.name)}
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTopRow}>
                  <div>
                    <h3 className={styles.applicantName}>{applicant.name}</h3>
                    <p className={styles.applicantMeta}>
                      {applicant.university} &bull; {applicant.major}
                    </p>
                  </div>
                  <div className={styles.badges}>
                    <span
                      className={`${styles.statusBadge} ${styles[`status_${applicant.status}`]}`}
                    >
                      {applicant.status === "Pending"
                        ? t.statusPending
                        : applicant.status === "Accepted"
                          ? t.statusAccepted
                          : t.statusRejected}
                    </span>
                  </div>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactItem}>
                    <Mail size={14} /> {applicant.email}
                  </span>
                  <span className={styles.contactItem}>
                    <Phone size={14} /> {applicant.phone}
                  </span>
                </div>
                <div className={styles.cardBottomRow}>
                  <span className={styles.appliedAt}>
                    {t.applied} {applicant.appliedAt}
                  </span>

                  <div className={styles.actions}>
                    <button
                      className={styles.downloadBtn}
                      onClick={() => handleDownloadCV(applicant)}
                    >
                      <Download size={14} /> {t.downloadCv}
                    </button>
                    {applicant.status === "Pending" && (
                      <>
                        <button
                          className={styles.acceptBtn}
                          onClick={() => handleAccept(applicant)}
                        >
                          {t.accept}
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleReject(applicant)}
                        >
                          {t.rejectApplicant}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  const { t } = useApp();
  return (
    <div className={styles.loadingFallback}>
      <div className={styles.spinnerLarge} />
      <p className={styles.loadingText}>{t.loadingApplicants}</p>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ApplicationsContent />
    </Suspense>
  );
}
