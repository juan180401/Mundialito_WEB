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
    type: "success" | "error" | "warning" | "info" | "update";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");

  async function handleCreate() {
    if (!newTeamName.trim()) {
      setAlert({ type: "warning", message: "El nombre del equipo es obligatorio" });
      return;
    }

    try {
      await apiFetch("/api/Teams", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ name: newTeamName }),
      });

      setAlert({ type: "success", message: `Equipo ${newTeamName} creado correctamente` });
      setNewTeamName("");
      setIsCreating(false);
      setPageNumber(1);

      const data = (await apiFetch(
        `/api/Teams?pageNumber=1&pageSize=${pageSize}&sortBy=Name&sortDirection=${sortDirection}`
      )) as PagedResponse<Team>;

      setTeams(data.data);
      setTotalPages(data.totalPages);
    } catch {
      setAlert({ type: "error", message: "Error al crear el equipo" });
    }

    setTimeout(() => setAlert(null), 3000);
  }

  async function handleUpdate() {
    if (!editingTeamId) return;

    if (!editingName.trim()) {
      setAlert({ type: "warning", message: "El nombre no puede estar vacío" });
      return;
    }

    try {
      await apiFetch(`/api/Teams/${editingTeamId}`, {
        method: "PUT",
        body: JSON.stringify({ id: editingTeamId, name: editingName }),
      });

      setTeams((prev) =>
        prev.map((t) => (t.id === editingTeamId ? { ...t, name: editingName } : t))
      );

      setAlert({ type: "update", message: "Equipo actualizado correctamente" });
      setEditingTeamId(null);
      setEditingName("");
    } catch {
      setAlert({ type: "error", message: "Error al actualizar el equipo" });
    }

    setTimeout(() => setAlert(null), 3000);
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("¿Seguro que deseas eliminar este equipo?");
    if (!confirmDelete) return;

    try {
      const deletedTeam = teams.find((t) => t.id === id);
      await apiFetch(`/api/Teams/${id}`, { method: "DELETE" });
      setTeams((prev) => prev.filter((t) => t.id !== id));
      setAlert({ type: "error", message: `Equipo ${deletedTeam?.name ?? ""} eliminado correctamente` });
      setTimeout(() => setAlert(null), 3000);
    } catch {
      setAlert({ type: "error", message: "Error al eliminar el equipo" });
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
          setAlert({ type: "error", message: err.message });
        } else {
          setAlert({ type: "error", message: "Error desconocido" });
        }
        setTimeout(() => setAlert(null), 3000);
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, [pageNumber, pageSize, sortDirection]);

  return (
    <>
      <style>{`
        .tm-wrapper {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(10px);
          font-family: 'Inter', sans-serif;
        }

        .tm-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .tm-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .tm-divider {
          height: 2px;
          background: linear-gradient(90deg, #f5c518, transparent);
          margin-bottom: 28px;
          border-radius: 2px;
        }

        .tm-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .tm-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tm-select {
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

        .tm-select:hover, .tm-select:focus { border-color: rgba(245,197,24,0.5); }
        .tm-select option { background: #1a1a1a; }

        .tm-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          letter-spacing: 0.5px;
          transition: opacity 0.2s, transform 0.15s;
        }

        .tm-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        .tm-btn-add {
          background: rgba(245,197,24,0.1);
          color: #f5c518;
          border-color: rgba(245,197,24,0.4);
        }

        .tm-btn-sort {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.12);
        }

        .tm-btn-save {
          background: rgba(0,220,100,0.1);
          color: #00dc64;
          border-color: rgba(0,220,100,0.4);
        }

        .tm-btn-update {
          background: rgba(245,197,24,0.1);
          color: #f5c518;
          border-color: rgba(245,197,24,0.4);
        }

        .tm-btn-delete {
          background: rgba(255,60,60,0.1);
          color: #ff4d4d;
          border-color: rgba(255,60,60,0.35);
        }

        .tm-create-box {
          margin-bottom: 24px;
          padding: 20px;
          background: rgba(245,197,24,0.04);
          border: 1px solid rgba(245,197,24,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tm-input {
          padding: 8px 14px;
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          flex: 1;
          min-width: 200px;
          transition: border-color 0.2s;
        }

        .tm-input:focus { border-color: rgba(245,197,24,0.5); }
        .tm-input::placeholder { color: rgba(255,255,255,0.25); }

        .tm-loading {
          text-align: center;
          color: rgba(255,255,255,0.35);
          padding: 40px 0;
          letter-spacing: 2px;
          font-size: 13px;
        }

        .tm-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        .tm-table thead tr {
          background: rgba(245,197,24,0.08);
        }

        .tm-table th {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(245,197,24,0.2);
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: left;
        }

        .tm-table th.center { text-align: center; }

        .tm-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
          font-size: 14px;
        }

        .tm-table tbody tr { transition: background 0.15s; }
        .tm-table tbody tr:hover { background: rgba(245,197,24,0.04); }

        .tm-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
      `}</style>

      <div className="tm-wrapper">
        {/* Header */}
        <div className="tm-header">
          <span style={{ fontSize: 28 }}>🛡️</span>
          <h2 className="tm-title">Equipos</h2>
        </div>
        <div className="tm-divider" />

        {alert && <AlertMessage type={alert.type} message={alert.message} />}

        {/* Controles */}
        <div className="tm-controls">
          <label className="tm-label">
            Por página:
            <select
              className="tm-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
            >
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="tm-btn tm-btn-sort"
              onClick={() => { setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC"); setPageNumber(1); }}
            >
              {sortDirection === "ASC" ? "⬆ A → Z" : "⬇ Z → A"}
            </button>
            <button className="tm-btn tm-btn-add" onClick={() => setIsCreating(!isCreating)}>
              ➕ Agregar Equipo
            </button>
          </div>
        </div>

        {/* Formulario crear */}
        {isCreating && (
          <div className="tm-create-box">
            <input
              className="tm-input"
              type="text"
              placeholder="Nombre del equipo..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button className="tm-btn tm-btn-save" onClick={handleCreate}>
              ✔ Guardar
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <p className="tm-loading">⚽ Cargando equipos...</p>}

        {/* Tabla */}
        {!loading && (
          <table className="tm-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    {editingTeamId === team.id ? (
                      <input
                        className="tm-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    ) : (
                      team.name
                    )}
                  </td>
                  <td>
                    <div className="tm-actions">
                      <button
                        className="tm-btn tm-btn-update"
                        onClick={() => { setEditingTeamId(team.id); setEditingName(team.name); }}
                      >
                        ✏ Editar
                      </button>
                      {editingTeamId === team.id && (
                        <button className="tm-btn tm-btn-save" onClick={handleUpdate}>
                          ✔ Actualizar
                        </button>
                      )}
                      <button className="tm-btn tm-btn-delete" onClick={() => handleDelete(team.id)}>
                        🗑 Eliminar
                      </button>
                    </div>
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
    </>
  );
}
