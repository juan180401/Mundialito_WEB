"use client";

import Link from "next/link";

const cards = [
  { href: "/teams",     icon: "🛡️", label: "Equipos",            desc: "Ver todos los equipos"  },
  { href: "/matches",   icon: "🏟️", label: "Partidos",           desc: "Fixture y resultados"   },
  { href: "/standings", icon: "📊", label: "Tabla de Posiciones", desc: "Clasificación general"  },
  { href: "/scorers",   icon: "🥇", label: "Goleadores",          desc: "Ranking de goles"       },
];

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700&display=swap');

        body { margin: 0; }

        .mundi-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f1923 0%, #1a2f1a 50%, #0f1923 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .mundi-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.03);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .mundi-title-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .mundi-ball {
          font-size: 40px;
          filter: drop-shadow(0 0 12px rgba(255,220,50,0.5));
          animation: spin 6s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .mundi-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 6vw, 64px);
          letter-spacing: 6px;
          color: #fff;
          margin: 0;
          text-shadow: 0 0 40px rgba(255,220,50,0.3), 0 2px 8px rgba(0,0,0,0.8);
          text-align: center;
          line-height: 1;
        }

        .mundi-sub {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.28em;
          letter-spacing: 10px;
          color: #f5c518;
          font-weight: 400;
          margin-top: 4px;
        }

        .mundi-divider {
          width: 220px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f5c518, transparent);
          margin: 20px auto 0;
        }

        .mundi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 20px;
          max-width: 860px;
          width: 100%;
          margin-top: 56px;
        }

        .mundi-card {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          transition: background 0.25s, border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }

        .mundi-card:hover {
          background: rgba(245,197,24,0.12);
          border-color: rgba(245,197,24,0.5);
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(245,197,24,0.18);
        }

        .mundi-card-icon  { font-size: 44px; margin-bottom: 14px; }

        .mundi-card-label {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 6px;
        }

        .mundi-card-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.38);
          text-align: center;
          letter-spacing: 0.4px;
        }

        .mundi-footer {
          margin-top: 56px;
          color: rgba(255,255,255,0.15);
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }
      `}</style>

      <main className="mundi-root">
        <div className="mundi-ring" style={{ width: 500, height: 500 }} />
        <div className="mundi-ring" style={{ width: 720, height: 720 }} />

        <div style={{ textAlign: "center" }}>
          <div className="mundi-title-row">
            <span className="mundi-ball">⚽</span>
            <span className="mundi-ball" style={{ animationDirection: "reverse", fontSize: 28 }}>⚽</span>

            <h1 className="mundi-h1">
              Mundialito
              <span className="mundi-sub">Corporativo</span>
            </h1>

            <span className="mundi-ball" style={{ animationDirection: "reverse", fontSize: 28 }}>⚽</span>
            <span className="mundi-ball">⚽</span>
          </div>
          <div className="mundi-divider" />
        </div>

        <div className="mundi-grid">
          {cards.map(({ href, icon, label, desc }) => (
            <Link key={href} href={href} className="mundi-card">
              <span className="mundi-card-icon">{icon}</span>
              <span className="mundi-card-label">{label}</span>
              <span className="mundi-card-desc">{desc}</span>
            </Link>
          ))}
        </div>

        <p className="mundi-footer">⚽ Temporada 2025</p>
      </main>
    </>
  );
}
