import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <h1>Mundialito Corporativo</h1>

      <ul style={{ marginTop: "20px" }}>
        <li>
          <Link href="/teams">Equipos</Link>
        </li>
        <li>
          <Link href="/matches">Partidos</Link>
        </li>
        <li>
          <Link href="/standings">Tabla de Posiciones</Link>
        </li>
        <li>
          <Link href="/scorers">Goleadores</Link>
        </li>
      </ul>
    </main>
  );
}