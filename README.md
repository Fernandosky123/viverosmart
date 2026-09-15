#  ViveroSmart
## Paso 1: Configurar la Base de Datos y el Backend

1. Abre una terminal y navega a la carpeta del backend:
   bash
   cd backend
   

2. Instala las dependencias del servidor:
  bash
   npm install
   

3. Crea un archivo llamado `.env` dentro de la carpeta `backend` y añade la conexión a tu base de datos PostgreSQL y una clave secreta para los tokens:
   .env
   DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/vivero_inteligente?schema=public"
   JWT_SECRET="super_secreto_vivero_123"
   ```
   *(Cambia `TU_CONTRASEÑA` por la contraseña que le pusiste a tu usuario de PostgreSQL).*

4. Sincroniza la base de datos con Prisma (creará las tablas automáticamente) y genera el cliente:
   bash
   npx prisma db push
   npx prisma generate
   

5. **(Opcional pero recomendado)** Ejecuta los scripts de "semilla" para inyectar usuarios, roles, sectores y sensores de prueba:
   ```bash
   node seedRoles.js
   node seedUsers.js
   node seed.js


6. ¡Inicia el servidor Backend!
   bash
   npm run dev
   
   *(El servidor debería arrancar en http://localhost:5000 y verás el Simulador IoT activándose en consola).*

---

## Paso 2: Configurar y Arrancar el Frontend

1. Abre **una nueva pestaña/ventana** en tu terminal y navega a la carpeta del frontend:
   bash
   cd frontend
   

2. Instala las dependencias web:
   bash
   npm install
   

3. Arranca la aplicación de React:
   bash
   npm run dev
   
   *(Se te abrirá una URL, usualmente http://localhost:5173).*

---

## Paso 3: ¡Probar el Sistema!

Abre la URL del Frontend en tu navegador web. Como ejecutaste los scripts de base de datos en el Paso 1, ya tienes cuentas creadas para probar el Control de Accesos por Roles (RBAC):

* **Administrador Global:** `admin@vivero.com`
* **Operador (Riego):** `operador@vivero.com`
* **Técnico (Sensores):** `tecnico@vivero.com`
* **Cliente (Lectura):** `cliente@vivero.com`

**Contraseña para todos:** `123456`

*(Si usas la cuenta admin@vivero.com usarás la contraseña que se genera en seed.js que es `admin123`)*
*Corrección de cuenta Administrador principal:*
* Email: `admin@vivero.com`
* Contraseña: `admin123`

### Notas Adicionales
* **Simulador IoT Automático:** El backend tiene un CronJob (`src/jobs/cron.js`) que simula automáticamente el envío de datos de sensores de agua y energía cada 2 minutos. Si configuras Umbrales en el Frontend, verás aparecer alertas de consumo crítico en tu campana de notificaciones.
* **Mapa Sin API Key:** El mapa del simulador visual funciona con Leaflet (OpenStreetMap), por lo que no requiere registrar tarjetas de crédito ni llaves de Google Maps.
