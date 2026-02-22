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

  const [isFinishedFilter, setIsFinishedFilter] = useState<
    boolean | undefined
  >(undefined);


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
                  {new Date(match.matchDate).toLocaleDateString()}
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