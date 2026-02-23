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

      if (selectedTeam) {
        query.append("teamId", selectedTeam);
      }

      const response = (await apiFetch(
        `/api/Players?${query.toString()}`
      )) as PagedResponse<Player>;

      setPlayers(response.data);
      setTotalPages(response.totalPages);
    } catch {
      setAlert({
        type: "error",
        message: "Error al cargar jugadores",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, [pageNumber, pageSize, sortBy, sortDirection, selectedTeam]);

  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await apiFetch(
          "/api/Teams?pageNumber=1&pageSize=100"
        );
        setTeams(response.data);
      } catch {
        setAlert({
          type: "error",
          message: "Error al cargar equipos",
        });
      }
    }
    loadTeams();
  }, []);

  async function handleCreate() {
    if (!name || !teamId) {
      setAlert({
        type: "warning",
        message: "Todos los campos son obligatorios",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    try {
      await apiFetch("/api/Players", {
        method: "POST",
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          name,
          teamId,
        }),
      });

      setAlert({
        type: "success",
        message: "Jugador creado correctamente",
      });

      setName("");
      setTeamId("");
      setIsCreating(false);

      await loadPlayers();
    } catch (err: unknown) {
      setAlert({
        type: "error",
        message:
          err instanceof Error ? err.message : "Error al crear jugador",
      });
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
    if (sortBy !== column) return "⬍";
    return sortDirection === "asc" ? "⬆" : "⬇";
  }

  return (
    <div style={{ border: "1px solid #333", padding: "25px", borderRadius: "8px" }}>
      <h2 style={{ marginBottom: "20px" }}>Jugadores</h2>

      {alert && <AlertMessage type={alert.type} message={alert.message} />}

      {/* CONTROLES */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <label>
          Equipo:{" "}
          <select
            value={selectedTeam}
            onChange={(e) => {
              setSelectedTeam(e.target.value);
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
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

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
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>

        <button
          onClick={() => setIsCreating(true)}
          style={{
            padding: "6px 12px",
            backgroundColor: "#003366",
            color: "#66ccff",
            border: "1px solid #006699",
            cursor: "pointer",
          }}
        >
          ➕ Crear Jugador
        </button>
      </div>

      {loading && <p>Cargando...</p>}

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
                onClick={() => handleSort("name")}
              >
                Nombre {renderArrow("name")}
              </th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>
                Goles
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id}>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {player.name}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {player.goals}
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

      {/* MODAL CREAR */}
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
            <h3>Crear Jugador</h3>

            <input
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "6px",
                backgroundColor: "#111",
                color: "white",
                border: "1px solid #555",
              }}
            />

            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              style={{
                padding: "6px",
                backgroundColor: "#111",
                color: "white",
                border: "1px solid #555",
              }}
            >
              <option value="">Seleccione equipo</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setIsCreating(false)}>Cancelar</button>
              <button onClick={handleCreate}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}