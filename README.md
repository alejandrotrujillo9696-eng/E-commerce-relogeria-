# [react]

[DESCRIPCIÓN DEL PROYECTO]

## 📋 Tabla de contenidos

- [📖 Descripción](#-descripción)
- [🎯 Objetivo del proyecto](#-objetivo-del-proyecto)
- [✨ Características](#-características)
- [🏗️ Arquitectura del sistema](#️-arquitectura-del-sistema)
- [🛠️ Tecnologías utilizadas](#️-tecnologías-utilizadas)
- [📂 Estructura del proyecto](#-estructura-del-proyecto)
- [🔄 Flujo de funcionamiento](#-flujo-de-funcionamiento)
- [⚙️ Requisitos previos](#️-requisitos-previos)
- [🚀 Instalación](#-instalación)
- [🔐 Variables de entorno](#-variables-de-entorno)
- [▶️ Ejecución en desarrollo](#️-ejecución-en-desarrollo)
- [🏭 Construcción para producción](#-construcción-para-producción)
- [🔌 API](#-api)
- [🔑 Autenticación y autorización](#-autenticación-y-autorización)
- [🗄️ Base de datos](#️-base-de-datos)
- [🛒 Funcionalidades del sistema](#-funcionalidades-del-sistema)
- [🧪 Pruebas](#-pruebas)
- [🛡️ Seguridad](#-seguridad)
- [🚀 Despliegue](#-despliegue)
- [🐛 Solución de problemas](#-solución-de-problemas)
- [📊 Estado actual del proyecto](#-estado-actual-del-proyecto)
- [🗺️ Roadmap](#-roadmap)
- [🤝 Contribución](#-contribución)
- [👤 Autor](#-autor)
- [📞 Contacto](#-contacto)
- [📄 Licencia](#-licencia)

---

## 📖 Descripción

es una aplicación full-stack de comercio electrónico especializada en la venta de relojes de lujo. La plataforma permite a los usuarios explorar un catálogo de productos, gestionar un carrito de compras, realizar pedidos y consultar su historial. Incluye un panel administrativo para la gestión integral del catálogo, categorías, usuarios, pedidos y la sección destacada de la página de inicio.

El frontend es una SPA (Single Page Application) construida con React y Vite, mientras que el backend expone una API REST desarrollada con Express y almacena la información en MySQL.

---

## 🎯 Objetivo del proyecto

- Ofrecer una experiencia de compra digital para relojes de lujo con navegación fluida y diseño premium.
- Proveer un panel administrativo completo para la gestión de productos, categorías, usuarios y pedidos.
- Implementar un flujo de checkout con pago contraentrega y notificaciones por correo electrónico.
- Garantizar la seguridad de las operaciones mediante autenticación basada en JWT, protección CSRF y control de acceso por roles.

---

## ✨ Características

### ✅ Implementado

| Característica | Descripción |
|----------------|-------------|
| Catálogo de productos | Listado paginado con filtros por nombre, categoría y rango de precios. |
| Detalle de producto | Vista individual de cada producto. |
| Carrito de compras (guest) | Carrito persistido en `localStorage` para usuarios no autenticados. |
| Carrito de compras (auth) | Carrito por usuario en base de datos, con merge del carrito guest al iniciar sesión. |
| Autenticación | Registro e inicio de sesión con JWT almacenado en cookie `httpOnly`. |
| Checkout | Formulario de envío y confirmación de compra con pago contraentrega. |
| Pedidos | Creación, listado, detalle, cancelación y eliminación de pedidos (solo en estado `pending`). |
| Panel administrativo | CRUD de productos, categorías, usuarios (roles), órdenes y sección de inicio. |
| Sección de inicio administrable | El administrador puede actualizar el título y reordenar los productos destacados. |
| Correo de confirmación | Envío de correo electrónico al confirmar una compra (configurable mediante SMTP). |
| Botón de WhatsApp | Botón flotante opcional configurado por variable de entorno. |
| Protección de rutas | Rutas protegidas por rol (`customer` y `admin`). |
| Diseño responsive | Interfaz construida con MDB React UI Kit. |

### ⚠️ Parcialmente implementado

| Característica | Estado |
|----------------|--------|
| Recuperación de contraseña | El enlace "¿Olvidaste tu contraseña?" es estático (`href="#!"`). No existe flujo de recuperación. |
| Inicio de sesión social | Los botones de Facebook, Twitter y Google son decorativos; no integran ningún proveedor OAuth. |
| Estados de pedido | Solo se implementa el estado `pending`. No existe flujo de cambio de estado (p. ej., `processing`, `shipped`, `delivered`). |

### ❌ No implementado

| Característica | Descripción |
|----------------|-------------|
| Pasarela de pagos | El checkout opera exclusivamente como pago contraentrega. |
| Gestión de inventario | No existe control de stock ni validación de disponibilidad. |
| Búsqueda avanzada | Solo se permite búsqueda por nombre. |
| Valoraciones y reseñas | No existe funcionalidad de calificación de productos. |
| Página de contacto | Existe un enlace `/contact` en la página de inicio, pero no hay ruta ni vista correspondiente. |

---

## 🏗️ Arquitectura del sistema

```text
┌─────────────────────────────────────────────────────────────┐
│                     React + Vite (Frontend)                 │
│  - Componentes SPA                                         │
│  - Redux Toolkit (estado global)                            │
│  - React Router DOM (enrutamiento)                          │
│  - Formik + Yup (formularios y validación)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST + cookies + CSRF
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js + Express (Backend)                    │
│  - Rutas REST por recurso                                   │
│  - Middleware: Auth, CSRF, Admin, Rate Limit, Error Handler │
│  - Controladores → Servicios → Modelos (MySQL)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ mysql2 (pool de conexiones)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      MySQL (Base de datos)                  │
│  - users, categories, products, carts, cart_items,         │
│    orders, order_items, home_sections, home_section_items  │
└─────────────────────────────────────────────────────────────┘
```

**Patrón de capas del backend:**

```text
Request → Router → Middleware → Controller → Service → Model → MySQL
```

---

## 🛠️ Tecnologías utilizadas

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Biblioteca UI para construir la SPA. |
| Vite | 6.0.1 | Bundler y servidor de desarrollo. |
| React Router DOM | 6.14.3 | Enrutamiento del lado del cliente. |
| Redux Toolkit | 2.4.0 | Gestión de estado global (auth, cart). |
| React Redux | 9.1.2 | Integración de Redux con React. |
| Formik | 2.4.6 | Manejo de formularios. |
| Yup | 1.3.0 | Validación de esquemas. |
| MDB React UI Kit | 9.0.0 | Librería de componentes UI. |
| Font Awesome | 6.7.1 | Iconografía. |
| React Toastify | 10.0.6 | Notificaciones toast. |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js + Express | 4.21.2 | Servidor HTTP y enrutamiento. |
| MySQL (mysql2) | 3.12.0 | Base de datos relacional con pool de conexiones. |
| jsonwebtoken | 9.0.2 | Generación y verificación de JWT. |
| bcryptjs | 2.4.3 | Hashing de contraseñas. |
| cookie-parser | 1.4.7 | Lectura de cookies en el servidor. |
| CORS | 2.8.5 | Configuración de origen cruzado. |
| Helmet | 8.3.0 | Headers de seguridad HTTP. |
| express-rate-limit | 8.6.2 | Limitación de tasa en rutas sensibles. |
| nodemailer | 9.0.5 | Envío de correos electrónicos. |
| dotenv | 16.4.7 | Variables de entorno. |

### Pruebas

| Herramienta | Ámbito |
|-------------|--------|
| Vitest | Pruebas unitarias e de integración del frontend. |
| Jest + Supertest | Pruebas de integración y smoke tests del backend. |

---

## 📂 Estructura del proyecto

```
E-commerce_react-main./
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # Pool de conexiones MySQL
│   │   ├── controllers/                 # Controladores HTTP
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── cartController.js
│   │   │   ├── homeSectionController.js
│   │   │   ├── orderController.js
│   │   │   └── productController.js
│   │   ├── middleware/                   # Middlewares Express
│   │   │   ├── adminMiddleware.js
│   │   │   ├── authMiddleware.js
│   │   │   ├── csrfMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── tokenBlacklist.js
│   │   ├── models/                      # Acceso a datos
│   │   │   ├── cartModel.js
│   │   │   ├── categoryModel.js
│   │   │   ├── homeModel.js
│   │   │   ├── orderModel.js
│   │   │   ├── productModel.js
│   │   │   └── userModel.js
│   │   ├── routes/                      # Rutas Express
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── homeSectionPublicRoutes.js
│   │   │   ├── homeSectionRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── productRoutes.js
│   │   ├── services/                    # Lógica de negocio
│   │   │   ├── adminService.js
│   │   │   ├── authService.js
│   │   │   ├── cartService.js
│   │   │   ├── emailService.js
│   │   │   ├── homeSectionService.js
│   │   │   ├── orderService.js
│   │   │   └── productService.js
│   │   └── server.js                    # Configuración central de Express
│   ├── database/
│   │   ├── schema.sql                   # Definición de tablas
│   │   ├── seed-products.sql            # Datos iniciales de productos
│   │   └── seed-home-section.sql        # Datos iniciales de sección de inicio
│   ├── tests/                           # Pruebas del backend (Jest)
│   ├── .env.example
│   ├── .gitignore
│   ├── jest.config.js
│   └── package.json
├── src/
│   ├── components/                      # Componentes reutilizables
│   │   ├── 404Page/
│   │   ├── Cart/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── HomeProduct/
│   │   ├── ProductCard/
│   │   ├── ProtectedRoute/
│   │   └── WhatsAppButton/
│   ├── features/                        # Estado global Redux
│   │   ├── auth/
│   │   │   └── authSlice.js
│   │   └── cart/
│   │       └── cartSlice.js
│   ├── hooks/
│   │   └── useProductFilters.js
│   ├── pages/                           # Vistas/páginas
│   │   ├── Admin/
│   │   │   ├── Admin.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── HomeSection.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Users.jsx
│   │   ├── Auth/
│   │   │   ├── Login/
│   │   │   └── Register/
│   │   ├── Cart/
│   │   │   └── CartPage.jsx
│   │   ├── Checkout/
│   │   ├── Home/
│   │   ├── Product/
│   │   ├── ThankYou/
│   │   └── User/
│   ├── services/                        # Clientes API
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── cartService.js
│   │   ├── homeSectionPublicService.js
│   │   ├── homeSectionService.js
│   │   ├── orderService.js
│   │   └── productService.js
│   ├── test/                            # Pruebas frontend (Vitest)
│   ├── utils/
│   │   ├── formatPrice.js
│   │   └── orderStatusLabels.js
│   ├── app/
│   │   └── store.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── assets/
├── public/
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔄 Flujo de funcionamiento

```text
Usuario
   │
   ▼
Frontend React (SPA)
   │
   ├── Navegación pública: Home, Productos, Detalle, Login, Register
   │
   ├── Carrito guest (localStorage)
   │     │
   │     ▼
   │   Inicio de sesión
   │     │
   │     ▼
   │   Merge de carrito guest → carrito de usuario (API)
   │
   ├── Checkout (requiere autenticación)
   │     │
   │     ▼
   │   POST /api/orders → Crear orden + limpiar carrito
   │     │
   │     ▼
   │   Envío de correo de confirmación (nodemailer)
   │
   └── Panel Admin (solo rol admin)
         │
         ├── CRUD Productos
         ├── CRUD Categorías
         ├── CRUD Usuarios y roles
         ├── CRUD Órdenes
         └── Gestión de sección de inicio
```

---

## ⚙️ Requisitos previos

- Node.js >= 18.x
- npm >= 9.x
- MySQL >= 8.0 (o compatible)
- Cuenta de correo SMTP (opcional, para confirmación de pedidos)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_PROYECTO]
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

### 4. Configurar base de datos

1. Crear una base de datos vacía en MySQL.
2. Ejecutar el esquema:

```bash
mysql -u [USUARIO] -p [NOMBRE_BASE_DATOS] < backend/database/schema.sql
```

3. Cargar datos iniciales:

```bash
mysql -u [USUARIO] -p [NOMBRE_BASE_DATOS] < backend/database/seed-products.sql
mysql -u [USUARIO] -p [NOMBRE_BASE_DATOS] < backend/database/seed-home-section.sql
```

> Los scripts de seed usan `INSERT IGNORE` o verifican existencia, por lo que pueden ejecutarse múltiples veces sin sobrescribir datos.

---

## 🔐 Variables de entorno

### Frontend (`.env` en la raíz)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API backend. Por defecto: `http://localhost:3001/api` |
| `VITE_WHATSAPP_NUMBER` | Número de WhatsApp para el botón flotante (sin `+` ni espacios). |

### Backend (`.env` en `/backend`)

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | Entorno: `development` o `production`. |
| `PORT` | Puerto del servidor backend. Por defecto: `3001`. |
| `FRONTEND_URL` | URL del frontend permitida para CORS. Se permiten múltiples separadas por coma. |
| `SOCIAL_AUTH_CALLBACK_BASE_URL` | URL pública del backend donde se registran los callbacks OAuth, por ejemplo `https://backend.example.com/api/auth/social`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciales OAuth de Google. Solo en el entorno backend. |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Credenciales OAuth de Facebook. Solo en el entorno backend. |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | Credenciales OAuth de X/Twitter. Solo en el entorno backend. |
| `DB_HOST` | Host de MySQL. |
| `DB_PORT` | Puerto de MySQL. Por defecto: `3306`. |
| `DB_USER` | Usuario de MySQL. |
| `DB_PASSWORD` | Contraseña de MySQL. |
| `DB_NAME` | Nombre de la base de datos. |
| `JWT_SECRET` | Secreto para firmar los tokens JWT. |
| `JWT_EXPIRES_IN` | Duración del token JWT. Por defecto: `7d`. |
| `JWT_MAX_AGE` | Vida máxima de la cookie en milisegundos. Por defecto: `86400000` (24h). |
| `SMTP_HOST` | Host del servidor SMTP. |
| `SMTP_PORT` | Puerto SMTP. Por defecto: `587`. |
| `SMTP_SECURE` | `true` si usa TLS/SSL. |
| `SMTP_USER` | Usuario autenticado del servidor SMTP. |
| `SMTP_PASS` | Contraseña del servidor SMTP. |
| `SMTP_FROM` | Remitente de correo. Por defecto: `SMTP_USER`. |

> ⚠️ **Importante:** No incluyas valores reales en el archivo `.env`. Usa `.env.example` como plantilla y mantén `.env` fuera del control de versiones.

---

## ▶️ Ejecución en desarrollo

### Frontend

```bash
npm run dev
```

El frontend se sirve en `http://localhost:5173`.

### Backend

```bash
cd backend
npm run dev
```

El backend se sirve en `http://localhost:3001`.

> Asegúrate de que MySQL esté en ejecución y de haber configurado el archivo `.env` del backend antes de iniciar el servidor.

---

## 🏭 Construcción para producción

### Frontend

```bash
npm run build
```

Los archivos compilados se generan en la carpeta `dist/`. Para previsualizar:

```bash
npm run preview
```

El proyecto incluye configuración para despliegue en GitHub Pages (`gh-pages`).

---

## 🔌 API

Base URL: `http://localhost:3001/api` (configurable mediante `VITE_API_URL`).

Formato de respuesta estándar:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa"
}
```

### Autenticación

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `POST` | `/api/auth/register` | Registro de usuario | No | Público |
| `POST` | `/api/auth/login` | Inicio de sesión | No | Público |
| `POST` | `/api/auth/logout` | Cierre de sesión (revoca token) | CSRF | Cualquiera |
| `GET` | `/api/auth/me` | Obtener usuario autenticado | JWT | Cualquiera |

> **Nota:** Los endpoints de auth (`register`, `login`) tienen rate limiting: 10 solicitudes cada 15 minutos y 5 intentos de login cada 3 horas.

### Productos

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/api/products` | Listado paginado de productos | No | Público |
| `GET` | `/api/products/categories` | Lista de categorías | No | Público |
| `GET` | `/api/products/:productId` | Detalle de producto | No | Público |

**Filtros disponibles en `GET /api/products`:**

| Query param | Tipo | Descripción |
|-------------|------|-------------|
| `q` | string | Búsqueda por nombre. |
| `category` | string | Filtro por nombre de categoría. |
| `minPrice` | number | Precio mínimo. |
| `maxPrice` | number | Precio máximo. |
| `page` | integer | Página actual (por defecto: `1`). |
| `limit` | integer | Elementos por página (por defecto: `8`, máximo: `100`). |

### Carrito

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/api/cart` | Obtener carrito del usuario | JWT | Cualquiera |
| `POST` | `/api/cart/items` | Agregar producto al carrito | CSRF | Cualquiera |
| `PATCH` | `/api/cart/items/:productId` | Actualizar cantidad de un producto | CSRF | Cualquiera |
| `DELETE` | `/api/cart/items/:productId` | Eliminar producto del carrito | CSRF | Cualquiera |
| `POST` | `/api/cart/merge` | Fusionar carrito guest con el del usuario | CSRF | Cualquiera |

### Pedidos

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `POST` | `/api/orders` | Crear pedido | CSRF | Cualquiera |
| `GET` | `/api/orders` | Listar pedidos del usuario | JWT | Cualquiera |
| `GET` | `/api/orders/:orderId` | Detalle de pedido del usuario | JWT | Cualquiera |
| `PATCH` | `/api/orders/:orderId/cancel` | Cancelar pedido (solo `pending`) | CSRF | Cualquiera |
| `DELETE` | `/api/orders/:orderId` | Eliminar pedido (solo `pending`) | CSRF | Cualquiera |

### Administración (requiere rol `admin`)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `POST` | `/api/admin/products` | Crear producto | JWT + CSRF | `admin` |
| `PUT` | `/api/admin/products/:productId` | Actualizar producto | JWT + CSRF | `admin` |
| `DELETE` | `/api/admin/products/:productId` | Eliminar producto | JWT + CSRF | `admin` |
| `POST` | `/api/admin/categories` | Crear categoría | JWT + CSRF | `admin` |
| `PUT` | `/api/admin/categories/:categoryId` | Actualizar categoría | JWT + CSRF | `admin` |
| `DELETE` | `/api/admin/categories/:categoryId` | Eliminar categoría | JWT + CSRF | `admin` |
| `GET` | `/api/admin/users` | Listar usuarios | JWT + CSRF | `admin` |
| `PUT` | `/api/admin/users/:userId/role` | Cambiar rol de usuario | JWT + CSRF | `admin` |
| `DELETE` | `/api/admin/users/:userId` | Eliminar usuario | JWT + CSRF | `admin` |
| `GET` | `/api/admin/orders` | Listar todas las órdenes (con búsqueda por `?search=ID`) | JWT + CSRF | `admin` |
| `GET` | `/api/admin/orders/:orderId` | Detalle de orden (con datos del cliente) | JWT + CSRF | `admin` |
| `DELETE` | `/api/admin/orders/:orderId` | Eliminar orden | JWT + CSRF | `admin` |

### Sección de inicio (pública)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/api/home-section` | Obtener sección de inicio | No | Público |

### Sección de inicio (administración)

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/api/admin/home-section` | Obtener sección de inicio | JWT + CSRF | `admin` |
| `PUT` | `/api/admin/home-section/title` | Actualizar título | JWT + CSRF | `admin` |
| `POST` | `/api/admin/home-section/items` | Agregar producto | JWT + CSRF | `admin` |
| `DELETE` | `/api/admin/home-section/items/:itemId` | Eliminar producto | JWT + CSRF | `admin` |
| `PATCH` | `/api/admin/home-section/items/:itemId/order` | Actualizar orden de un producto | JWT + CSRF | `admin` |
| `PUT` | `/api/admin/home-section/items` | Reemplazar todos los productos | JWT + CSRF | `admin` |

### Utilidad

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/api/health` | Verifica conexión con MySQL | CSRF | Público |

---

## 🔑 Autenticación y autorización

### Mecanismo de autenticación

El backend utiliza **JWT (JSON Web Tokens)** almacenados en una cookie `httpOnly` llamada `auth_token`. Además, soporta token Bearer en el header `Authorization` para clientes que no pueden manejar cookies.

1. **Registro:** `POST /api/auth/register`
   - Valida datos de entrada (nombre, apellido, email, contraseña 6-72 caracteres).
   - Hashea la contraseña con bcrypt (factor 12).
   - Crea el usuario con rol `customer` por defecto.
   - Establece la cookie `auth_token`.

2. **Inicio de sesión:** `POST /api/auth/login`
   - Verifica email y contraseña.
   - Establece la cookie `auth_token` con el rol del usuario.

3. **Sesión:** `GET /api/auth/me`
   - Verifica el token y retorna los datos del usuario autenticado.

4. **Cierre de sesión:** `POST /api/auth/logout`
   - Revoca el token actual en una blacklist en memoria.
   - Limpia la cookie `auth_token`.

### Roles

| Rol | Descripción |
|-----|-------------|
| `customer` | Usuario registrado. Puede gestionar su carrito, crear pedidos y consultar su historial. |
| `admin` | Administrador. Acceso completo al panel administrativo. |

El rol se almacena en la claim `role` del JWT y se valida en el middleware `requireAdmin`.

### Middleware de autenticación

- **`authenticate`**: Verifica la presencia y validez del JWT (cookie o Bearer). Si el token está en la blacklist, rechaza la solicitud. Establece `req.auth` con `userId` y `role`.
- **`requireAdmin`**: Verifica que `req.auth.role === 'admin'`.

### Protección de rutas en el frontend

El componente `ProtectedRoute` evalúa `allowedRoles` contra `state.auth.user.role`. Si el usuario no tiene el rol requerido, es redirigido a la página de inicio.

---

## 🗄️ Base de datos

### Tablas

#### `users`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `first_name` | VARCHAR(100) | Nombre del usuario. |
| `last_name` | VARCHAR(100) | Apellido del usuario. |
| `email` | VARCHAR(255) UNIQUE | Correo electrónico único. |
| `password_hash` | VARCHAR(255) | Contraseña hasheada con bcrypt. |
| `role` | VARCHAR(20) DEFAULT 'customer' | Rol del usuario (`customer` o `admin`). |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

#### `categories`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `name` | VARCHAR(100) UNIQUE | Nombre de la categoría. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

#### `products`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `name` | VARCHAR(255) | Nombre del producto. |
| `description` | TEXT | Descripción detallada. |
| `price` | DECIMAL(10,2) | Precio (>= 0). |
| `image_url` | VARCHAR(2048) | URL de la imagen del producto. |
| `category_id` | BIGINT UNSIGNED FK | Referencia a `categories.id`. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

> Restricción: `ON DELETE RESTRICT` en `category_id`. No se permite eliminar una categoría con productos asociados.

#### `carts`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `user_id` | BIGINT UNSIGNED FK UNIQUE | Referencia a `users.id`. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

#### `cart_items`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `cart_id` | BIGINT UNSIGNED FK | Referencia a `carts.id`. |
| `product_id` | BIGINT UNSIGNED FK | Referencia a `products.id`. |
| `quantity` | INT UNSIGNED | Cantidad (> 0). |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

> Restricción única: `(cart_id, product_id)`. Al agregar un producto existente, se incrementa la cantidad.

#### `orders`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `user_id` | BIGINT UNSIGNED FK | Referencia a `users.id`. |
| `status` | VARCHAR(50) DEFAULT 'pending' | Estado del pedido. |
| `total` | DECIMAL(10,2) | Total de la orden. |
| `shipping_name` | VARCHAR(255) | Nombre del destinatario. |
| `shipping_address` | VARCHAR(255) | Dirección de envío. |
| `shipping_city` | VARCHAR(100) | Ciudad de envío. |
| `shipping_zip` | VARCHAR(20) | Código postal. |
| `shipping_phone` | VARCHAR(50) | Teléfono de contacto. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

> Estados implementados: `pending`. Cancelación/eliminación permitida solo en este estado.

#### `order_items`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `order_id` | BIGINT UNSIGNED FK | Referencia a `orders.id`. |
| `product_id` | BIGINT UNSIGNED FK | Referencia a `products.id`. |
| `quantity` | INT UNSIGNED | Cantidad (> 0). |
| `price` | DECIMAL(10,2) | Precio unitario al momento de la compra. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

#### `home_sections`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `title` | VARCHAR(255) | Título de la sección de inicio. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Fecha de última actualización. |

#### `home_section_items`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT UNSIGNED PK AI | Identificador único. |
| `home_section_id` | BIGINT UNSIGNED FK | Referencia a `home_sections.id`. |
| `product_id` | BIGINT UNSIGNED FK | Referencia a `products.id`. |
| `sort_order` | INT UNSIGNED | Orden de visualización. |
| `created_at` | TIMESTAMP | Fecha de creación. |

> Restricción única: `(home_section_id, product_id)`.

### Relaciones principales

```text
users 1 ──── N carts
users 1 ──── N orders
categories 1 ──── N products
products 1 ──── N cart_items
products 1 ──── N order_items
orders 1 ──── N order_items
home_sections 1 ──── N home_section_items
```

---

## 🛒 Funcionalidades del sistema

### Experiencia de compra (customer)

1. **Exploración:** El usuario puede navegar por el catálogo, buscar por nombre, filtrar por categoría y rango de precios, y paginar los resultados.
2. **Carrito guest:** Los productos se agregan a un carrito almacenado en `localStorage` sin necesidad de autenticación.
3. **Inicio de sesión:** Al autenticarse, el carrito guest se fusiona con el carrito del usuario en la base de datos.
4. **Checkout:** El usuario completa un formulario de envío y confirma el pedido. El método de pago es contraentrega.
5. **Confirmación:** Se muestra una página de agradecimiento y se envía un correo electrónico de confirmación (si SMTP está configurado).
6. **Historial:** El usuario puede consultar sus pedidos, ver el detalle de cada uno, cancelar pedidos pendientes o eliminarlos.

### Administración (admin)

1. **Productos:** Crear, editar y eliminar productos (nombre, descripción, precio, imagen, categoría).
2. **Categorías:** Crear, editar y eliminar categorías (con validación de productos asociados).
3. **Usuarios:** Listar usuarios, cambiar su rol (`customer`/`admin`) y eliminarlos (con restricciones: no se puede eliminar el último admin ni usuarios con pedidos).
4. **Pedidos:** Ver todas las órdenes, buscar por ID, ver detalle del cliente y productos, eliminar órdenes.
5. **Sección de inicio:** Modificar el título, agregar/eliminar productos destacados y reordenarlos.

---

## 🧪 Pruebas

### Frontend (Vitest)

```bash
npm test
```

**Pruebas existentes:**

| Tipo | Archivos |
|------|----------|
| Unitarias | `authSlice.test.jsx`, `cartSlice.test.jsx`, `apiClient.test.jsx`, `authService.test.jsx`, `cartService.test.jsx`, `orderService.test.jsx`, `productService.test.jsx`, `WhatsAppButton.test.jsx`, `ProductCard.test.jsx`, `useProductFilters.test.jsx` |
| Integración | `auth.test.jsx`, `cart.test.jsx`, `checkout.test.jsx`, `products.test.jsx`, `thankYou.test.jsx`, `admin.test.jsx`, `adminOrders.test.jsx` |

Configuración en `vite.config.js`:
- Entorno: `happy-dom`
- Setup: `src/test/setup.js`
- Patrón de inclusión: `src/**/*.test.{js,jsx}`

### Backend (Jest + Supertest)

```bash
cd backend
npm test
```

**Pruebas existentes:**

| Tipo | Archivos |
|------|----------|
| Integración | `integration.test.js` (auth, productos, carrito, órdenes, admin, CSRF, home section) |
| Smoke tests | `smoke.test.js` (exportaciones de controladores), `services.smoke.test.js` (exportaciones de servicios) |
| Unitarias | `category.test.js` (modelo de categoría) |

Configuración en `jest.config.js`:
- Entorno: `node`
- ESM habilitado (sin transformación)

---

## 🛡️ Seguridad

### ✅ Implementado

| Medida | Descripción |
|--------|-------------|
| Helmet | Headers de seguridad HTTP configurados globalmente. |
| CORS | Orígenes restringidos mediante whitelist en `FRONTEND_URL`. |
| Rate limiting | Límite de 10 solicitudes/15 min en `/api/auth` y 5 intentos de login/3 horas. |
| CSRF | Doble cookie: cookie `_csrf` + header `X-CSRF-Token` en métodos mutantes (POST, PUT, PATCH, DELETE). |
| JWT en cookie `httpOnly` | Previene acceso desde JavaScript en el cliente. |
| `sameSite` y `secure` | Configuración adaptada al entorno (`lax` en desarrollo, `none` + `secure` en producción). |
| Blacklist de tokens | Revocación de tokens en memoria al hacer logout (límite de 10,000 tokens). |
| Bcrypt | Hashing de contraseñas con factor de costo 12. |
| Validación de entrada | Validación de tipos, rangos y formatos en servicios y modelos. |
| Deshabilitar `x-powered-by` | Elimina el header `X-Powered-By` de Express. |
| Límite de payload JSON | `express.json({ limit: '100kb' })` para prevenir ataques de deserialización. |
| `.gitignore` | Excluye `.env`, `node_modules`, `dist` y archivos sensibles. |
| Prepared statements | Uso de consultas parametrizadas en todos los modelos (previene SQL injection). |

### ⚠️ Mejorable

| Medida | Descripción |
|--------|-------------|
| Blacklist de tokens en memoria | La revocación es volátil; se pierde al reiniciar el servidor. Para producción, considerar Redis. |
| SMTP hardcodeado | ⚠️ Se detectó una dirección de correo electrónico hardcodeada en el servicio de correo. Debe externalizarse a una variable de entorno. |
| Logs de error | Los errores 500 se loguean en consola, pero no existe un sistema de logging estructurado ni monitoreo. |
| Refresh tokens | No existe mecanismo de refresh token; la sesión expira con el JWT. |

### ❌ Pendiente

| Medida | Descripción |
|--------|-------------|
| 2FA / MFA | No existe autenticación de dos factores. |
| Validación de password strength | No existe política de complejidad de contraseñas más allá de la longitud mínima. |
| Audit log | No existe registro de auditoría de acciones administrativas. |
| Rate limiting general | Actualmente solo aplica a rutas de autenticación; no hay límite global. |

---

## 🚀 Despliegue

### Consideraciones generales

- Configurar todas las variables de entorno del backend en el servidor de producción.
- Asegurar que `NODE_ENV=production` para activar cookies `secure` y `sameSite: 'none'`.
- Configurar `FRONTEND_URL` con el dominio real del frontend.
- Ejecutar los scripts SQL en la base de datos de producción.
- Configurar un proxy inverso (Nginx, Caddy, etc.) si se desea servir el frontend y backend bajo el mismo dominio.

### Frontend

```bash
npm run build
npm run deploy
```

El proyecto está configurado para desplegarse en GitHub Pages mediante `gh-pages`. La ruta base está definida en `vite.config.js` como `/E-commerce_react/`.

### Backend

```bash
cd backend
npm start
```

Para producción, se recomienda usar un gestor de procesos como PM2 o systemd para mantener el servicio en ejecución y reiniciarlo automáticamente.

---

## 🐛 Solución de problemas

| Problema | Causa probable | Solución |
|-----------|----------------|----------|
| `Faltan variables de entorno` al iniciar el backend | Variables requeridas no definidas en `.env` | Verificar `DB_HOST`, `DB_USER`, `DB_NAME`, `JWT_SECRET`. |
| `No fue posible conectar con MySQL al iniciar la API` | MySQL no está en ejecución o credenciales incorrectas | Verificar servicio MySQL y valores de `DB_*`. |
| Error 403 en endpoints mutantes | Token CSRF faltante o inválido | Asegurarse de que la cookie `_csrf` esté presente y el header `X-CSRF-Token` se envíe. |
| Error 401 tras login | Token expirado o JWT_SECRET cambiado | Volver a iniciar sesión. No cambiar `JWT_SECRET` en producción sin invalidar sesiones. |
| Carrito vacío después de login | No se pudo fusionar el carrito guest | Verificar que el usuario esté autenticado y que el backend responda correctamente. |
| Correos no enviados | Variables SMTP no configuradas o incorrectas | Verificar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. |

---

## 📊 Estado actual del proyecto

### ✅ Implementado y funcional

- [x] Catálogo de productos con paginación y filtros.
- [x] Registro e inicio de sesión con JWT.
- [x] Cierre de sesión con revocación de token.
- [x] Carrito de compras guest (localStorage).
- [x] Carrito de compras autenticado (base de datos).
- [x] Merge de carrito guest al iniciar sesión.
- [x] Checkout con formulario de envío.
- [x] Creación de pedidos (pago contraentrega).
- [x] Consulta y gestión de pedidos por parte del usuario.
- [x] Panel administrativo completo (productos, categorías, usuarios, órdenes, home section).
- [x] Sección de inicio administrable (título y productos destacados).
- [x] Envío de correo de confirmación de compra.
- [x] Protección CSRF en métodos mutantes.
- [x] Rate limiting en rutas de autenticación.
- [x] Pruebas unitarias y de integración (frontend y backend).
- [x] Despliegue en GitHub Pages configurado.
- [x] Botón de WhatsApp opcional.

### ⚠️ Parcial

- [ ] Recuperación de contraseña (solo enlace estático).
- [ ] Inicio de sesión social (botones decorativos).
- [ ] Estados de pedido (solo `pending`).

### ❌ Pendiente

- [ ] Pasarela de pagos en línea.
- [ ] Control de inventario/stock.
- [ ] Valoraciones y reseñas de productos.
- [ ] Página de contacto.
- [ ] Búsqueda avanzada y filtros adicionales.
- [ ] Notificaciones en tiempo real.
- [ ] Internacionalización (i18n).

---

## 🗺️ Roadmap

```text
[COMPLETAR ROADMAP]
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Crea un fork del repositorio.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y agrega pruebas si aplica.
4. Asegúrate de que el linter y las pruebas pasen.
5. Envía un pull request.

---

## 👤 Autor

- **Autor:** [COMPLETAR]
- **GitHub:** [COMPLETAR_URL]
- **LinkedIn:** [COMPLETAR_URL]

---

## 📞 Contacto

- **Correo:** [COMPLETAR_CORREO]
- **Sitio web:** [COMPLETAR_URL]
- **Repositorio:** [COMPLETAR_URL]
- **Demo:** [COMPLETAR_URL]

---

## 📄 Licencia

[COMPLETAR LICENCIA]

---

> Documentación generada mediante análisis estático del código fuente.
> Si encuentras discrepancias entre esta documentación y el comportamiento real del proyecto, por favor repórtalo.