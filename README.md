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
