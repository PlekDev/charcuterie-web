# La Casita POS - Guía de Despliegue

## 🚀 Opción 1: Vercel (Recomendado)

### Paso 1: Crear base de datos en Neon

1. Ve a **[neon.tech](https://neon.tech)** y crea una cuenta gratis
2. Haz clic en **"Create a project"**
3. Nombra el proyecto: `lacasita`
4. Copia la **Connection string** que aparece (ejemplo):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Paso 2: Configurar Vercel

1. Ve a tu proyecto en **Vercel Dashboard**
2. Ve a **Settings** → **Environment Variables**
3. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://...?sslmode=require` |
| `DIRECT_DATABASE_URL` | `postgresql://...` (sin sslmode) |

### Paso 3: Redesplegar

1. Ve a **Deployments**
2. Haz clic en los **3 puntos (...)** del último deployment
3. Selecciona **Redeploy**

---

## 🖥️ Opción 2: Servidor propio (VPS)

### Requisitos
- Ubuntu 20.04+ o Debian 11+
- Node.js 18+ o Bun
- PostgreSQL (o usar SQLite para desarrollo)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/lacasita.git
cd lacasita

# 2. Instalar Bun (si no lo tienes)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 3. Instalar dependencias
bun install

# 4. Configurar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL

# 5. Crear tablas
bun run db:push

# 6. Poblar con datos de ejemplo
bun run db:seed

# 7. Iniciar el servidor
bun run dev
```

### Usar PM2 (producción)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar la aplicación
pm2 start "bun run start" --name lacasita

# Guardar configuración
pm2 save
pm2 startup
```

---

## 🐳 Opción 3: Docker

```bash
# Construir imagen
docker build -t lacasita-pos .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL="tu-url-de-postgres" \
  lacasita-pos
```

---

## ✅ Verificar instalación

Después de desplegar, verifica:

1. **Frontend**: `https://tu-app.vercel.app`
2. **API Health**: `https://tu-app.vercel.app/api/health`
3. **Productos**: `https://tu-app.vercel.app/api/products`

---

## 👤 Usuarios por defecto

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@lacasita.com | admin123 | Administrador |
| cajero1@lacasita.com | cajero123 | Cajero |

---

## ❓ Problemas comunes

### Error: "Prisma Client could not be generated"
```bash
bun run db:generate
```

### Error: "Database connection failed"
- Verifica que DATABASE_URL esté correcta
- Asegúrate de que la base de datos esté activa (Neon puede pausarla)

### Error: "Table doesn't exist"
```bash
bun run db:push
```
