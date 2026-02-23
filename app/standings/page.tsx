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
      setAlert({
        type: "error",
        message: "Error al cargar tabla de posiciones",
      });

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
    if (sortBy !== column) return "⬍";
    return sortDirection === "asc" ? "⬆" : "⬇";
  }

  return (
    <div style={{ border: "1px solid #333", padding: "25px", borderRadius: "8px" }}>
      <h2 style={{ marginBottom: "20px" }}>Tabla de Posiciones</h2>
        <div
        style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            alignItems: "center",
        }}
        >
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
      {alert && <AlertMessage type={alert.type} message={alert.message} />}

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
                onClick={() => handleSort("teamName")}
              >
                Equipo {renderArrow("teamName")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("played")}
              >
                PJ {renderArrow("played")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("won")}
              >
                G {renderArrow("won")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("draw")}
              >
                E {renderArrow("draw")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("lost")}
              >
                P {renderArrow("lost")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("goalsFor")}
              >
                GF {renderArrow("goalsFor")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("goalsAgainst")}
              >
                GC {renderArrow("goalsAgainst")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("goalDifference")}
              >
                DG {renderArrow("goalDifference")}
              </th>

              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("points")}
              >
                Pts {renderArrow("points")}
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((team) => (
              <tr key={team.teamId}>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.teamName}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.played}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.won}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.draw}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.lost}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.goalsFor}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.goalsAgainst}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>
                  {team.goalDifference}
                </td>
                <td style={{ padding: "10px", border: "1px solid #333", fontWeight: "bold" }}>
                  {team.points}
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