"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Match } from "@/types/match";
import { PagedResponse } from "@/types/paged-response";
import Pagination from "@/components/Pagination";
import AlertMessage from "@/components/AlertMessage";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info" | "update";
    message: string;
  } | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [homePlayers, setHomePlayers] = useState<{ id: string; name: string }[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<{ id: string; name: string }[]>([]);
  const [homeScorers, setHomeScorers] = useState<{ playerId: string; goals: number }[]>([]);
  const [awayScorers, setAwayScorers] = useState<{ playerId: string; goals: number }[]>([]);
  const calculatedHomeGoals = homeScorers.reduce((sum, s) => sum + s.goals, 0);
  const calculatedAwayGoals = awayScorers.reduce((sum, s) => sum + s.goals, 0);

  const [isFinishedFilter, setIsFinishedFilter] = useState<boolean | undefined>(undefined);

  async function handleCreateMatch() {
    if (!homeTeamId || !awayTeamId || !matchDate) {
      setAlert({ type: "warning", message: "Todos los campos son obligatorios" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    if (homeTeamId === awayTeamId) {
      setAlert({ type: "warning", message: "Un equipo no puede jugar contra sí mismo" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    try {
      await apiFetch("/api/Matches", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          homeTeamId,
          awayTeamId,
          matchDate: new Date(matchDate).toISOString(),
        }),
      });
      setAlert({ type: "success", message: "Partido creado correctamente" });
      setIsCreating(false);
    } catch (err: unknown) {
      setAlert({ type: "error", message: err instanceof Error ? err.message : "Error al crear partido" });     
    }
    setTimeout(() => setAlert(null), 3000);
  }

  async function openResultModal(matchId: string) {
    const match = matches.find((m) => m.matchId === matchId);
    if (!match) return;

    setSelectedMatchId(matchId);
    setHomeScorers([]);
    setAwayScorers([]);

    try {
      const homeData = await apiFetch(`/api/Players?pageNumber=1&pageSize=100&teamId=${match.homeTeamId}`);
      const awayData = await apiFetch(`/api/Players?pageNumber=1&pageSize=100&teamId=${match.awayTeamId}`);
      setHomePlayers(homeData.data);
      setAwayPlayers(awayData.data);
      setIsResultModalOpen(true);
    } catch {
      setAlert({ type: "error", message: "Error al cargar jugadores" });
      setTimeout(() => setAlert(null), 3000);
    }
  }

  function addHomeScorer(playerId: string, goals: number) {
    if (!playerId || goals <= 0) return;
    setHomeScorers((prev) => [...prev, { playerId, goals }]);
  }

  function addAwayScorer(playerId: string, goals: number) {
    if (!playerId || goals <= 0) return;
    setAwayScorers((prev) => [...prev, { playerId, goals }]);
  }

  async function handleRegisterResult() {
    if (!selectedMatchId) return;
    try {
      await apiFetch(`/api/Matches/${selectedMatchId}/result`, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          matchId: selectedMatchId,
          homeGoals: calculatedHomeGoals,
          awayGoals: calculatedAwayGoals,
          scorers: [...homeScorers, ...awayScorers],
        }),
      });
      setAlert({ type: "success", message: "Resultado registrado correctamente" });
      await loadMatches();
      setIsResultModalOpen(false);
    } catch (err: unknown) {
      setAlert({ type: "error", message: err instanceof Error ? err.message : "Error al registrar resultado" });
    }    
    setTimeout(() => setAlert(null), 3000);
  }

  async function loadMatches() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDirection,
      });
      if (isFinishedFilter !== undefined) query.append("isFinished", isFinishedFilter.toString());

      const data = (await apiFetch(`/api/Matches?${query.toString()}`)) as PagedResponse<Match>;
      setMatches(data.data);
      setTotalPages(data.totalPages);
    } catch {
      setAlert({ type: "error", message: "Error al cargar partidos" });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
    setPageNumber(1);
  }

  function renderArrow(column: string) {
    if (sortBy !== column) return <span style={{ color: "#555" }}>⬍</span>;
    return sortDirection === "asc"
      ? <span style={{ color: "#f5c518" }}>⬆</span>
      : <span style={{ color: "#f5c518" }}>⬇</span>;
  }

  useEffect(() => { loadMatches(); }, [pageNumber, pageSize, sortBy, sortDirection, isFinishedFilter]);

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await apiFetch("/api/Teams?pageNumber=1&pageSize=100");
        setTeams(data.data);
      } catch {
        setAlert({ type: "error", message: "Error al cargar equipos" });
      }
    }
    loadTeams();
  }, []);

  return (
    <>
      <style>{`
        .mx-wrapper {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(10px);
          font-family: 'Inter', sans-serif;
        }

        .mx-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .mx-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .mx-divider {
          height: 2px;
          background: linear-gradient(90deg, #f5c518, transparent);
          margin-bottom: 28px;
          border-radius: 2px;
        }

        .mx-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .mx-filters {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .mx-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mx-select {
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

        .mx-select:hover, .mx-select:focus { border-color: rgba(245,197,24,0.5); }
        .mx-select option { background: #1a1a1a; }

        .mx-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          letter-spacing: 0.5px;
          transition: opacity 0.2s, transform 0.15s;
        }

        .mx-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        .mx-btn-add {
          background: rgba(245,197,24,0.1);
          color: #f5c518;
          border-color: rgba(245,197,24,0.4);
        }

        .mx-btn-save {
          background: rgba(0,220,100,0.1);
          color: #00dc64;
          border-color: rgba(0,220,100,0.4);
        }

        .mx-btn-cancel {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.12);
        }

        .mx-btn-register {
          background: rgba(245,197,24,0.1);
          color: #f5c518;
          border-color: rgba(245,197,24,0.35);
          font-size: 12px;
          padding: 6px 12px;
        }

        .mx-btn-add-scorer {
          background: rgba(100,180,255,0.1);
          color: #66ccff;
          border-color: rgba(100,180,255,0.3);
          width: 100%;
        }

        .mx-loading {
          text-align: center;
          color: rgba(255,255,255,0.35);
          padding: 40px 0;
          letter-spacing: 2px;
          font-size: 13px;
        }

        .mx-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .mx-table thead tr { background: rgba(245,197,24,0.08); }

        .mx-table th {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(245,197,24,0.2);
          color: rgba(255,255,255,0.55);
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          transition: color 0.2s;
        }

        .mx-table th.center { text-align: center; cursor: default; }
        .mx-table th:hover { color: #f5c518; }
        .mx-table th.center:hover { color: rgba(255,255,255,0.55); }

        .mx-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
          font-size: 14px;
        }

        .mx-table td.center { text-align: center; }

        .mx-table tbody tr { transition: background 0.15s; }
        .mx-table tbody tr:hover { background: rgba(245,197,24,0.04); }

        .mx-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .mx-badge-done {
          background: rgba(0,220,100,0.1);
          color: #00dc64;
          border: 1px solid rgba(0,220,100,0.25);
        }

        .mx-badge-pending {
          background: rgba(245,197,24,0.1);
          color: #f5c518;
          border: 1px solid rgba(245,197,24,0.25);
        }

        .mx-score {
          font-weight: 800;
          font-size: 16px;
          color: #fff;
          letter-spacing: 2px;
        }

        /* MODAL */
        .mx-overlay {
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

        .mx-modal {
          background: #111;
          border: 1px solid rgba(245,197,24,0.2);
          border-radius: 16px;
          padding: 28px;
          width: 440px;
          max-height: 85vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }

        .mx-modal h3 {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .mx-modal h4 {
          font-size: 12px;
          font-weight: 700;
          color: #f5c518;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .mx-modal-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .mx-modal-total {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
        }

        .mx-modal-total span {
          color: #f5c518;
          font-weight: 700;
          font-size: 16px;
        }

        .mx-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }

        .mx-input {
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

        .mx-input:focus { border-color: rgba(245,197,24,0.5); }
        .mx-input::placeholder { color: rgba(255,255,255,0.2); }
        .mx-input option { background: #1a1a1a; }

        .mx-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .mx-row .mx-input { flex: 1; }
        .mx-row input[type="number"] { width: 80px; flex: none; }

        .mx-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mx-form-label {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      `}</style>

      <div className="mx-wrapper">
        {/* Header */}
        <div className="mx-header">
          <span style={{ fontSize: 28 }}>🏟️</span>
          <h2 className="mx-title">Partidos</h2>
        </div>
        <div className="mx-divider" />

        {alert && <AlertMessage type={alert.type} message={alert.message} />}

        {/* Controles */}
        <div className="mx-controls">
          <div className="mx-filters">
            <label className="mx-label">
              Estado:
              <select
                className="mx-select"
                value={isFinishedFilter === undefined ? "" : isFinishedFilter.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") setIsFinishedFilter(undefined);
                  else setIsFinishedFilter(value === "true");
                  setPageNumber(1);
                }}
              >
                <option value="">Todos</option>
                <option value="true">Finalizados</option>
                <option value="false">Pendientes</option>
              </select>
            </label>

            <label className="mx-label">
              Por página:
              <select
                className="mx-select"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
          </div>

          <button className="mx-btn mx-btn-add" onClick={() => setIsCreating(true)}>
            ➕ Crear Partido
          </button>
        </div>

        {loading && <p className="mx-loading">⚽ Cargando partidos...</p>}

        {!loading && (
          <table className="mx-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("date")}>Fecha {renderArrow("date")}</th>
                <th onClick={() => handleSort("home")}>Local {renderArrow("home")}</th>
                <th onClick={() => handleSort("away")}>Visitante {renderArrow("away")}</th>
                <th onClick={() => handleSort("finished")}>Estado {renderArrow("finished")}</th>
                <th className="center">Resultado</th>
                <th className="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.matchId}>
                  <td style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                    {new Date(match.matchDate).toLocaleString()}
                  </td>
                  <td>{match.homeTeamName}</td>
                  <td>{match.awayTeamName}</td>
                  <td>
                    {match.isFinished
                      ? <span className="mx-badge mx-badge-done">✔ Finalizado</span>
                      : <span className="mx-badge mx-badge-pending">⏳ Pendiente</span>}
                  </td>
                  <td className="center">
                    {match.isFinished
                      ? <span className="mx-score">{match.homeGoals} - {match.awayGoals}</span>
                      : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                  </td>
                  <td className="center">
                    {!match.isFinished && (
                      <button className="mx-btn mx-btn-register" onClick={() => openResultModal(match.matchId)}>
                        ⚽ Registrar
                      </button>
                    )}
                  </td>
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

      {/* MODAL CREAR PARTIDO */}
      {isCreating && (
        <div className="mx-overlay">
          <div className="mx-modal">
            <h3>⚽ Crear Partido</h3>
            {alert && <AlertMessage type={alert.type} message={alert.message} />}
            <div className="mx-modal-divider" />

            <div className="mx-form-group">
              <span className="mx-form-label">Equipo Local</span>
              <select className="mx-input" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
                <option value="">Seleccione equipo local</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="mx-form-group">
              <span className="mx-form-label">Equipo Visitante</span>
              <select className="mx-input" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
                <option value="">Seleccione equipo visitante</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="mx-form-group">
              <span className="mx-form-label">Fecha y Hora</span>
              <input
                className="mx-input"
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </div>

            <div className="mx-modal-footer">
              <button className="mx-btn mx-btn-cancel" onClick={() => setIsCreating(false)}>Cancelar</button>
              <button className="mx-btn mx-btn-save" onClick={handleCreateMatch}>✔ Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR RESULTADO */}
      {isResultModalOpen && (
        <div className="mx-overlay">
          <div className="mx-modal">
            <h3>Registrar Resultado</h3>
            {alert && <AlertMessage type={alert.type} message={alert.message} />}
            <div className="mx-modal-divider" />

            {/* LOCAL */}
            <h4>🏠 Equipo Local</h4>
            <div className="mx-row">
              <select id="homePlayerSelect" className="mx-input">
                <option value="">Seleccionar jugador</option>
                {homePlayers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                id="homeGoalsInput"
                className="mx-input"
                type="number"
                min="1"
                placeholder="Goles"
                style={{ width: 80, flex: "none" }}
              />
              <button
                className="mx-btn mx-btn-add-scorer"
                style={{ width: "auto", padding: "8px 12px" }}
                onClick={() => {
                  const playerId = (document.getElementById("homePlayerSelect") as HTMLSelectElement).value;
                  const goals = Number((document.getElementById("homeGoalsInput") as HTMLInputElement).value);
                  addHomeScorer(playerId, goals);
                }}
              >
                ➕
              </button>
            </div>
            <p className="mx-modal-total">Total Local: <span>{calculatedHomeGoals}</span></p>

            <div className="mx-modal-divider" />

            {/* VISITANTE */}
            <h4>✈️ Equipo Visitante</h4>
            <div className="mx-row">
              <select id="awayPlayerSelect" className="mx-input">
                <option value="">Seleccionar jugador</option>
                {awayPlayers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                id="awayGoalsInput"
                className="mx-input"
                type="number"
                min="1"
                placeholder="Goles"
                style={{ width: 80, flex: "none" }}
              />
              <button
                className="mx-btn mx-btn-add-scorer"
                style={{ width: "auto", padding: "8px 12px" }}
                onClick={() => {
                  const playerId = (document.getElementById("awayPlayerSelect") as HTMLSelectElement).value;
                  const goals = Number((document.getElementById("awayGoalsInput") as HTMLInputElement).value);
                  addAwayScorer(playerId, goals);
                }}
              >
                ➕
              </button>
            </div>
            <p className="mx-modal-total">Total Visitante: <span>{calculatedAwayGoals}</span></p>

            <div className="mx-modal-divider" />

            <div className="mx-modal-footer">
              <button className="mx-btn mx-btn-cancel" onClick={() => setIsResultModalOpen(false)}>Cancelar</button>
              <button className="mx-btn mx-btn-save" onClick={handleRegisterResult}>✔ Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
