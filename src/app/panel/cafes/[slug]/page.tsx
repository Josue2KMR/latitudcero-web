import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditorFicha } from "@/components/EditorFicha";
import { usuarioActual } from "@/lib/auth/sesion";
import { comercio } from "@/lib/commerce";

export default async function EditarCafe({ params }: { params: Promise<{ slug: string }> }) {
  const u = await usuarioActual();
  if (u?.rol !== "admin") redirect("/panel/pedidos");
  const cafe = await comercio().obtenerCafe((await params).slug);
  if (!cafe) notFound();
  return (
    <>
      <div className="fila"><h1 className="crece" style={{ fontSize: "2rem" }}>Ficha de {cafe.nombre}</h1><Link className="boton chico secundario" href={`/cafe/${cafe.slug}`}>Ver en la tienda</Link></div>
      <EditorFicha cafe={cafe} />
    </>
  );
}
