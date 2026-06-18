
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ChevronLeft,
  CheckCircle,
  UserCircle,
  MapPin,
  Download,
  X,
  Menu,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import TopBarControls from "../../components/TopBarControls/TopBarControls";
import styles from "./company.module.css";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import api from "../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecentApplicant {
  id: number;
  internId: number;
  name: string;
  role: string;
  timeAgo: string;
  status: "Pending" | "Accepted" | "Rejected";
}

interface ActiveListing {
  id: number;
  title: string;
  location: string;
  payStatus: string;
  applicants: number;
}

// ✅ كل الـ keys بالـ camelCase زي ما الباك بيبعت
interface InternDetails {
  internId: number;
  title: string;
  description: string;
  duration: number;
  locationType: string;
  createdAt: string;
  deadlineDate: string;
  updateAt?: string;
  isPaid: boolean;
  price?: number;
  status: string;
  isOpen: boolean;
  internship_City?: string;
  internship_Country?: string;
  skills: string[];
  requirements: string[];
  applicationsCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
function Company() {
  const { language, t } = useApp();
  const router = useRouter();

  const [activeListings, setActiveListings] = useState<ActiveListing[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>(
    [],
  );
  const [stats, setStats] = useState({
    activeListingsCount: 0,
    totalApplicantsCount: 0,
    hiredInterns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<InternDetails | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // ─── Action State ─────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [language]);

  // ─── Fetch Dashboard ──────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const res = await api.get("/company/Dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res.data?.data || res.data;
      setActiveListings(raw.activeListings || []);
      setRecentApplicants(raw.recentApplicants || []);
      setStats({
        activeListingsCount: raw.activeListingsCount ?? 0,
        totalApplicantsCount: raw.totalApplicantsCount ?? 0,
        hiredInterns: raw.hiredInterns ?? 0,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      console.warn(
        "[fetchDashboardData] API failed, falling back to mock:",
        err,
      );
      setActiveListings([
        {
          id: 6,
          title: "Senior Backend .NET Intern",
          location: "Alexandria",
          payStatus: "Paid",
          applicants: 2,
        },
        {
          id: 7,
          title: "Frontend React Intern",
          location: "Alexandria",
          payStatus: "Unpaid",
          applicants: 2,
        },
      ]);
      setRecentApplicants([
        {
          id: 8,
          internId: 6,
          name: "Amany Gomaa",
          role: "Senior Backend .NET Intern",
          timeAgo: "23 hours ago",
          status: "Pending",
        },
        {
          id: 7,
          internId: 7,
          name: "Amany Gomaa",
          role: "Frontend React Intern",
          timeAgo: "23 hours ago",
          status: "Pending",
        },
        {
          id: 6,
          internId: 7,
          name: "mariam samih",
          role: "Frontend React Intern",
          timeAgo: "3 days ago",
          status: "Rejected",
        },
        {
          id: 5,
          internId: 6,
          name: "mariam samih",
          role: "Senior Backend .NET Intern",
          timeAgo: "3 days ago",
          status: "Accepted",
        },
      ]);
      setStats({
        activeListingsCount: 2,
        totalApplicantsCount: 4,
        hiredInterns: 1,
      });
    } finally {
      await new Promise((r) => setTimeout(r, 200));
      setLoading(false);
    }
  };

  const handleAccept = async (applicant: RecentApplicant) => {
    try {
      setActionLoading(applicant.id);
      const token = localStorage.getItem("token");
      await api.put(
        `/company/Applicants/accept/${applicant.id}/${applicant.internId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRecentApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: "Accepted" } : a,
        ),
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      alert(err.response?.data?.message || err.message || t.failedToAccept);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicant: RecentApplicant) => {
    try {
      setActionLoading(applicant.id);
      const token = localStorage.getItem("token");
      await api.put(
        `/company/Applicants/reject/${applicant.id}/${applicant.internId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRecentApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: "Rejected" } : a,
        ),
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      alert(err.response?.data?.message || err.message || t.failedToReject);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadCV = async (applicant: RecentApplicant) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/company/Applicants/downloadCV/${applicant.id}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
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
      alert(err.response?.data?.message || err.message || t.failedToDownloadCv);
    }
  };

  // ─── View Details ─────────────────────────────────────────────────────────
  const handleViewDetails = async (internId: number) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      setShowModal(true);
      setSelectedIntern(null);
      const token = localStorage.getItem("token");
      const res = await api.get(`/company/Dashboard/view/details/${internId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || res.data;
      setSelectedIntern(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      setDetailsError("Failed to load internship details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIntern(null);
    setDetailsError(null);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getStatusClass = (status: string) => {
    if (status === "Accepted") return styles.Accept;
    if (status === "Rejected") return styles.Reject;
    return styles.Pending;
  };

  const getStatusLabel = (status: string) => {
    if (status === "Accepted") return t.statusAccepted;
    if (status === "Rejected") return t.statusRejected;
    return t.pending;
  };

  const formatTimeAgo = (timeAgo: string) => {
    if (timeAgo.includes("hours"))
      return `${timeAgo.split(" ")[0]} ${t.hoursAgo}`;
    if (timeAgo.includes("day")) return `${timeAgo.split(" ")[0]} ${t.daysAgo}`;
    return timeAgo;
  };

  // ─── Loading / Error ──────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className={styles.errorContainer}>
        {t.errorLoading}
        <button onClick={fetchDashboardData} className={styles.retryButton}>
          {t.retry}
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`${styles.appLayout} ${language === "ar" ? styles.rtl : ""}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.glowSecondary} aria-hidden="true" />
      <div className={styles.glowTertiary} aria-hidden="true" />

      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.logoSection}>
          <div className={styles.backButton} onClick={() => router.push("/")}>
            <ChevronLeft size={20} />
          </div>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>IW</div>
            <span className={styles.logoText}>InternWay</span>
          </div>
        </div>
        <nav className={styles.nav}>
          <Link
            href="/company/dashboard"
            className={`${styles.navItem} ${styles.active}`}
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
            <span>{t.internships}</span>
          </Link>
          <Link
            href="/company/applicants"
            className={styles.navItem}
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
            <UserCircle size={20} />
            <span>{t.profile}</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{t.companyWelcome}</h1>
            <p className={styles.pageSubtitle}>{t.companySubtitle}</p>
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

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              <Briefcase size={24} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{t.activeListings}</div>
              <div className={styles.statValue}>
                {stats.activeListingsCount}
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
              <Users size={24} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{t.totalApplicants}</div>
              <div className={styles.statValue}>
                {stats.totalApplicantsCount}
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>{t.hiredInterns}</div>
              <div className={styles.statValue}>{stats.hiredInterns}</div>
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className={styles.sectionBox}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.activeListings}</h2>
            <button
              className={styles.postButton}
              onClick={() => router.push("/company/post-internship")}
            >
              {t.postNewInternship}
            </button>
          </div>
          <div className={styles.listingsGrid}>
            {activeListings.length > 0 ? (
              activeListings.map((listing) => (
                <div key={listing.id} className={styles.listingItem}>
                  <div className={styles.listingLeft}>
                    <h3 className={styles.listingTitle}>{listing.title}</h3>
                    <div className={styles.listingDetails}>
                      <span className={styles.listingLoc}>
                        <MapPin size={14} />
                        {listing.location}
                      </span>
                      <span
                        className={`${styles.payBadge} ${listing.payStatus === "Paid" ? styles.paid : styles.unpaid}`}
                      >
                        {listing.payStatus === "Paid" ? t.paid : t.unpaid}
                      </span>
                      <span className={styles.listingApps}>
                        {listing.applicants} {t.applicants}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.viewDetailsBtn}
                    onClick={() => handleViewDetails(listing.id)}
                  >
                    {t.viewDetails}
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>{t.noActiveMentees}</p>
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className={styles.sectionBox}>
          <h2 className={styles.sectionTitle}>{t.recentApplications}</h2>
          <div className={styles.applicantsList}>
            {recentApplicants.length > 0 ? (
              recentApplicants.map((applicant) => (
                <div key={applicant.id} className={styles.applicationItem}>
                  <div className={styles.applicantLeft}>
                    <div className={styles.applicantAvatar}>
                      {getInitials(applicant.name)}
                    </div>
                    <div className={styles.applicantInfo}>
                      <h3 className={styles.applicantName}>{applicant.name}</h3>
                      <p className={styles.applicantRole}>{applicant.role}</p>
                    </div>
                  </div>
                  <div className={styles.applicantRight}>
                    <div className={styles.appMeta}>
                      <span className={styles.timeAgo}>
                        {formatTimeAgo(applicant.timeAgo)}
                      </span>
                      <span
                        className={`${styles.appStatus} ${getStatusClass(applicant.status)}`}
                      >
                        {getStatusLabel(applicant.status)}
                      </span>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.cvBtn}
                        title={t.downloadCv}
                        onClick={() => handleDownloadCV(applicant)}
                      >
                        <Download size={14} /> CV
                      </button>
                      {applicant.status === "Pending" && (
                        <>
                          <button
                            className={styles.acceptBtn}
                            disabled={actionLoading === applicant.id}
                            onClick={() => handleAccept(applicant)}
                          >
                            {actionLoading === applicant.id ? "..." : t.accept}
                          </button>
                          <button
                            className={styles.rejectBtn}
                            disabled={actionLoading === applicant.id}
                            onClick={() => handleReject(applicant)}
                          >
                            {actionLoading === applicant.id
                              ? "..."
                              : t.rejectApplicant}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>{t.noLabor}</p>
            )}
          </div>
        </div>
      </main>

      {/* ─── Details Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={handleCloseModal}>
              <X size={20} />
            </button>

            {detailsLoading && (
              <div className={styles.modalLoading}>
                <div className={styles.spinner} />
                <p>Loading...</p>
              </div>
            )}

            {detailsError && (
              <div className={styles.modalError}>
                <p>{detailsError}</p>
              </div>
            )}

            {selectedIntern && !detailsLoading && (
              <>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>{selectedIntern.title}</h2>
                  <div className={styles.modalBadges}>
                    {/* ✅ isPaid / isOpen بالـ camelCase */}
                    <span
                      className={`${styles.payBadge} ${selectedIntern.isPaid ? styles.paid : styles.unpaid}`}
                    >
                      {selectedIntern.isPaid ? t.paid : t.unpaid}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${selectedIntern.isOpen ? styles.open : styles.closed}`}
                    >
                      {selectedIntern.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>

                <div className={styles.modalBody}>
                  <p className={styles.modalDescription}>
                    {selectedIntern.description}
                  </p>

                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <span className={styles.fieldLabel}>Duration</span>
                      <span className={styles.fieldValue}>
                        {selectedIntern.duration} months
                      </span>
                    </div>
                    <div className={styles.modalField}>
                      <span className={styles.fieldLabel}>Location Type</span>
                      <span className={styles.fieldValue}>
                        {selectedIntern.locationType}
                      </span>
                    </div>
                    {/* ✅ internship_City / internship_Country */}
                    {selectedIntern.internship_City && (
                      <div className={styles.modalField}>
                        <span className={styles.fieldLabel}>City</span>
                        <span className={styles.fieldValue}>
                          {selectedIntern.internship_City}
                        </span>
                      </div>
                    )}
                    {selectedIntern.internship_Country && (
                      <div className={styles.modalField}>
                        <span className={styles.fieldLabel}>Country</span>
                        <span className={styles.fieldValue}>
                          {selectedIntern.internship_Country}
                        </span>
                      </div>
                    )}
                    {selectedIntern.isPaid && selectedIntern.price && (
                      <div className={styles.modalField}>
                        <span className={styles.fieldLabel}>Stipend</span>
                        <span className={styles.fieldValue}>
                          ${selectedIntern.price}
                        </span>
                      </div>
                    )}
                    <div className={styles.modalField}>
                      <span className={styles.fieldLabel}>Applications</span>
                      <span className={styles.fieldValue}>
                        {selectedIntern.applicationsCount}
                      </span>
                    </div>
                    <div className={styles.modalField}>
                      <span className={styles.fieldLabel}>Deadline</span>
                      {/* ✅ deadlineDate / createdAt بالـ camelCase */}
                      <span className={styles.fieldValue}>
                        {selectedIntern.deadlineDate}
                      </span>
                    </div>
                    <div className={styles.modalField}>
                      <span className={styles.fieldLabel}>Posted</span>
                      <span className={styles.fieldValue}>
                        {selectedIntern.createdAt}
                      </span>
                    </div>
                  </div>

                  {selectedIntern.skills.length > 0 && (
                    <div className={styles.modalSection}>
                      <h4 className={styles.sectionLabel}>Skills</h4>
                      <div className={styles.tagsList}>
                        {selectedIntern.skills.map((skill, i) => (
                          <span key={i} className={styles.tag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedIntern.requirements.length > 0 && (
                    <div className={styles.modalSection}>
                      <h4 className={styles.sectionLabel}>Requirements</h4>
                      <div className={styles.tagsList}>
                        {selectedIntern.requirements.map((req, i) => (
                          <span key={i} className={styles.tag}>
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Company;
