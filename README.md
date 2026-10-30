# hive-web

Sitio del ecosistema Hive: HiveShock, HiveBuzz y los ports compatibles. Se genera solo a partir de los
**GitHub Releases** de cada repo, así que publicar una versión es lo único que hay que hacer para que la web cambie.

## Cómo se mantiene al día

```
Tag vX.Y.Z en una app ──▶ release.yml publica el Release
                              │
                              ▼
               notify-web.yml (en ese repo) ──repository_dispatch──▶ hive-web/deploy.yml
                                                                         │ lee la API de GitHub
                                                                         ▼
                                                              build estático ──▶ GitHub Pages
```

Tres capas para que nunca se vea una versión vieja:

1. **Rebuild por evento.** Cada repo avisa a `hive-web` cuando publica, edita o borra un release. El sitio se
   reconstruye y se publica en 1 o 2 minutos.
2. **Refresco en el navegador.** Al abrir una página con descargas, el navegador pregunta a GitHub por el último
   release. Si es más nuevo que el del build, cambia versión, fecha y enlaces al momento (sin esperar el redeploy).
   Usa la API pública sin token (60 consultas por hora por visitante, con caché de 10 minutos).
3. **Build programado** cada 6 horas por si algún aviso se pierde. También actualiza los contadores de descargas.

Si GitHub no responde durante un build en CI, el build falla y sigue publicada la versión anterior.
En local, sin red, se usa `src/data/snapshot.json`.

## Puesta en marcha (una sola vez)

1. **Crea el repo** `Lexharden/hive-web`, sube este proyecto a `main`.
2. **Activa Pages:** Settings → Pages → Source: *GitHub Actions*.
3. **Dominio:** en tu DNS crea `hive.yafel.dev` como `CNAME` a `lexharden.github.io`. En Settings → Pages escribe
   el dominio y activa *Enforce HTTPS*. (El archivo `public/CNAME` ya lo trae.)
   - `hiveshock.yafel.dev` aparece en el «Acerca de» de HiveShock: redirígelo con un 301 a
     `https://hive.yafel.dev/hiveshock/` desde Nginx Proxy Manager (o tu DNS si ofrece redirecciones).
     Haz lo mismo con `hivebuzz.yafel.dev` → `/hivebuzz/`.
   - ¿Otro dominio? Cambia `public/CNAME`, `public/robots.txt` y la variable `SITE_URL` del repo.
4. **Token para los avisos:** crea un *fine-grained personal access token* en GitHub:
   - Repository access: solo `Lexharden/hive-web`
   - Permissions → Contents: **Read and write** (es lo que pide `repository_dispatch`)
   - Caducidad: la máxima que acepte tu cuenta; pon un recordatorio para renovarlo.
5. En **cada repo de app y port** (HiveShock-Avalonia, HiveBuzz, Shipwright-HiveShock, 2ship2harkinian-HiveShock):
   - guarda el token como secreto `WEB_DISPATCH_TOKEN`
   - copia `integracion/notify-web.yml` en `.github/workflows/notify-web.yml`
6. Lanza *Deploy* a mano desde Actions la primera vez.

## Desarrollo local

```bash
npm install
npm run dev              # http://localhost:4321
npm run build            # genera dist/
GITHUB_TOKEN=... npm run snapshot   # actualiza el snapshot de respaldo con los releases reales
```

Requiere Node 22.12 o superior.

## Dónde se cambia cada cosa

| Quiero… | Archivo |
|---|---|
| Cambiar enlaces (Discord, Ko-fi, YouTube…) | `src/config/site.ts` → `site.links` |
| Cambiar textos de una app | `src/config/site.ts` → `apps` y `src/pages/<app>/index.astro` |
| **Añadir un juego** | `src/config/site.ts` → `games`. Si tiene repo con releases, pon `repo` y la descarga aparece sola |
| **Añadir una app nueva** | Añádela a `apps`, copia `src/pages/hivebuzz/` como plantilla y añádela al menú en `Header.astro` |
| Colores y tipografía | `src/styles/global.css` (tokens al inicio) |
| Cómo se nombran los archivos de descarga | `src/lib/assets.ts` |
| Patrocinadores | `src/data/support.json` → `sponsors` (logos en `public/img/sponsors/`) |
| Logo e insignias de nivel | `src/lib/brand.js`; `npm run brand` regenera los SVG de `public/brand/` |
| Qué hace el apoyo (Desarrollo, Pruebas…) | `src/data/support.json` → `work` |
| Quitar o renombrar a un donador | `src/data/donors.json` (lo demás lo llena el bot) |
| PayPal, Ko-fi, cuentas SPEI, metas y niveles | `src/data/support.json` |
| Número de efectos por juego | Se lee solo de los perfiles de HiveShock; `effects` en `site.ts` es el respaldo |
| Aviso legal | `src/pages/legal.astro`; cambia `site.legalUpdated` al editarlo |
| Ocultar las descargas de los ports | `site.showPortDownloads = false` |

### Nombres de archivo que entiende la web

La clasificación busca palabras en el nombre del archivo del release, así que mientras sigas los patrones
actuales no hay que tocar nada:

- Plataforma: `win`, `win64`, `.exe`, `.msi` → Windows · `osx`, `macos`, `.dmg` → macOS ·
  `linux`, `.AppImage`, `.deb`, `.rpm` → Linux · `android`, `.apk` → Android
