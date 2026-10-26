"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { accionCheckout, accionIngresar, accionRegistrar } from "@/app/acciones";
import { formatoPesos } from "@/domain/cafe";

function Campo({ id, label, error, ...rest }: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="campo" data-error={!!error}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      {error && <span className="error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}

export function FormIngresar({ siguiente }: { siguiente: string }) {
  const [estado, accion, enviando] = useActionState(accionIngresar, null);
  return (
    <form action={accion} className="caja pila" noValidate>
      <h1 style={{ fontSize: "2rem" }}>Ingresar</h1>
      <input type="hidden" name="siguiente" value={siguiente} />
      <div role="alert">{estado?.error && <div className="aviso error">{estado.error}</div>}</div>
      <Campo id="email" label="Email" type="email" autoComplete="email" required />
      <Campo id="clave" label="Contraseña" type="password" autoComplete="current-password" required />
      <button className="boton" disabled={enviando}>{enviando ? "Ingresando…" : "Ingresar"}</button>
      <p className="suave">¿No tenés cuenta? <Link href={`/registro?siguiente=${encodeURIComponent(siguiente)}`}>Creala acá</Link></p>
      <details className="suave" style={{ fontSize: ".9rem" }}>
        <summary>Cuentas de prueba (modo desarrollo)</summary>
        <p className="dato" style={{ fontSize: ".8rem", marginTop: 8, lineHeight: 1.8 }}>cliente@ejemplo.uy · Cliente2026!<br />admin@latitudcero.uy · Latitud2026!<br />operador@latitudcero.uy · Operador2026!</p>
      </details>
    </form>
  );
}

export function FormRegistro({ siguiente }: { siguiente: string }) {
  const [estado, accion, enviando] = useActionState(accionRegistrar, null);
  const e = estado?.errores ?? {};
  return (
    <form action={accion} className="caja pila" noValidate>
      <h1 style={{ fontSize: "2rem" }}>Crear cuenta</h1>
      <p className="suave">Necesitás una cuenta para comprar: guarda tus pedidos y el seguimiento.</p>
      <input type="hidden" name="siguiente" value={siguiente} />
      <div className="dos-col">
        <Campo id="nombre" label="Nombre" autoComplete="given-name" error={e.nombre} />
        <Campo id="apellido" label="Apellido" autoComplete="family-name" error={e.apellido} />
        <Campo id="email" label="Email" type="email" autoComplete="email" error={e.email} />
        <Campo id="celular" label="Celular" type="tel" autoComplete="tel" placeholder="099 123 456" error={e.celular} />
        <Campo id="clave" label="Contraseña" type="password" autoComplete="new-password" error={e.clave} />
        <Campo id="clave2" label="Repetir contraseña" type="password" autoComplete="new-password" error={e.clave2} />
      </div>
      <div className="campo" data-error={!!e.terminos}>
        <label className="check" style={{ fontWeight: 400 }}><input type="checkbox" name="terminos" aria-invalid={!!e.terminos || undefined} /> <span>Acepto los términos y la política de privacidad.</span></label>
        {e.terminos && <span className="error">{e.terminos}</span>}
      </div>
      <button className="boton" disabled={enviando}>{enviando ? "Creando…" : "Crear cuenta"}</button>
    </form>
  );
}

export function FormCheckout({ total, costoEnvio, proveedor }: { total: number; costoEnvio: number; proveedor: "mock" | "shopify" }) {
  const [estado, accion, enviando] = useActionState(accionCheckout, null);
  const [entrega, setEntrega] = useState<"envio" | "retiro">("envio");
  const envio = entrega === "envio" ? costoEnvio : 0;
  return (
    <form action={accion} className="pila" noValidate>
      {proveedor === "mock" && (
        <>
          <fieldset>
            <legend>¿Cómo lo recibís?</legend>
            <label className="check"><input type="radio" name="entrega" value="envio" checked={entrega === "envio"} onChange={() => setEntrega("envio")} /> <span><strong>Envío a domicilio</strong><br /><span className="suave">Courier a todo Uruguay, con número de seguimiento</span></span></label>
            <label className="check"><input type="radio" name="entrega" value="retiro" checked={entrega === "retiro"} onChange={() => setEntrega("retiro")} /> <span><strong>Retiro en el punto de entrega</strong><br /><span className="suave">Sin costo. Te damos un ticket con código para retirar</span></span></label>
          </fieldset>
          {entrega === "envio" && (
            <fieldset>
              <legend>Dirección</legend>
              <div className="dos-col">
                <div className="campo"><label htmlFor="departamento">Departamento</label>
                  <select id="departamento" name="departamento" defaultValue="Montevideo">
                    {["Artigas","Canelones","Cerro Largo","Colonia","Durazno","Flores","Florida","Lavalleja","Maldonado","Montevideo","Paysandú","Río Negro","Rivera","Rocha","Salto","San José","Soriano","Tacuarembó","Treinta y Tres"].map((d) => <option key={d}>{d}</option>)}
                  </select></div>
                <Campo id="localidad" label="Ciudad o barrio" autoComplete="address-level2" />
                <Campo id="calle" label="Calle y número" autoComplete="street-address" />
              </div>
            </fieldset>
          )}
          <fieldset>
            <legend>Pago de prueba</legend>
            <p className="suave" style={{ fontSize: ".92rem" }}>Modo desarrollo: elegí qué respuesta simula Mercado Pago.</p>
            <label className="check"><input type="radio" name="resultado" value="aprobado" defaultChecked /> Pago aprobado</label>
            <label className="check"><input type="radio" name="resultado" value="rechazado" /> Tarjeta rechazada</label>
          </fieldset>
        </>
      )}
      <div className="caja pila" style={{ gap: 6 }}>
        {proveedor === "mock" && <div className="resumen-fila"><span>Envío</span><span>{envio ? formatoPesos(envio) : "Sin costo"}</span></div>}
        <div className="resumen-fila total"><span>Total</span><span>{formatoPesos(total + envio)}</span></div>
      </div>
      <div role="alert">{estado?.error && <div className="aviso error">{estado.error}</div>}</div>
      <button className="boton" disabled={enviando}>{enviando ? "Procesando…" : proveedor === "shopify" ? "Ir al pago seguro" : "Pagar con Mercado Pago (prueba)"}</button>
      {proveedor === "shopify" && <p className="suave" style={{ fontSize: ".9rem" }}>Te llevamos al checkout de Shopify: ahí elegís envío o retiro y pagás con Mercado Pago.</p>}
    </form>
  );
}
