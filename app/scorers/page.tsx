"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { PagedResponse } from "@/types/paged-response";
import Pagination from "@/components/Pagination";
import AlertMessage from "@/components/AlertMessage";

interface TopScorer {
  playerId: string;
  playerName: string;
  teamName: string;
  goals: number;
}

export default function TopScorersPage() {
  const [data, setData] = useState<TopScorer[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info" | "update";
    message: string;
  } | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("goals");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  async function loadTopScorers() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDirection,
      });
      if (selectedTeam) query.append("teamId", selectedTeam);

      const response = (await apiFetch(
        `/api/Stats/topscorers?${query.toString()}`
      )) as PagedResponse<TopScorer>;

      setData(response.data);
      setTotalPages(response.totalPages);
    } catch {
      setAlert({ type: "error", message: "Error al cargar goleadores" });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopScorers();
  }, [pageNumber, pageSize, sortBy, sortDirection, selectedTeam]);

  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await apiFetch("/api/Teams?pageNumber=1&pageSize=100");
        setTeams(response.data);
      } catch {
        setAlert({ type: "error", message: "Error al cargar equipos" });
      }
    }
    loadTeams();
  }, []);

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

  return (
    <>
      <style>{`
        .sc-wrapper {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(10px);
          font-family: 'Inter', sans-serif;
        }

        .sc-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .sc-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .sc-divider {
          height: 2px;
          background: linear-gradient(90deg, #f5c518, transparent);
          margin-bottom: 28px;
          border-radius: 2px;
        }

        .sc-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
        }

        .sc-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sc-select {
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

        .sc-select:hover, .sc-select:focus {
          border-color: rgba(245,197,24,0.5);
        }

        .sc-select option {
          background: #1a1a1a;
        }

        .sc-loading {
          text-align: center;
          color: rgba(255,255,255,0.35);
          padding: 40px 0;
          letter-spacing: 2px;
          font-size: 13px;
        }

        .sc-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .sc-table thead tr {
          background: rgba(245,197,24,0.08);
        }

        .sc-table th {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(245,197,24,0.2);
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .sc-table th:hover { color: #f5c518; }

        .sc-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
          font-size: 14px;
        }

        .sc-table tbody tr {
          transition: background 0.15s;
        }

        .sc-table tbody tr:hover {
          background: rgba(245,197,24,0.05);
        }

        .sc-rank {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 700;
          margin-right: 8px;
        }

        .sc-rank-1 { background: #f5c518; color: #000; }
        .sc-rank-2 { background: #aaa; color: #000; }
        .sc-rank-3 { background: #cd7f32; color: #fff; }
        .sc-rank-n { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }

        .sc-goals {
          font-weight: 700;
          color: #f5c518;
          font-size: 16px;
        }
      `}</style>

      <div className="sc-wrapper">
        {/* Header */}
        <div className="sc-header">
          <span style={{ fontSize: 28 }}>🥇</span>
          <h2 className="sc-title">Top Goleadores</h2>
        </div>
        <div className="sc-divider" />

        {alert && <AlertMessage type={alert.type} message={alert.message} />}

        {/* Controles */}
        <div className="sc-controls">
          <label className="sc-label">
            Equipo:
            <select
              className="sc-select"
              value={selectedTeam}
              onChange={(e) => { setSelectedTeam(e.target.value); setPageNumber(1); }}
            >
              <option value="">Todos</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </label>

          <label className="sc-label">
            Por página:
            <select
              className="sc-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>

        {/* Loading */}
        {loading && <p className="sc-loading">⚽ Cargando...</p>}

        {/* Tabla */}
        {!loading && (
          <table className="sc-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th onClick={() => handleSort("playerName")}>
                  Jugador {renderArrow("playerName")}
                </th>
                <th onClick={() => handleSort("teamName")}>
                  Equipo {renderArrow("teamName")}
                </th>
                <th onClick={() => handleSort("goals")}>
                  Goles {renderArrow("goals")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((player, index) => {
                const rank = (pageNumber - 1) * pageSize + index + 1;
                const rankClass =
                  rank === 1 ? "sc-rank sc-rank-1"
                  : rank === 2 ? "sc-rank sc-rank-2"
                  : rank === 3 ? "sc-rank sc-rank-3"
                  : "sc-rank sc-rank-n";
                return (
                  <tr key={player.playerId}>
                    <td>
                      <span className={rankClass}>{rank}</span>
                    </td>
                    <td>{player.playerName}</td>
                    <td style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                      {player.teamName}
                    </td>
                    <td>
                      <span className="sc-goals">{player.goals}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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