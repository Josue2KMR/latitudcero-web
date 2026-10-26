import type { Metadata } from "next";
import { FormRegistro } from "@/components/Formularios";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function Registro({ searchParams }: { searchParams: Promise<{ siguiente?: string }> }) {
  const { siguiente = "/tienda" } = await searchParams;
  return <section className="seccion"><div className="contenedor" style={{ maxWidth: 680 }}><FormRegistro siguiente={siguiente} /></div></section>;
}
