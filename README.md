# CineLog 🎬

Tu catálogo personal de películas y series.

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Astro + React | Astro para routing/SSG, React islands para interactividad |
| Estilos | Tailwind CSS | Utility-first, rápido de implementar, responsive por defecto |
| Auth + DB | Supabase | BaaS gratuito, PostgreSQL + Auth en un solo servicio, SDK JS oficial |
| Deploy | Vercel | Integración nativa con Astro, deploy automático desde GitHub |

## Funcionalidades

- Registro e inicio de sesión de usuarios (email/password)
- Catálogo personal de películas y series con CRUD completo
- Estados: Viendo / Completado / Por ver / Abandonado
- Puntuación (1–10) y reseña personal
- Filtros por tipo (película/serie) y por estado
- Búsqueda por título
- Estadísticas del catálogo (totales por tipo y estado)
- Edición de perfil (nombre de usuario)

La app corre en `http://localhost:4321`

## URL de produccion

https://tp-front-jet.vercel.app/

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de produccion
npm run lint       # Ejecutar ESLint
npm run test       # Tests unitarios (Vitest)
npm run test:e2e   # Tests E2E (Playwright)
```

## Pipeline CI/CD

El proyecto usa GitHub Actions para CI/CD. En cada push o PR a `main` se ejecuta:

1. **Lint** — ESLint sobre `src/`
2. **Tests** — Vitest (tests unitarios)
3. **Build** — `astro build`
4. **Deploy** — Solo en push a `main`, deploy automatico a Vercel

Ver detalles en [CALIDAD.md](CALIDAD.md).

## Convencion de ramas

- `feature/nombre-feature` — nuevas funcionalidades
- `fix/nombre-bug` — correccion de bugs
- `chore/nombre-tarea` — mantenimiento, configuracion, CI, docs
