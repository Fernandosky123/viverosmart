# ViveroSmart

Aplicación privada para gestionar zonas, cultivos, sensores, consumos de agua y energía, alertas, programaciones y reportes de un vivero.

## Requisitos

- Node.js 22 o compatible
- PostgreSQL
- npm

## Configuración local

### Backend

```bash
cd backend
npm install
```

Crear `backend/.env` manualmente con, como mínimo:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/viverosmart?schema=public"
JWT_SECRET="un-secreto-largo-y-aleatorio"
FRONTEND_URL="http://localhost:5173"
```

Después sincronizar la base e iniciar el servidor:

```bash
npx prisma db push
npx prisma generate
npm start
```


### Frontend

```bash
cd frontend
npm install
npm run dev
```


## Variables de entorno

Backend:

- `DATABASE_URL`: conexión PostgreSQL.
- `JWT_SECRET`: secreto largo y aleatorio para firmar sesiones.
- `FRONTEND_URL`: origen público exacto del frontend, sin barra final.
- `PORT`: puerto HTTP; por defecto `5000`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM`: cuenta que envía recuperaciones de contraseña.
- `WEATHER_API_KEY`: opcional, para consultar el clima.
- `ARCHIVE_DIR`: opcional, ubicación de archivos históricos.

Frontend:

- `VITE_API_URL`: URL pública del backend terminada en `/api`, por ejemplo `https://api.ejemplo.com/api`.

Los archivos `.env` están ignorados por Git y deben configurarse directamente en el proveedor de hosting.

## Funcionamiento inicial

1. Crea la cuenta administradora desde el inicio de sesión si la base está vacía.
2. Crea al menos una zona.
3. Registra cultivos y asigna usuarios cuando corresponda.
4. Registra sensores de agua o energía en una zona.
5. Configura umbrales y programaciones.

Los sensores activos generan lecturas simuladas cada dos minutos mientras el backend está ejecutándose. Las plantas del simulador también requieren seleccionar una zona.

## Comprobaciones

```bash
cd backend
npm test
npx prisma validate

cd ../frontend
npm run lint
npm run build
```

## Despliegue

- Ejecuta `npx prisma db push` contra la base del entorno antes de iniciar una versión cuyo esquema haya cambiado.
- Configura `FRONTEND_URL` con el dominio real del frontend y `VITE_API_URL` con la API pública.
- Configura una reescritura SPA en el hosting del frontend para que rutas como `/dashboard` y `/simulador` devuelvan `index.html`.
- No ejecutes seeds en producción; la aplicación no depende de ellos.
- No publiques `.env`, contraseñas SMTP ni `JWT_SECRET`.

## Comandos

Backend:

- `npm start`: inicia el servidor.
- `npm run dev`: inicia con recarga automática.
- `npm test`: ejecuta las pruebas.
- `npm run db:backup`: crea un respaldo manual si `pg_dump` está disponible.

Frontend:

- `npm run dev`: servidor de desarrollo.
- `npm run build`: compilación de producción.
- `npm run lint`: análisis estático.
- `npm run preview`: vista previa de la compilación.
