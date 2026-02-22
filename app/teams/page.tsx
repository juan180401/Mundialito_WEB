"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Team } from "@/types/team";
import { PagedResponse } from "@/types/paged-response";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = (await apiFetch(
          `/api/Teams?pageNumber=${pageNumber}&pageSize=2&sortBy=Name&sortDirection=ASC`
        )) as PagedResponse<Team>;

        setTeams(data.data);
        setTotalPages(data.totalPages);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      }
    }

    loadTeams();
  }, [pageNumber]);

  return (
    <main style={{ padding: "20px" }}>
      <h1>Equipos</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {teams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber === 1}
        >
          Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
          Página {pageNumber} de {totalPages}
        </span>

        <button
          onClick={() =>
            setPageNumber((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={pageNumber === totalPages}
        >
          Siguiente
        </button>
      </div>
    </main>
  );
}