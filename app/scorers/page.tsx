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

      if (selectedTeam) {
        query.append("teamId", selectedTeam);
      }

      const response = (await apiFetch(
        `/api/Stats/topscorers?${query.toString()}`
      )) as PagedResponse<TopScorer>;

      setData(response.data);
      setTotalPages(response.totalPages);
    } catch {
      setAlert({
        type: "error",
        message: "Error al cargar goleadores",
      });

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

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  }

  function renderArrow(column: string) {
    if (sortBy !== column) return "⬍";
    return sortDirection === "asc" ? "⬆" : "⬇";
  }

  return (
    <div style={{ border: "1px solid #333", padding: "25px", borderRadius: "8px" }}>
      <h2 style={{ marginBottom: "20px" }}>Top Goleadores</h2>

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
        {/* Filtro equipo */}
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

        {/* Registros por página */}
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
                onClick={() => handleSort("playerName")}
              >
                Jugador {renderArrow("playerName")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("teamName")}
              >
                Equipo {renderArrow("teamName")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("goals")}
              >
                Goles {renderArrow("goals")}
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((player) => (
              <tr key={player.playerId}>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {player.playerName}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {player.teamName}
                </td>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #333",
                    fontWeight: "bold",
                  }}
                >
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
    </div>
  );
}