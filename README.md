# Charcutería Gourmet

Tienda online de quesos, jamones y embutidos gourmet.

Construida con **Next.js 16**, **Tailwind CSS** y **Supabase** (PostgreSQL).

---

## Requisitos

- [Node.js](https://nodejs.org) 20 o superior
- Una cuenta de [Supabase](https://supabase.com) (gratis)

---

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar las variables de entorno

Copia el archivo de ejemplo y renómbralo a `.env.local`:

```bash
cp .env.example .env.local
```

Luego abre `.env.local` y rellena los valores de tu proyecto de Supabase:

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** (secreta) |

### 3. Preparar la base de datos

1. En Supabase, abre el **SQL Editor** y ejecuta el contenido de
   [`SQL/charcuterie_schema.sql`](SQL/charcuterie_schema.sql). Esto crea
   todas las tablas (en el schema `chaputeria`) y unos productos de ejemplo.
2. Ve a **Settings → API → Data API** y agrega `chaputeria` a
   **"Exposed schemas"** (deja también `public` y `graphql_public`). Guarda.

---

## Correr el proyecto

### Modo desarrollo

```bash
npm run dev
```

Abre **http://localhost:3000** en tu navegador.

### Build de producción

```bash
npm run build
npm run start
```

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 3000 |
| `npm run build` | Compila la app para producción |
| `npm run start` | Sirve la build de producción |
| `npm run lint` | Revisa el código con ESLint |

---

## Estructura del proyecto

```
src/
  app/            Páginas y rutas API (Next.js App Router)
  components/     Componentes de la interfaz
  lib/            Cliente de Supabase y utilidades
  store/          Estado global (carrito)
SQL/              Esquema de la base de datos (Supabase)
```
