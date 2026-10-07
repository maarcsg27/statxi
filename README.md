# STATXI (Stat-XI) ⚽🔥
> **Portal Web de Minijuegos de Estadísticas de Fútbol con Datos Reales**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/maarcsg27/statxi)
[![GitHub Repository](https://img.shields.io/badge/GitHub-maarcsg27%2Fstatxi-blue?logo=github)](https://github.com/maarcsg27/statxi)

---

## 1. Contexto y Visión

**STATXI** es un motor de minijuegos y portal de conocimiento futbolístico construido sobre una base de datos propia desacoplada de APIs externas. Los usuarios compiten diariamente utilizando estadísticas reales de futbolistas, clubes, competiciones y valores de mercado históricos.

Inspirado en la inmediatez de *Wordle*, la riqueza enciclopédica de *Sporcle* y la emoción del *Fantasy Football*, con estética deportiva oscura premium y alto dinamismo.

---

## 2. Arquitectura del Sistema

```text
                 ┌──────────────────┐
                 │   API-FOOTBALL   │ (v3 API-Sports)
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ DATA SYNC ENGINE │ (04:00 AM UTC Cron / Admin Manual)
                 └────────┬─────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
              ▼                        ▼
      ┌───────────────┐       ┌─────────────────┐
      │ PostgreSQL    │       │ Market Provider │ (Highlightly / Transfermarkt)
      │ / Supabase    │       └────────┬────────┘
      └───────┬───────┘                │
              │                         │
              └────────────┬────────────┘
                           ▼
                  ┌─────────────────┐
                  │ DATA AGGREGATION │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │ GAME PLAYER POOL│ (Vista optimizada con filtro WHERE stat IS NOT NULL)
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │   GAME ENGINE   │ (QuestionGenerator + ScoringEngine)
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │   WEB / NEXT.JS │ (Mobile-First, Sports Dark UI)
                  └─────────────────┘
```

---

## 3. Principios Fundamentales

1. **Separación de Capas**: El frontend jamás consulta APIs externas directamente. Toda la ejecución de juego ocurre contra la base de datos interna.
2. **Resiliencia ante Caídas de API**: Si API-Football está caído temporalmente, la plataforma sigue funcionando al 100% con los datos almacenados.
3. **Manejo Estricto de Datos Nulos**: `NULL != 0`. `NULL` representa ausencia de información, mientras que `0` representa un cero comprobado. Los juegos excluyen automáticamente a jugadores cuyo dato requerido sea `NULL`.
4. **Sincronización Incremental e Idempotente**: Actualizaciones mediante `UPSERT` y punteros en `sync_state`. Solo se descargan novedades.
5. **Control de Cuota de API**: El `SyncEngine` comprueba el límite diario antes de sincronizar lotes secundarios.
6. **Validación Server-Side**: La puntuación y las respuestas se comprueban en el backend para garantizar el juego limpio.

---

## 4. Modos de Juego Incluidos

| # | Modo | Descripción | Formato |
|---|---|---|---|
| 1 | **Mayor** | Selecciona el futbolista con la estadística más alta de entre 4 opciones | 4 Jugadores |
| 2 | **Menor** | Encuentra al futbolista con el registro más bajo (ej. tarjetas, faltas) | 4 Jugadores |
| 3 | **Higher / Lower** | Racha: ¿el siguiente jugador tiene más o menos estadística que el anterior? | 2 Jugadores |
| 4 | **Exacto** | Pronostica la cifra numérica exacta registrada por el jugador | 1 Jugador |
| 5 | **Más Cercano** | Aproxímate a la estadística objetivo; el más cercano obtiene la máxima puntuación | 1 Jugador |
| 6 | **Límite (Football 21)** | Acumula jugadores sumando registros sin pasarte del tope fijado | 6 Opciones |
| 7 | **Objetivo** | Combina una terna de jugadores cuya suma alcance un objetivo estadístico exacto | 6 Opciones |
| 8 | **Guess The Stat** | Adivina la estadística correcta de entre 4 opciones verosímiles | 1 Jugador |
| 9 | **Draft XI** | Recluta jugadores posición por posición y construye el equipo con mayor puntuación | 7 Jugadores |
| 10 | **Squad DNA** | Diseña tu once y genera un radar multidimensional de goles, títulos y valor | 11 Jugadores |
| 11 | **Player Chain** | Conecta futbolistas consecutivos que compartan club, país o competición | 4 Jugadores |
| 12 | **Reto Aleatorio** | Genera una partida con reglas y parámetros dinámicos | Dinámico |

---

## 5. Daily Challenge & Semillas Deterministas

- Cada día a las 00:00 UTC se activa un **Daily Challenge** oficial.
- Utiliza una semilla pseudoaleatoria generada a partir de la fecha `YYYY-MM-DD`.
- Todos los usuarios del mundo reciben **exactamente las mismas preguntas**.
- 1 intento oficial para la clasificación global del día con medallas y +200 XP.

---

## 6. Variables de Entorno

Configura estas variables en tu archivo `.env.local` o en el panel de **Vercel**:

```env
# Supabase / PostgreSQL (Opcional en modo local, obligatorio para persistencia remota)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Proveedor de Datos de Fútbol ('api' o 'mock')
DATA_PROVIDER=mock
API_FOOTBALL_KEY=tu_api_football_v3_key

# Proveedor de Valores de Mercado ('highlightly' o 'mock')
MARKET_VALUE_PROVIDER=mock
MARKET_VALUE_API_KEY=tu_market_value_key

# Configuración de Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SECRET_KEY=clave_secreta_admin
```

> **Nota de arranque inmediato**: Si no introduces claves externas, STATXI funciona de forma nativa e inmediata en modo `mock` con una base de datos de 22+ superestrellas mundiales (Lamine Yamal, Mbappé, Haaland, Vinicius, Messi, Cristiano, Rodri, Bellingham, etc.) con estadísticas verificadas.

---

## 7. Despliegue en Vercel

1. Haz fork o usa el repositorio: [https://github.com/maarcsg27/statxi](https://github.com/maarcsg27/statxi)
2. Importa el proyecto en [Vercel](https://vercel.com).
3. Añade las variables de entorno de tu archivo `.env.example`.
4. Haz clic en **Deploy**.

---

## 8. Migraciones de Base de Datos

El esquema SQL completo con todas las 18 tablas, índices de alta velocidad, triggers y vistas materializadas se encuentra en:
`supabase/migrations/20261008000000_init_statxi.sql`

Para aplicarlo en tu proyecto Supabase:
```bash
# Mediante Supabase CLI
supabase db push

# O copiando el archivo directamente en el SQL Editor de tu panel de Supabase
```

---

## 9. Cómo Añadir Nuevos Modos de Juego

1. Añadir el nuevo identificador en `src/lib/game-engine/types.ts` (`GameType`).
2. Declarar sus reglas y metadatos en `src/lib/game-engine/modes-data.ts`.
3. Implementar el generador de rondas en `src/lib/game-engine/QuestionGenerator.ts`.
4. Definir la lógica de validación en `src/lib/game-engine/GameEngine.ts` (`validateAnswer`).

---

## 10. Cómo Añadir Nuevos Proveedores de Datos

1. Implementar la interfaz `FootballDataProvider` o `MarketValueProvider` en `src/lib/data-providers/types.ts`.
2. Registrar la nueva clase dentro de `src/lib/data-providers/factory.ts`.
3. Indicar el nombre en la variable de entorno `DATA_PROVIDER=tu_proveedor`.
