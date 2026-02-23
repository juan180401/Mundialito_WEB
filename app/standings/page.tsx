"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { PagedResponse } from "@/types/paged-response";
import Pagination from "@/components/Pagination";
import AlertMessage from "@/components/AlertMessage";

interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export default function StandingsPage() {
  const [data, setData] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info" | "update";
    message: string;
  } | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("points");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  async function loadStandings() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDirection,
      });

      const response = (await apiFetch(
        `/api/Stats/standings?${query.toString()}`
      )) as PagedResponse<Standing>;

      setData(response.data);
      setTotalPages(response.totalPages);
    } catch {
      setAlert({ type: "error", message: "Error al cargar tabla de posiciones" });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStandings();
  }, [pageNumber, pageSize, sortBy, sortDirection]);

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  }

  function renderArrow(column: string) {
    if (sortBy !== column) return <span style={{ color: "#555" }}>⬍</span>;
    return sortDirection === "asc"
      ? <span style={{ color: "#f5c518" }}>⬆</span>
      : <span style={{ color: "#f5c518" }}>⬇</span>;
  }

  function getPositionStyle(index: number) {
    const base = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", fontWeight: 700, fontSize: 12, marginRight: 8 };
    const pos = (pageNumber - 1) * pageSize + index + 1;
    if (pos === 1) return { ...base, background: "#f5c518", color: "#000" };
    if (pos === 2) return { ...base, background: "#aaa", color: "#000" };
    if (pos === 3) return { ...base, background: "#cd7f32", color: "#fff" };
    return { ...base, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" };
  }

  function getDiffColor(diff: number) {
    if (diff > 0) return "#00dc64";
    if (diff < 0) return "#ff4d4d";
    return "rgba(255,255,255,0.5)";
  }

  return (
    <>
      <style>{`
        .st-wrapper {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(10px);
          font-family: 'Inter', sans-serif;
        }

        .st-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .st-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .st-divider {
          height: 2px;
          background: linear-gradient(90deg, #f5c518, transparent);
          margin-bottom: 28px;
          border-radius: 2px;
        }

        .st-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          align-items: center;
        }

        .st-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .st-select {
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
        }

        .st-select:hover, .st-select:focus { border-color: rgba(245,197,24,0.5); }
        .st-select option { background: #1a1a1a; }

        .st-loading {
          text-align: center;
          color: rgba(255,255,255,0.35);
          padding: 40px 0;
          letter-spacing: 2px;
          font-size: 13px;
        }

        .st-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .st-table thead tr {
          background: rgba(245,197,24,0.08);
        }

        .st-table th {
          padding: 12px 10px;
          border-bottom: 1px solid rgba(245,197,24,0.2);
          color: rgba(255,255,255,0.55);
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-align: center;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          transition: color 0.2s;
        }

        .st-table th.left { text-align: left; }
        .st-table th:hover { color: #f5c518; }

        .st-table td {
          padding: 11px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          text-align: center;
        }

        .st-table td.left { text-align: left; }

        .st-table tbody tr { transition: background 0.15s; }
        .st-table tbody tr:hover { background: rgba(245,197,24,0.04); }

        .st-points {
          font-weight: 800;
          color: #f5c518;
          font-size: 16px;
        }

        .st-legend {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 8px;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="st-wrapper">
        {/* Header */}
        <div className="st-header">
          <span style={{ fontSize: 28 }}>📊</span>
          <h2 className="st-title">Tabla de Posiciones</h2>
        </div>
        <div className="st-divider" />

        {alert && <AlertMessage type={alert.type} message={alert.message} />}

        {/* Controles */}
        <div className="st-controls">
          <label className="st-label">
            Por página:
            <select
              className="st-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>

        {loading && <p className="st-loading">⚽ Cargando...</p>}

        {!loading && (
          <>
            <table className="st-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th className="left" onClick={() => handleSort("teamName")}>Equipo {renderArrow("teamName")}</th>
                  <th onClick={() => handleSort("played")}>PJ {renderArrow("played")}</th>
                  <th onClick={() => handleSort("won")}>G {renderArrow("won")}</th>
                  <th onClick={() => handleSort("draw")}>E {renderArrow("draw")}</th>
                  <th onClick={() => handleSort("lost")}>P {renderArrow("lost")}</th>
                  <th onClick={() => handleSort("goalsFor")}>GF {renderArrow("goalsFor")}</th>
                  <th onClick={() => handleSort("goalsAgainst")}>GC {renderArrow("goalsAgainst")}</th>
                  <th onClick={() => handleSort("goalDifference")}>DG {renderArrow("goalDifference")}</th>
                  <th onClick={() => handleSort("points")}>Pts {renderArrow("points")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((team, index) => {
                  const pos = (pageNumber - 1) * pageSize + index + 1;
                  return (
                    <tr key={team.teamId}>
                      <td>
                        <span style={getPositionStyle(index)}>{pos}</span>
                      </td>
                      <td className="left">{team.teamName}</td>
                      <td>{team.played}</td>
                      <td style={{ color: "#00dc64" }}>{team.won}</td>
                      <td style={{ color: "rgba(255,255,255,0.5)" }}>{team.draw}</td>
                      <td style={{ color: "#ff4d4d" }}>{team.lost}</td>
                      <td>{team.goalsFor}</td>
                      <td>{team.goalsAgainst}</td>
                      <td style={{ color: getDiffColor(team.goalDifference), fontWeight: 600 }}>
                        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                      </td>
                      <td><span className="st-points">{team.points}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="st-legend">
              <span>PJ = Partidos Jugados</span>
              <span>G = Ganados</span>
              <span>E = Empatados</span>
              <span>P = Perdidos</span>
              <span>GF = Goles a Favor</span>
              <span>GC = Goles en Contra</span>
              <span>DG = Diferencia de Goles</span>
              <span>Pts = Puntos</span>
            </div>
          </>
        )}

        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={(page) => setPageNumber(page)}
        />
      </div>
    </>
  );
}
