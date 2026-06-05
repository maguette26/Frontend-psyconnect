import React, { useState } from "react";

const EmotionAnalyzer = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeEmotion = async () => {
    if (!text.trim()) {
      setError("Veuillez entrer un texte.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:9191/api/ai/analyze-emotion", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
 ody: JSON.stringify({ message: text }) 
});

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse.");
      }

      const data = await response.json();
      setResult(data); // on reçoit {analysis: "..."}
    } catch (e) {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>Analyse Emotionnelle</h2>

      <textarea
        rows="5"
        placeholder="Écris ton texte ici…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={analyzeEmotion}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#4a6cff",
          color: "white",
          cursor: "pointer",
        }}
      >
        {loading ? "Analyse..." : "Analyser"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "10px",
            background: "#f4f4f4",
          }}
        >
          <h3>Résultat :</h3>
          <p>{result.analysis}</p>
        </div>
      )}
    </div>
  );
};

export default EmotionAnalyzer;
