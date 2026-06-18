

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Globe,
  Download,
  Eye,
  FileText,
  Edit2,
  Trash2,
  XCircle,
  RotateCcw,
  Plus,
  Clock,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import TopBarControls from "../../components/TopBarControls/TopBarControls";
import styles from "./InternshipsStyle.module.css";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import api from "../../lib/api";
import { toast } from "../../lib/toast";

interface Internship {
  id: number;
  title: string;
  city?: string;
  isPaid: "Paid" | "Unpaid";
  salary?: string;
  deadline: string;
  applications: number;
  status: "Open" | "Closed";
  workType: "Remote" | "Onsite" | "Hybrid";
}

const MOCK_INTERNSHIPS: Internship[] = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    workType: "Remote",
    isPaid: "Paid",
    salary: "5,000 EGP/month",
    deadline: "2024-12-30",
    applications: 45,
    status: "Open",
  },
  {
    id: 2,
    title: "Backend Developer Intern",
    city: "Alexandria",
    workType: "Onsite",
    isPaid: "Paid",
    salary: "5,500 EGP/month",
    deadline: "2025-01-15",
    applications: 32,
    status: "Closed",
  },
];

function MyInternshipPage() {
  const { language, t } = useApp();
  const router = useRouter();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Reopen modal state ───────────────────────────────────────────────────
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenTargetId, setReopenTargetId] = useState<number | null>(null);
  const [reopenDeadline, setReopenDeadline] = useState("");

  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // ── Custom Confirmation Modals States ────────────────────────────────────
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closeTargetId, setCloseTargetId] = useState<number | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // دالة مخصصة لانتشال الخطأ الحقيقي القادم من الباك إيند وتجنب نصوص الـ 404 العامة
  const extractErrorMessage = (err: any, fallback: string) => {
    if (err.response?.data) {
      if (typeof err.response.data === "string") return err.response.data;
      if (err.response.data.message) return err.response.data.message;
      if (err.response.data.errorMessage) return err.response.data.errorMessage;
    }
    return err.message || fallback;
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await api.get("/company/MyInternships", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInternships(res.data.data);
    } catch (err: any) {
      setError(extractErrorMessage(err, t.failedToLoadInternships));
    } finally {
      setLoading(false);
    }
  };

  // ── Close posting ──────────────────────────────────────────────────────────
  const handleClosePosting = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/company/MyInternships/internship/close/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInternships((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "Closed" } : i)),
      );
      toast.success(t.closed || "Posting closed successfully");
    } catch (err: any) {
      toast.error(extractErrorMessage(err, t.failedToClose));
    } finally {
      setCloseConfirmOpen(false);
      setCloseTargetId(null);
    }
  };

  // ── Reopen posting ────────────────────────────────────────────────────────
  const handleOpenReopenModal = (id: number) => {
    setReopenTargetId(id);
    const current = internships.find((i) => i.id === id);
    setReopenDeadline("");
    setReopenModalOpen(true);
  };

  const handleCloseReopenModal = () => {
    setReopenModalOpen(false);
    setReopenTargetId(null);
    setReopenDeadline("");
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleReopen = async () => {
    if (!reopenTargetId) return;
    const id = reopenTargetId;
    const payload: { deadline: string | null } = {
      deadline: reopenDeadline || null,
    };

    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/company/MyInternships/internship/reopen/${id}`,
        { internshipId: id, deadline: reopenDeadline || null },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInternships((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: "Open", deadline: payload.deadline || i.deadline }
            : i,
        ),
      );
      handleCloseReopenModal();
      toast.success(t.active || "Posting reopened successfully");
    } catch (err: any) {
      toast.error(extractErrorMessage(err, t.failedToReopen));
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/company/MyInternships/internship/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInternships((prev) => prev.filter((i) => i.id !== id));
      toast.success(t.delete || "Internship deleted");
    } catch (err: any) {
      toast.error(extractErrorMessage(err, t.failedToDelete));
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/company/post-internship?id=${id}`);
  };

  const [applicants, setApplicants] = useState<any[]>([]);

  const handleViewApplications = async (id: number) => {
    setApplicants([]);
    setApplicantsLoading(true);
    setApplicantsModalOpen(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/company/MyInternships/view/applicants/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const raw = res.data?.data || [];
      setApplicants(
        raw.map((a: any) => ({ ...a, internId: a.internId ?? id })),
      );
    } catch (err: any) {
      setApplicants([]);
      if (err.response?.status !== 404) {
        toast.error(extractErrorMessage(err, "فشل تحميل المتقدمين"));
      }
    } finally {
      setApplicantsLoading(false);
    }
  };

  const filtered = internships.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.city || i.workType || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const formatDeadline = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleAccept = async (app: any) => {
    try {
      const token = localStorage.getItem("token");
      const internId = app.internId;
      await api.put(
        `/company/Applicants/accept/${app.id}/${internId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApplicants((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "Accepted" } : a)),
      );
      toast.success(t.statusAccepted || "Applicant accepted successfully");
    } catch (err: any) {
      toast.error(extractErrorMessage(err, t.failedToAccept));
    }
  };

  const handleReject = async (app: any) => {
    try {
      const token = localStorage.getItem("token");
      const internId = app.internId;
      await api.put(
        `/company/Applicants/reject/${app.id}/${internId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApplicants((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "Rejected" } : a)),
      );
      toast.success(t.statusRejected || "Applicant rejected");
    } catch (err: any) {
      toast.error(extractErrorMessage(err, t.failedToReject));
    }
  };

  const handleDownloadCV = async (app: any) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/company/Applicants/downloadCV/${app.id}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${app.name}-CV.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      toast.error(extractErrorMessage(err, t.failedToDownloadCv));
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className={styles.appLayout}>
        <div className={styles.loadingCenter}>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryBtn} onClick={fetchInternships}>
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
              onClick={() => router.push("/company/dashboard")}
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
            className={`${styles.navItem} ${styles.active}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Briefcase size={20} />
            <span>{t.myInternships}</span>
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
            <Building2 size={20} />
            <span>{t.companyProfileNav}</span>
          </Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{t.myInternships}</h1>
            <p className={styles.pageSubtitle}>{t.managePostings}</p>
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
              placeholder={t.searchInternships}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className={styles.postBtn}
            onClick={() => router.push("/company/post-internship")}
          >
            <Plus size={18} /> {t.postNewInternship}
          </button>
        </div>

        <div className={styles.cardsList}>
          {filtered.length === 0 && (
            <div className={styles.emptyMessage}>{t.noInternshipsFound}</div>
          )}

          {filtered.map((internship) => (
            <div key={internship.id} className={styles.internshipCard}>
              <span
                className={`${styles.statusBadge} ${internship.status === "Open" ? styles.statusActive : styles.statusClosed}`}
              >
                {internship.status === "Open" ? t.active : t.closed}
              </span>

              <div className={styles.cardTop}>
                <h3 className={styles.cardTitle}>{internship.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <MapPin size={14} />
                    {internship.workType === "Onsite" && internship.city
                      ? `${internship.city} (${t.onSite})`
                      : internship.workType === "Remote"
                        ? t.remote
                        : t.hybrid}
                  </span>
                  <span
                    className={`${styles.metaItem} ${internship.isPaid === "Paid" ? styles.paidColor : styles.unpaidColor}`}
                  >
                    <DollarSign size={14} />
                    {internship.isPaid === "Paid"
                      ? internship.salary || t.paid
                      : t.unpaid}
                  </span>
                  <span className={styles.metaItem}>
                    <Calendar size={14} /> {t.deadline}:{" "}
                    {formatDeadline(internship.deadline)}
                  </span>
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>{t.applicants}</span>
                  <span className={styles.statValue}>
                    <FileText size={16} /> {internship.applications}
                  </span>
                </div>

                <div className={styles.statBox}>
                  <span className={styles.statLabel}>{t.status}</span>
                  <span className={styles.statValue}>
                    {internship.isPaid === "Paid" ? t.paid : t.unpaid}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => handleViewApplications(internship.id)}
                >
                  {t.viewApplicants} ({internship.applications})
                </button>

                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(internship.id)}
                >
                  <Edit2 size={15} /> {t.edit}
                </button>
                {internship.status === "Open" ? (
                  <button
                    className={styles.closeBtn}
                    onClick={() => {
                      setCloseTargetId(internship.id);
                      setCloseConfirmOpen(true);
                    }}
                  >
                    <XCircle size={15} /> {t.closePosting}
                  </button>
                ) : (
                  <button
                    className={styles.closeBtn}
                    onClick={() => handleOpenReopenModal(internship.id)}
                  >
                    <RotateCcw size={15} /> {t.reopenPosting}
                  </button>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => {
                    setDeleteTargetId(internship.id);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 size={15} /> {t.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Custom Modal: Close Confirmation ──────────────────────────────── */}
      {closeConfirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
          onClick={() => { setCloseConfirmOpen(false); setCloseTargetId(null); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "90%",
              maxWidth: "380px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>
              {t.closePosting || "Close Posting"}
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#4b5563", marginBottom: "1.5rem" }}>
              {t.confirmClosePosting || "Are you sure you want to close this internship posting?"}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => { setCloseConfirmOpen(false); setCloseTargetId(null); }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                  color: "#374151"
                }}
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => closeTargetId && handleClosePosting(closeTargetId)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f59e0b",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                {t.confirmed || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Modal: Delete Confirmation ──────────────────────────────── */}
      {deleteConfirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
          onClick={() => { setDeleteConfirmOpen(false); setDeleteTargetId(null); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "90%",
              maxWidth: "380px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600, color: "#ef4444" }}>
              {t.delete || "Delete Internship"}
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#4b5563", marginBottom: "1.5rem" }}>
              {t.confirmDelete || "Are you sure you want to delete this internship permanently?"}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => { setDeleteConfirmOpen(false); setDeleteTargetId(null); }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                  color: "#374151"
                }}
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                {t.delete || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reopen Modal ───────────────────────────────────────────────── */}
      {reopenModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseReopenModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "90%",
              maxWidth: "380px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: "1rem",
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {t.reopenPosting}
            </h3>

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {t.deadline}
            </label>
            <input
              type="date"
              value={reopenDeadline}
              onChange={(e) => setReopenDeadline(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                marginBottom: "1.25rem",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={handleCloseReopenModal}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleReopen}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#16a34a",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {t.ok}
              </button>
            </div>
          </div>
        </div>
      )}

      {applicantsModalOpen && (
        <div
          className={styles.applicantsBackdrop}
          onClick={() => setApplicantsModalOpen(false)}
        >
          <div
            className={styles.applicantsModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.applicantsHeader}>
              <h3 className={styles.applicantsTitle}>
                <Users size={18} /> {t.applicants}
              </h3>
              <button
                onClick={() => setApplicantsModalOpen(false)}
                className={styles.iconButton}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.applicantsBody}>
              {applicantsLoading ? (
                <div
                  className={styles.loadingCenter}
                  style={{ minHeight: "auto", padding: "2rem 0" }}
                >
                  <div className={styles.spinner} />
                </div>
              ) : applicants.length === 0 ? (
                <div className={styles.emptyMessage}>{t.noApplicantsFound}</div>
              ) : (
                applicants.map((app) => (
                  <div key={app.id} className={styles.applicantCard}>
                    <div className={styles.cardLeft}>
                      <div className={styles.avatar}>
                        {app.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardTopRow}>
                        <div>
                          <h4 className={styles.applicantName}>{app.name}</h4>
                          <p className={styles.applicantMeta}>
                            {app.internTitle} · {app.university} · {app.major}
                          </p>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${
                            app.status === "Accepted"
                              ? styles.status_accepted
                              : app.status === "Rejected"
                                ? styles.status_rejected
                                : styles.status_pending
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className={styles.contactRow}>
                        <span className={styles.contactItem}>{app.email}</span>
                        <span className={styles.contactItem}>{app.phone}</span>
                      </div>

                      <div className={styles.cardBottomRow}>
                        <span className={styles.appliedAt}>
                          {app.appliedAt}
                        </span>
                        <div className={styles.actions}>
                          <button
                            className={styles.downloadBtn}
                            onClick={() => handleDownloadCV(app)}
                          >
                            <Download size={14} /> {t.downloadCv}
                          </button>
                          {app.status === "Pending" && (
                            <>
                              <button
                                className={styles.acceptBtn}
                                onClick={() => handleAccept(app)}
                              >
                                {t.accept}
                              </button>
                              <button
                                className={styles.rejectBtn}
                                onClick={() => handleReject(app)}
                              >
                                {t.rejectApplicant}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.applicantsFooter}>
              <span className={styles.applicantsCount}>
                {t.applicants}: <strong>{applicants.length}</strong>
              </span>
              <button
                className={styles.applicantsCloseBtn}
                onClick={() => setApplicantsModalOpen(false)}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyInternshipPage;