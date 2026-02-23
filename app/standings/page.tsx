"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { PagedResponse } from "@/types/paged-response";
import Pagination from "@/components/Pagination";
import AlertMessage from "@/components/AlertMessage";

interface Standing {
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
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
              <th style={{ padding: "10px", border: "1px solid #444" }}>Equipo</th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>PJ</th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>G</th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>E</th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>P</th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>GF</th>
              <th style={{ padding: "10px", border: "1px solid #444" }}>GC</th>
              <th
                style={{ padding: "10px", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => handleSort("points")}
              >
                Pts {renderArrow("points")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((team, index) => (
              <tr key={index}>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.teamName}</td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.played}</td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.wins}</td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.draws}</td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.losses}</td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.goalsFor}</td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.goalsAgainst}</td>
                <td style={{ padding: "10px", border: "1px solid #333" }}>{team.points}</td>
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