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

  const [isFinishedFilter, setIsFinishedFilter] = useState<
    boolean | undefined
  >(undefined);

    async function handleCreateMatch() {
        if (!homeTeamId || !awayTeamId || !matchDate) {
            setAlert({
            type: "warning",
            message: "Todos los campos son obligatorios",
            });
            setTimeout(() => setAlert(null), 3000);
            return;
        }

        if (homeTeamId === awayTeamId) {
            setAlert({
            type: "warning",
            message: "Un equipo no puede jugar contra sí mismo",
            });
            setTimeout(() => setAlert(null), 3000);
            return;
        }

        try {
            await apiFetch("/api/Matches", {
            method: "POST",
            headers: {
                "Idempotency-Key": crypto.randomUUID(),
            },
            body: JSON.stringify({
                homeTeamId,
                awayTeamId,
                matchDate: new Date(matchDate).toISOString(),
            }),
            });

            setAlert({
            type: "success",
            message: "Partido creado correctamente",
            });

        } catch (err: unknown) {
            setAlert({
            type: "error",
            message: err instanceof Error ? err.message : "Error al crear partido",
            });
        }
        
        setIsCreating(false);

        setTimeout(() => {
            setAlert(null);
        }, 3000);
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
        if (sortBy !== column) return "⬍";
        return sortDirection === "asc" ? "⬆" : "⬇";
    }
    useEffect(() => {
        async function loadMatches() {
        setLoading(true);

        try {
            const query = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
            sortBy: sortBy,
            sortDirection: sortDirection,
            });

            if (isFinishedFilter !== undefined) {
            query.append("isFinished", isFinishedFilter.toString());
            }

            const data = (await apiFetch(
            `/api/Matches?${query.toString()}`
            )) as PagedResponse<Match>;

            setMatches(data.data);
            setTotalPages(data.totalPages);
        } catch {
            setAlert({
            type: "error",
            message: "Error al cargar partidos",
            });

            setTimeout(() => setAlert(null), 3000);
        } finally {
            setLoading(false);
        }
        }

        loadMatches();
    }, [pageNumber, pageSize, sortBy, sortDirection, isFinishedFilter]);
    useEffect(() => {
        async function loadTeams() {
            try {
            const data = await apiFetch(
                "/api/Teams?pageNumber=1&pageSize=100"
            );

            setTeams(data.data);
            } catch {
            setAlert({
                type: "error",
                message: "Error al cargar equipos",
            });
            }
        }
        loadTeams();
    }, []);

  return (
    <div
      style={{
        border: "1px solid #333",
        padding: "25px",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Partidos</h2>

      {alert && (
        <AlertMessage type={alert.type} message={alert.message} />
      )}

      {/* Controles */}
      <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            alignItems: "center",
        }}
        >
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            
            {/* Filtro estado */}
            <label>
            Estado:{" "}
            <select
                value={
                isFinishedFilter === undefined
                    ? ""
                    : isFinishedFilter.toString()
                }
                onChange={(e) => {
                const value = e.target.value;
                if (value === "") setIsFinishedFilter(undefined);
                else setIsFinishedFilter(value === "true");
                setPageNumber(1);
                }}
                style={{
                padding: "6px",
                backgroundColor: "#111",
                color: "white",
                border: "1px solid #555",
                }}
            >
                <option value="">Todos</option>
                <option value="true">Finalizados</option>
                <option value="false">Pendientes</option>
            </select>
            </label>

            {/* Page Size */}
            <label>
            Registros por página:{" "}
            <select
                value={pageSize}
                onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
                }}
                style={{
                padding: "6px",
                backgroundColor: "#111",
                color: "white",
                border: "1px solid #555",
                }}
            >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
            </select>
            </label>            
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            style={{
                padding: "6px 12px",
                backgroundColor: "#003366",
                color: "#66ccff",
                border: "1px solid #006699",
                cursor: "pointer",
                marginBottom: "20px"
            }}
            >
            ➕ Crear Partido
            </button>
            {isCreating && (
                <div
                    style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    }}
                >
                    <div
                    style={{
                        backgroundColor: "#1a1a1a",
                        padding: "25px",
                        borderRadius: "8px",
                        width: "400px",
                        border: "1px solid #444",
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}
                    >
                        <h3 style={{ marginBottom: "10px" }}>Crear Partido</h3>

                        {/* Equipo Local */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ marginBottom: "5px" }}>Equipo Local</label>
                        <select
                            value={homeTeamId}
                            onChange={(e) => setHomeTeamId(e.target.value)}
                            style={{
                            padding: "6px",
                            backgroundColor: "#111",
                            color: "white",
                            border: "1px solid #555",
                            }}
                        >
                            <option value="">Seleccione equipo local</option>
                            {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                            ))}
                        </select>
                        </div>

                        {/* Equipo Visitante */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ marginBottom: "5px" }}>Equipo Visitante</label>
                        <select
                            value={awayTeamId}
                            onChange={(e) => setAwayTeamId(e.target.value)}
                            style={{
                            padding: "6px",
                            backgroundColor: "#111",
                            color: "white",
                            border: "1px solid #555",
                            }}
                        >
                            <option value="">Seleccione equipo visitante</option>
                            {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                            ))}
                        </select>
                        </div>

                        {/* Fecha */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ marginBottom: "5px" }}>Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            value={matchDate}
                            onChange={(e) => setMatchDate(e.target.value)}
                            style={{
                            padding: "6px",
                            backgroundColor: "#111",
                            color: "white",
                            border: "1px solid #555",
                            }}
                        />
                        </div>

                        {/* Botones */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                            onClick={() => setIsCreating(false)}
                            style={{
                            padding: "6px 12px",
                            backgroundColor: "#333",
                            color: "white",
                            border: "1px solid #555",
                            cursor: "pointer",
                            }}
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleCreateMatch}
                            style={{
                            padding: "6px 12px",
                            backgroundColor: "#003300",
                            color: "#00ff88",
                            border: "1px solid #006600",
                            cursor: "pointer",
                            }}
                        >
                            Guardar
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

      {loading && <p>Cargando partidos...</p>}

      {!loading && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1a1a1a" }}>
                <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("date")}
                >
                Fecha {renderArrow("date")}
                </th>

                <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("home")}
                >
                Local {renderArrow("home")}
                </th>

                <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("away")}
                >
                Visitante {renderArrow("away")}
                </th>

                <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("finished")}
                >
                Estado {renderArrow("finished")}
                </th>

                <th style={{ padding: "10px", border: "1px solid #444" }}>
                Resultado
                </th>
            </tr>
          </thead>

          <tbody>
            {matches.map((match) => (
              <tr key={match.matchId}>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                    {new Date(match.matchDate).toLocaleString()}
                </td>

                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {match.homeTeamName}
                </td>

                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {match.awayTeamName}
                </td>

                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {match.isFinished
                    ? `${match.homeGoals} - ${match.awayGoals}`
                    : "-"}
                </td>

                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {match.isFinished ? "Finalizado" : "Pendiente"}
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
  );
}