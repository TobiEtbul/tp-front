# CALIDAD.md — CineLog

## Estrategia general

La estrategia de calidad se basa en tres pilares: **prevenir errores antes del merge** (lint + tests automatizados en CI), **validar comportamiento real** (tests unitarios sobre logica de negocio y E2E sobre flujos criticos), y **desplegar solo codigo verificado** (el deploy a Vercel solo ocurre si todos los pasos anteriores pasan).

El enfoque es pragmatico: en lugar de buscar cobertura maxima, priorizo testear la logica de negocio que es mas propensa a romperse (filtrado, ordenamiento, validaciones) y los flujos criticos del usuario (autenticacion, acceso al catalogo).

## Herramientas seleccionadas

| Herramienta | Uso | Por que esta y no otra |
|---|---|---|
| **Vitest** | Tests unitarios | Compatibilidad nativa con ESM y TypeScript sin configuracion adicional. Jest requiere mas setup para proyectos con `"type": "module"`. Vitest es mas rapido y se integra con el ecosistema Vite/Astro. |
| **Playwright** | Tests E2E | Mas estable y rapido que Cypress para proyectos con SSR. Soporta multiples navegadores out-of-the-box. La API es mas directa para testear flujos de navegacion. |
| **ESLint** | Linting | Estandar de la industria para TypeScript/React. Configurado con reglas de `@typescript-eslint` y `eslint-plugin-react` para detectar errores comunes (variables no usadas, keys faltantes en listas, uso de `any`). |
| **GitHub Actions** | CI/CD | Integrado directamente con el repositorio, sin necesidad de servicios externos. El workflow se dispara automaticamente en cada push/PR a main. |
| **Vercel** | Deploy | Integracion nativa con Astro. Deploy automatico desde el pipeline de CI solo si lint, tests y build pasan exitosamente. |

Se evaluo Jest como alternativa a Vitest, pero requeria configuracion adicional para ESM y era mas lento en ejecucion. Se evaluo Cypress como alternativa a Playwright, pero su instalacion es mas pesada y el soporte multi-navegador es de pago.

## Tests desarrollados

### Tests unitarios (Vitest) — `src/lib/catalog-utils.test.ts`

| Test | Caso de uso | Comportamiento validado |
|---|---|---|
| `filterEntries` — sin filtros | Usuario ve todo el catalogo | Devuelve todas las entradas cuando type=all, status=all, search="" |
| `filterEntries` — por tipo pelicula | Usuario filtra solo peliculas | Solo retorna entradas con type="movie" |
| `filterEntries` — por tipo serie | Usuario filtra solo series | Solo retorna entradas con type="series" |
| `filterEntries` — por estado completed | Usuario ve completados | Solo retorna entradas con status="completed" |
| `filterEntries` — busqueda case insensitive | Usuario busca por titulo | Encuentra "Breaking Bad" buscando "breaking" |
| `filterEntries` — filtros combinados | Usuario filtra por tipo + estado + texto | Solo retorna las que cumplen todos los criterios simultaneamente |
| `filterEntries` — sin resultados | Busqueda sin coincidencias | Retorna array vacio |
| `sortEntries` — newest | Orden por defecto | Las entradas mas recientes aparecen primero |
| `sortEntries` — oldest | Orden cronologico | Las entradas mas antiguas aparecen primero |
| `sortEntries` — title | Orden alfabetico | Ordena A-Z usando locale espanol |
| `sortEntries` — rating | Orden por puntuacion | Mayor rating primero, null se trata como 0 |
| `sortEntries` — inmutabilidad | Integridad de datos | No muta el array original al ordenar |
| `computeStats` — calculo correcto | Dashboard de estadisticas | Cuenta totales, peliculas, series y completados correctamente |
| `computeStats` — array vacio | Catalogo vacio | Devuelve todos los contadores en 0 |
| `validateRating` — valores validos | Validacion de input del usuario | Acepta null y enteros entre 1-10 |
| `validateRating` — valores invalidos | Validacion de input del usuario | Rechaza 0, 11, y decimales |
| `validateYear` — valores validos | Validacion de input del usuario | Acepta null y enteros entre 1888-2030 |
| `validateYear` — valores invalidos | Validacion de input del usuario | Rechaza anos fuera de rango |

### Tests E2E (Playwright) — `e2e/catalog-flow.spec.ts`

| Test | Caso de uso | Comportamiento validado |
|---|---|---|
| Redireccion a login | Usuario no autenticado intenta acceder a /catalog | Es redirigido automaticamente a /login |
| Formulario de login visible | Usuario accede a /login | Muestra campos de email, password y boton "Ingresar" |
| Error con credenciales invalidas | Usuario ingresa datos incorrectos | Muestra mensaje "Email o contraseña incorrectos" |
| Pagina principal | Usuario accede a / | Muestra el titulo "CineLog" |

