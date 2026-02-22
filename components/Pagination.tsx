"use client";

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pageNumber,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
      <button
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={pageNumber === 1}
        style={{
          padding: "6px 12px",
          backgroundColor: "#222",
          color: "white",
          border: "1px solid #555",
          cursor: "pointer",
        }}
      >
        Anterior
      </button>

      <span style={{ alignSelf: "center" }}>
        Página {pageNumber} de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={pageNumber === totalPages}
        style={{
          padding: "6px 12px",
          backgroundColor: "#222",
          color: "white",
          border: "1px solid #555",
          cursor: "pointer",
        }}
      >
        Siguiente
      </button>
    </div>
  );
}