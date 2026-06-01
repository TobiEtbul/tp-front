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
