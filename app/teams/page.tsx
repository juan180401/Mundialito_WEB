"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Team } from "@/types/team";
import { PagedResponse } from "@/types/paged-response";
import Pagination from "@/components/Pagination";
import AlertMessage from "@/components/AlertMessage";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [alert, setAlert] = useState<{
  type: "success" | "error" | "warning" | "info";
  message: string;
} | null>(null);
  const [loading, setLoading] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");

  async function handleDelete(id: string) {
    const confirmDelete = confirm("¿Seguro que deseas eliminar este equipo?");
    if (!confirmDelete) return;

    try {
      const deletedTeam = teams.find((t) => t.id === id);

      await apiFetch(`/api/Teams/${id}`, {
        method: "DELETE",
      });

      setTeams((prev) => prev.filter((t) => t.id !== id));

      setAlert({
        type: "error", // 🔴 porque es acción destructiva
        message: `Equipo ${deletedTeam?.name ?? ""} eliminado correctamente`,
      });

      setTimeout(() => setAlert(null), 3000);

    } catch {
      setAlert({
        type: "error",
        message: "Error al eliminar el equipo",
      });

      setTimeout(() => setAlert(null), 3000);
    }
  }

  useEffect(() => {
  async function loadTeams() {
    setLoading(true);

    try {
      const data = (await apiFetch(
        `/api/Teams?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=Name&sortDirection=${sortDirection}`
      )) as PagedResponse<Team>;

      setTeams(data.data);
      setTotalPages(data.totalPages);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setAlert({
          type: "error",
          message: err.message,
        });
      } else {
        setAlert({
          type: "error",
          message: "Error desconocido",
        });
      }

      setTimeout(() => setAlert(null), 3000);

    } finally {
      setLoading(false);
    }
  }

  loadTeams();
}, [pageNumber, pageSize, sortDirection]);

  return (
    <div
      style={{
        border: "1px solid #333",
        padding: "25px",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Equipos</h2>

      {/* Alertas reutilizables */}
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} />
      )}

      {/* Controles */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <label>
            Registros por página:{" "}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              style={{
                padding: "5px",
                backgroundColor: "#111",
                color: "white",
                border: "1px solid #555",
              }}
            >
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>
        </div>

        <button
          onClick={() => {
            setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
            setPageNumber(1);
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: "#222",
            color: "white",
            border: "1px solid #555",
            cursor: "pointer",
          }}
        >
          Orden: {sortDirection}
        </button>
      </div>

      {/* Estados */}
      {loading && <p>Cargando equipos...</p>}

      {/* Tabla */}
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
                style={{
                  padding: "10px",
                  border: "1px solid #444",
                  textAlign: "left",
                }}
              >
                Nombre
              </th>
              <th
                style={{
                  padding: "10px",
                  border: "1px solid #444",
                  textAlign: "center",
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #333",
                  }}
                >
                  {team.name}
                </td>

                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #333",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => handleDelete(team.id)}
                    style={{
                      fontSize: "18px",
                      padding: "6px 10px",
                      backgroundColor: "#330000",
                      color: "#ff4d4d",
                      border: "1px solid #aa0000",
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
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