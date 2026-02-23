"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { PagedResponse } from "@/types/paged-response";
import Pagination from "@/components/Pagination";
import AlertMessage from "@/components/AlertMessage";

interface Player {
  id: string;
  name: string;
  teamId: string;
  goals: number;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info" | "update";
    message: string;
  } | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedTeam, setSelectedTeam] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");

  async function loadPlayers() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDirection,
      });
      if (selectedTeam) query.append("teamId", selectedTeam);

      const response = (await apiFetch(`/api/Players?${query.toString()}`)) as PagedResponse<Player>;
      setPlayers(response.data);
      setTotalPages(response.totalPages);
    } catch {
      setAlert({ type: "error", message: "Error al cargar jugadores" });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPlayers(); }, [pageNumber, pageSize, sortBy, sortDirection, selectedTeam]);

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

  async function handleCreate() {
    if (!name || !teamId) {
      setAlert({ type: "warning", message: "Todos los campos son obligatorios" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    try {
      await apiFetch("/api/Players", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ name, teamId }),
      });
      setAlert({ type: "success", message: "Jugador creado correctamente" });
      setName("");
      setTeamId("");
      setIsCreating(false);
      await loadPlayers();
    } catch (err: unknown) {
      setAlert({ type: "error", message: err instanceof Error ? err.message : "Error al crear jugador" });
    }
    setTimeout(() => setAlert(null), 3000);
  }

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
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
        .pl-wrapper {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(10px);
          font-family: 'Inter', sans-serif;
        }

        .pl-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .pl-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .pl-divider {
          height: 2px;
          background: linear-gradient(90deg, #f5c518, transparent);
          margin-bottom: 28px;
          border-radius: 2px;
        }

        .pl-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .pl-filters {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .pl-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pl-select {
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

        .pl-select:hover, .pl-select:focus { border-color: rgba(245,197,24,0.5); }
        .pl-select option { background: #1a1a1a; }

        .pl-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          letter-spacing: 0.5px;
          transition: opacity 0.2s, transform 0.15s;
        }

        .pl-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        .pl-btn-add {
          background: rgba(245,197,24,0.1);
          color: #f5c518;
          border-color: rgba(245,197,24,0.4);
        }

        .pl-btn-save {
          background: rgba(0,220,100,0.1);
          color: #00dc64;
          border-color: rgba(0,220,100,0.4);
        }

        .pl-btn-cancel {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.12);
        }

        .pl-loading {
          text-align: center;
          color: rgba(255,255,255,0.35);
          padding: 40px 0;
          letter-spacing: 2px;
          font-size: 13px;
        }

        .pl-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .pl-table thead tr { background: rgba(245,197,24,0.08); }

        .pl-table th {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(245,197,24,0.2);
          color: rgba(255,255,255,0.55);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          transition: color 0.2s;
        }

        .pl-table th.no-sort { cursor: default; }
        .pl-table th:hover { color: #f5c518; }
        .pl-table th.no-sort:hover { color: rgba(255,255,255,0.55); }

        .pl-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
          font-size: 14px;
        }

        .pl-table tbody tr { transition: background 0.15s; }
        .pl-table tbody tr:hover { background: rgba(245,197,24,0.04); }

        .pl-goals {
          font-weight: 700;
          color: #f5c518;
          font-size: 15px;
        }

        /* MODAL */
        .pl-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .pl-modal {
          background: #111;
          border: 1px solid rgba(245,197,24,0.2);
          border-radius: 16px;
          padding: 28px;
          width: 420px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }

        .pl-modal h3 {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .pl-modal-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .pl-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .pl-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pl-form-label {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .pl-input {
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .pl-input:focus { border-color: rgba(245,197,24,0.5); }
        .pl-input::placeholder { color: rgba(255,255,255,0.2); }
        .pl-input option { background: #1a1a1a; }
      `}</style>

      <div className="pl-wrapper">
        {/* Header */}
        <div className="pl-header">
          <span style={{ fontSize: 28 }}>👤</span>
          <h2 className="pl-title">Jugadores</h2>
        </div>
        <div className="pl-divider" />

        {alert && <AlertMessage type={alert.type} message={alert.message} />}

        {/* Controles */}
        <div className="pl-controls">
          <div className="pl-filters">
            <label className="pl-label">
              Equipo:
              <select
                className="pl-select"
                value={selectedTeam}
                onChange={(e) => { setSelectedTeam(e.target.value); setPageNumber(1); }}
              >
                <option value="">Todos</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </label>

            <label className="pl-label">
              Por página:
              <select
                className="pl-select"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>

          <button className="pl-btn pl-btn-add" onClick={() => setIsCreating(true)}>
            ➕ Crear Jugador
          </button>
        </div>

        {loading && <p className="pl-loading">⚽ Cargando jugadores...</p>}

        {!loading && (
          <table className="pl-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>Nombre {renderArrow("name")}</th>
                <th className="no-sort">Goles</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td><span className="pl-goals">{player.goals}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={(page) => setPageNumber(page)}
        />
      </div>

      {/* MODAL CREAR JUGADOR */}
      {isCreating && (
        <div className="pl-overlay">
          <div className="pl-modal">
            <h3>👤 Crear Jugador</h3>
            {alert && <AlertMessage type={alert.type} message={alert.message} />}
            <div className="pl-modal-divider" />

            <div className="pl-form-group">
              <span className="pl-form-label">Nombre</span>
              <input
                className="pl-input"
                placeholder="Nombre del jugador..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="pl-form-group">
              <span className="pl-form-label">Equipo</span>
              <select
                className="pl-input"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <option value="">Seleccione equipo</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="pl-modal-footer">
              <button className="pl-btn pl-btn-cancel" onClick={() => setIsCreating(false)}>Cancelar</button>
              <button className="pl-btn pl-btn-save" onClick={handleCreate}>✔ Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
