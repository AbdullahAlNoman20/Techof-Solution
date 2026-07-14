// admin/src/Pages/Home/Home.jsx

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>TechOf Solution — Admin Panel</h1>
      <p style={styles.subtitle}>Select a document type to generate</p>

      <div style={styles.cards}>
        <Link to="/voucher" style={styles.card}>
          <i className="fa-solid fa-file-invoice-dollar" style={styles.icon} />
          <span>Expense Voucher</span>
        </Link>
        <Link to="/invoice" style={styles.card}>
          <i className="fa-solid fa-file-invoice" style={styles.icon} />
          <span>Invoice</span>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: "60px 20px", textAlign: "center" },
  title: { fontSize: "26px", color: "#0a2540", marginBottom: "6px" },
  subtitle: { color: "#6b7280", marginBottom: "32px" },
  cards: { display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" },
  card: {
    width: "220px",
    padding: "28px 16px",
    border: "1px solid #e2e6ec",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 4px 16px rgba(10,37,64,0.08)",
    textDecoration: "none",
    color: "#1f2933",
    fontWeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  icon: { fontSize: "28px", color: "#1d4ed8" },
};