- Arquitectura: `arm64` / `aarch64` o `x64` / `amd64` / `x86_64`
- Se ocultan: firmas `.sig`, `latest.json`, paquetes `-update` y `.app.tar.gz` (son para el autoactualizador)
- `SHA256SUMS.txt` aparece como enlace de verificación

Una versión con guion (`v2.0.0-beta.1`) marcada como *pre-release* se muestra aparte como versión de prueba y nunca
reemplaza al botón principal.

## Para quien consuma los datos

`/releases.json` publica la última versión y archivos de cada app y port. Sirve para un bot de Discord que anuncie
versiones o para que las apps comprueben actualizaciones contra tu dominio.

## Easter eggs

Viven en `src/scripts/easter.ts` y no afectan el uso normal:

- `↑ ↑ ↓ ↓ ← → ← → B A`: enjambre de abejas y «+30 vidas»
- Escribir `iddqd`, `hesoyam` o `idkfa` en cualquier página
- Cinco clics rápidos en el logo de la portada: descarga eléctrica
- Clics en los logos de HiveShock o HiveBuzz: salen abejas; a la séptima, colmena enfadada
- Tecla `P` con la consola del inicio a la vista: pausa
- La página 404 y un mensaje para quien abre la consola del navegador

## Apoyo al descargar

Cada panel de descarga lleva una franja para apoyar y, al pulsar una descarga, se abre un agradecimiento con el botón
de donación (como mucho una vez cada 10 minutos por visitante). La descarga empieza igual aunque se cierre.

## Cómo poner a alguien en el muro (con usuario, canales y nivel)

Cada donador en `src/data/donors.json` se ve así:

```json
{
  "name": "Mint Kookie",
  "tier": "obrera",
  "since": "2026-10",
  "links": { "tiktok": "mint.kookie", "twitch": "mintkookie", "youtube": "MintKookie" }
}
```

- `tier`: `abeja` (una donación), `obrera` (apoyo cada mes) o `reina` (patrocinio). Cambia la insignia, el color y el orden.
- `links`: redes opcionales: `tiktok`, `twitch`, `youtube`, `kick`, `instagram`, `x`. Solo el usuario, sin `@` ni enlace.
- `since`: mes en que empezó a apoyar (`AAAA-MM`).

Tres formas de llenarlo:

1. **Formulario de n8n** (lo normal para PayPal y SPEI): *Acción* «Registrar donación», nombre, «Sí» en aparecer,
   nivel y los canales que te dio. En los canales puedes pegar el enlace del perfil o el @usuario: se limpian solos.
2. **Actualizar a alguien** que ya está (por ejemplo, donó por Ko-fi y luego te mandó su TikTok): mismo formulario con
   *Acción* «Actualizar datos», el mismo nombre y los canales nuevos. También sirve para cambiarle el nivel.
3. **A mano en GitHub**: abre `src/data/donors.json`, pulsa el lápiz, añade o edita la entrada y guarda (*Commit changes*).
   La web se publica sola en un par de minutos.

Para quitar a alguien: formulario con *Acción* «Quitar del muro», o borra su entrada en GitHub.
Ko-fi mensual entra solo como Obrera; Ko-fi de una vez, como Abeja.

## Donaciones y muro de donadores

```
Ko-fi ──webhook──▶ n8n «Ko-fi → Hive» ──┐
                                         ├─ repository_dispatch «donation» ─▶ donation.yml
Tú, desde el cel ─▶ n8n «Registrar donación» (formulario con contraseña) ─┘        │
                                                       scripts/add-donation.mjs ◀───┘
                                                       actualiza src/data/donors.json
                                                       y lanza deploy.yml
```

- **Ko-fi:** automático. Si la persona marcó su donación como pública, su nombre aparece en el muro.
- **PayPal y SPEI:** cuando confirmes el pago, llena el formulario de n8n (nombre, método, monto y si aceptó aparecer).
- **Qué se guarda:** solo el nombre de quien aceptó aparecer y el mes. Nunca montos por persona, correos ni mensajes.
  Con `"trackTotals": true` en `support.json` se guarda además un total general para llenar las barras de metas
  (en porcentaje). Viene apagado.
- **Filtros:** nombres con enlaces o groserías quedan como anónimos; los repetidos no se duplican; un aviso que llegue
  dos veces se ignora.

### Configurar (una vez)

1. En n8n, **importa** `integracion/n8n/kofi-a-hive.json` y `integracion/n8n/registrar-donacion.json`.
2. Crea una credencial **Header Auth**: nombre `Authorization`, valor `Bearer <token>`. Usa el mismo token
   fine-grained de `WEB_DISPATCH_TOKEN` (Contents de lectura y escritura sobre `hive-web`). Asígnala al nodo
   «Avisar a hive-web» de los dos flujos.
3. **Ko-fi:** en el nodo «Validar y preparar» pega tu *Verification Token* (Ko-fi → Settings → API → Webhooks →
   Advanced). Activa el flujo y pega en Ko-fi la URL de producción del webhook
   (`https://n8n.yafel.dev/webhook/kofi-hive`). Usa *Send test* para probar: los avisos de prueba son públicos y con
   nombre de ejemplo, así que bórralo de `donors.json` después.
4. **Formulario:** en el nodo «Formulario» crea una credencial Basic Auth con usuario y contraseña. Activa el flujo y
   guarda la URL de producción del formulario en tu teléfono.
5. Opcional: activa los nodos «Aviso en Discord» con el webhook de un canal privado para enterarte de cada donación.

La ruta `/webhook/kofi-hive` de n8n tiene que ser accesible desde internet para que Ko-fi llegue.