## Casos de uso criticos

Los flujos priorizados para testing fueron:

1. **Autenticacion**: es la puerta de entrada a toda la aplicacion. Si el login no funciona o la redireccion de usuarios no autenticados falla, la app es inutilizable. Por eso el test E2E cubre la redireccion y el formulario de login.

2. **Filtrado y ordenamiento del catalogo**: es la funcionalidad central que el usuario usa constantemente. Un bug en el filtrado (ej: filtrar por "peliculas" muestra series) seria confuso y romperia la confianza. La logica fue extraida a funciones puras (`catalog-utils.ts`) para poder testearla exhaustivamente con tests unitarios.

3. **Validacion de datos**: ratings fuera de rango o años invalidos corrompen la base de datos. Las funciones de validacion se testean con casos limite.

No se priorizo testear el CRUD de Supabase porque depende de un servicio externo y los tests unitarios no deberian depender de conexion a internet/base de datos real.

## Pipeline de CI/CD

El pipeline esta definido en `.github/workflows/ci-cd.yml` y se ejecuta en cada push o PR a `main`.

### Pasos del pipeline (secuenciales):

```
lint → test → build → deploy
```

1. **Lint**: ejecuta ESLint sobre `src/`. Si hay errores de linting, el pipeline falla aqui y no se ejecutan los tests. Esto evita gastar tiempo corriendo tests sobre codigo que tiene problemas basicos de calidad.

2. **Tests unitarios**: ejecuta `vitest run`. Si algun test falla, el pipeline se detiene. Esto garantiza que la logica de negocio funciona correctamente antes de intentar el build.

3. **Build**: ejecuta `astro build`. Valida que el proyecto compila sin errores de TypeScript ni problemas de importacion. Usa las variables de entorno de Supabase desde los secrets de GitHub.

4. **Deploy**: solo se ejecuta si estamos en `main` (no en PRs) y todos los pasos anteriores pasaron. Usa el CLI de Vercel para deployar a produccion.

### Decisiones de diseno:

- **Los pasos son secuenciales** (`needs`): si el lint falla, no tiene sentido correr tests. Si los tests fallan, no tiene sentido buildear. Esto ahorra minutos de CI.
- **Deploy solo en push a main**: los PRs corren lint/test/build para validar, pero no deployean. Solo cuando el PR se mergea a main se hace deploy. Esto evita deploys accidentales desde branches.
- **Secrets para variables sensibles**: las credenciales de Supabase y Vercel estan en GitHub Secrets, no hardcodeadas.

## Limitaciones y deuda tecnica

- **Tests E2E no cubren el flujo autenticado completo**: idealmente se testaria login real → crear entrada → verificar que aparece → editarla → eliminarla. Esto requiere un usuario de prueba en Supabase y manejo de estado entre tests, lo cual agrega complejidad. Se acepto como limitacion consciente.

- **No hay test de integracion con Supabase**: los tests unitarios validan la logica de negocio aislada, pero no verifican que las queries a Supabase funcionen correctamente. Un mock de Supabase seria fragil y daria falsa confianza.

- **Coverage no esta configurado**: se podria agregar `vitest --coverage` para medir cobertura, pero para el alcance del TP se priorizo escribir tests significativos sobre funciones criticas en lugar de perseguir un porcentaje.

- **Tests E2E no corren en CI**: Playwright requiere navegadores instalados en el runner de GitHub Actions, lo cual agrega tiempo y complejidad. Para el alcance del TP se priorizaron los tests unitarios en CI y los E2E se ejecutan localmente.

- **Lint con reglas basicas**: se podrian agregar reglas mas estrictas (ej: `eslint-plugin-jsx-a11y` para accesibilidad) pero se priorizo un set minimo que atrape errores reales sin generar ruido.

## Uso de IA

Se utilizo Claude Code (agente de IA) para la generacion de la estructura de tests y la configuracion del pipeline de CI/CD. Especificamente:

- **Generado por IA**: estructura base de `catalog-utils.test.ts`, configuracion de `vitest.config.ts`, `eslint.config.js`, `playwright.config.ts`, workflow de GitHub Actions, PR template.
- **Modificado manualmente**: se revisaron y ajustaron los tests para asegurar que cubren casos de uso reales de la aplicacion y no son triviales. Se verifico que los 24 tests unitarios pasen correctamente.
- **Decisiones propias**: la eleccion de extraer la logica de filtrado/ordenamiento a funciones puras en `catalog-utils.ts` para facilitar el testing sin mocks. La priorizacion de que testear y que no.

## Convencion de ramas

- `feature/nombre-feature` — para nuevas funcionalidades
- `fix/nombre-bug` — para correccion de bugs
- `chore/nombre-tarea` — para tareas de mantenimiento (configuracion, CI, docs)
