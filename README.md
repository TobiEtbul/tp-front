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

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd tp-front
npm install
```

### 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto gratuito
2. En el SQL Editor, ejecutar el contenido de `supabase/schema.sql`

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Completar `.env` con los valores de tu proyecto Supabase
(los encontrás en Settings → API):

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Correr en desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:4321`

## Estructura del proyecto

```
src/
├── components/
│   ├── auth/           # LoginForm, RegisterForm
│   ├── catalog/        # CatalogApp, MovieCard, MovieForm
│   └── profile/        # ProfileApp
├── layouts/
│   └── Layout.astro    # Layout base HTML
├── lib/
│   └── supabase.ts     # Cliente Supabase y tipos TypeScript
└── pages/
    ├── index.astro     # Landing page
    ├── login.astro
    ├── register.astro
    ├── catalog.astro   # App principal (protegida)
    └── profile.astro   # Perfil de usuario (protegido)
supabase/
└── schema.sql          # Schema de la base de datos
```

## Deploy en Vercel

1. Subir el repositorio a GitHub
2. Conectar el repo en [vercel.com](https://vercel.com)
3. Agregar las variables de entorno en Vercel (Settings → Environment Variables)
4. Deploy automático en cada push a `main`

## Ramas del repositorio

| Rama | Descripción |
|---|---|
| `main` | Versión funcional y desplegada |
| `develop` | Integración de features antes de pasar a main |
| `feature/tobias` | Rama de desarrollo — Tobias |
| `feature/compañero` | Rama de desarrollo — compañero |
