/** Íconos de trazo simple, 24px. Decorativos: siempre con aria-hidden; el texto lo pone quien los usa. */
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconoUsuario = () => (<svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>);
export const IconoBolsa = () => (<svg {...base}><path d="M5 8h14l-1 13H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>);
export const IconoPin = () => (<svg {...base}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
export const IconoMontana = () => (<svg {...base}><path d="M2 20l7-12 4 6 3-4 6 10H2z" /></svg>);
export const IconoHoja = () => (<svg {...base}><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19l7-7" /></svg>);
export const IconoGota = () => (<svg {...base}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></svg>);
export const IconoFinca = () => (<svg {...base}><path d="M3 21V10l9-6 9 6v11" /><path d="M9 21v-6h6v6" /></svg>);
export const IconoLlama = () => (<svg {...base}><path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 2 4 4 .5-3 0-5 0-8z" /></svg>);
export const IconoCheck = () => (<svg {...base} strokeWidth={2.4}><path d="M5 12l5 5 9-10" /></svg>);
