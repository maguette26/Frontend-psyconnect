import React from "react";

export default function WarmupScreen() {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Logo animé */}
        <div style={styles.logo}>🧠</div>

        {/* Spinner */}
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner} />
        </div>

        <h2 style={styles.title}>PsyConnect</h2>
        <p style={styles.subtitle}>Initialisation de la connexion sécurisée…</p>

        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>

        <p style={styles.hint}>
          Vérification du serveur en cours, veuillez patienter.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fill {
          0% { width: 10%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    zIndex: 9999,
  },

  card: {
    width: "360px",
    padding: "40px 32px",
    borderRadius: "20px",
    textAlign: "center",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
  },

  logo: {
    fontSize: "42px",
    marginBottom: "10px",
    animation: "float 2.5s ease-in-out infinite",
  },

  spinnerWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 18,
  },

  spinner: {
    width: 46,
    height: 46,
    border: "4px solid #e8e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  },

  title: {
    margin: "0 0 6px",
    fontSize: 24,
    fontWeight: 700,
    color: "#2d2d4e",
  },

  subtitle: {
    margin: "0 0 18px",
    fontSize: 14,
    color: "#666",
  },

  progressBar: {
    height: "6px",
    width: "100%",
    background: "#eee",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "14px",
  },

  progressFill: {
    height: "100%",
    width: "60%",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    borderRadius: "10px",
    animation: "fill 2.5s ease-in-out infinite",
  },

  hint: {
    margin: 0,
    fontSize: 12,
    color: "#999",
  },
};