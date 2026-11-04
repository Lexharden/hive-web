/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** ID de medición de GA4 (G-XXXXXXXXXX). Opcional: sin él no se carga analítica. */
  readonly PUBLIC_GA_ID?: string;
}

interface Window {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
}
