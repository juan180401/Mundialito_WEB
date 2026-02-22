"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Team } from "@/types/team";
import { PagedResponse } from "@/types/paged-response";
import Pagination from "@/components/Pagination";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");

  useEffect(() => {
    async function loadTeams() {
      setLoading(true);
      setError("");

      try {
        const data = (await apiFetch(
          `/api/Teams?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=Name&sortDirection=${sortDirection}`
        )) as PagedResponse<Team>;

        setTeams(data.data);
        setTotalPages(data.totalPages);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
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
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Tabla */}
      {!loading && !error && (
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
                  textAlign: "left",
                  padding: "10px",
                  borderBottom: "1px solid #444",
                }}
              >
                Nombre
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #333",
                  }}
                >
                  {team.name}
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