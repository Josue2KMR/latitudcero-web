import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormIngresar } from "@/components/Formularios";
import { usuarioActual } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Ingresar" };

export default async function Ingresar({ searchParams }: { searchParams: Promise<{ siguiente?: string }> }) {
  const { siguiente = "/" } = await searchParams;
  if (await usuarioActual()) redirect(siguiente.startsWith("/") ? siguiente : "/");
  return <section className="seccion"><div className="contenedor" style={{ maxWidth: 480 }}><FormIngresar siguiente={siguiente} /></div></section>;
}
