# Fit2Fit

Fases 1 y 2 del plan: base visual responsive (modo día y noche), login con Google, perfil y CRUD de medidas con historial, reglas de Firestore.

## Requisitos previos (Fase 0)
1. Proyecto en Firebase: activar **Authentication → Google**, **Firestore** y **Hosting**.
2. Registrar una app web y copiar su configuración a `apps/web/.env.local` (ver `.env.example`).
3. Authentication → Configuración → Dominios autorizados: `localhost` y el dominio de Hosting.

## Desarrollo
```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

## Despliegue (GitHub Pages)
1. Repositorio **público** en GitHub llamado `fit2fit`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → pestaña **Variables**: crear `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
4. `git push` a `main`: el workflow compila y publica en `https://USUARIO.github.io/fit2fit/`.
5. Firebase → Authentication → Configuración → Dominios autorizados: agregar `USUARIO.github.io`.

Las reglas de Firestore se publican aparte: `firebase deploy --only firestore:rules,firestore:indexes`.

## Pendiente de verificar
- Probar `firestore.rules` con el emulador de Firebase (aislamiento entre dos cuentas y validación de rangos).
- Las claves del cliente de Firebase son públicas por diseño; la seguridad está en las reglas.

## Estructura
- `apps/web`: React + TypeScript + Vite.
- `firestore.rules`: reglas por usuario (`users/{uid}/...`).
- Siguiente: Worker de Cloudflare para Groq (Fase 5) y registro por pasos con la entrevista.
