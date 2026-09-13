# AGENTS.md

## Proyecto: E-commerce React

## Arquitectura general

Este es un proyecto full-stack dividido en dos partes principales:

- **Frontend**: Aplicación SPA con Vite + React, ubicada en la raíz del proyecto.
- **Backend**: API REST con Node.js + Express, ubicada en la carpeta `backend/`.

Frontend y backend se comunican mediante peticiones HTTP con credenciales incluidas.

## Frontend

- **React** 18.3.1
- **Vite** 6.0.1 como bundler y servidor de desarrollo
- **React Router DOM** 6.14.3 para enrutamiento
- **Redux Toolkit** 2.4.0 + **React Redux** 9.1.2 para estado global
- **Formik** 2.4.6 + **Yup** 1.3.0 para formularios y validación
- **MDB React UI Kit** 9.0.0 como librería de componentes UI
- **Font Awesome** 6.7.1 para iconografía
- **React Toastify** para notificaciones toast

### Configuración
- `vite.config.js`: define puerto 5173 en desarrollo, integración con Vitest para pruebas unitarias.
- `eslint.config.js`: configuración de lint para React.
- `.prettierrc` / `.prettierignore`: formato de código.

## Backend

- **Node.js** con **Express** 4.21.2
- **MySQL** como base de datos, accedida mediante **mysql2** con pool de conexiones
- **jsonwebtoken** 9.0.2 para autenticación basada en JWT
- **bcryptjs** para hashing de contraseñas
- **cookie-parser** para lectura de cookies
- **CORS** configurado con whitelist de orígenes desde `FRONTEND_URL`
- **Helmet** para headers de seguridad HTTP
- **express-rate-limit** para limitación de tasa
- **nodemailer** para envío de correos
- **Jest** + **supertest** para pruebas del backend
- **nodemon** en desarrollo

## Base de datos

- **MySQL** (motor relacional)
- Acceso mediante pool de conexiones (`mysql2.createPool`) con límite de 10 conexiones.
- Variables requeridas: `DB_HOST`, `DB_PORT` (default 3306), `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.
- Tablas principales: users, products, categories, orders, carts, home_section.

## Estructura principal de carpetas

```
E-commerce_react-main1/
├── src/
│   ├── components/          # Componentes reutilizables (Header, Footer, ProductCard, etc.)
│   ├── pages/               # Vistas/páginas (Home, Cart, Checkout, Admin, Auth, etc.)
│   ├── features/            # Estado global Redux (authSlice, cartSlice)
│   ├── services/            # Clientes API para frontend
│   ├── utils/               # Utilidades (formatPrice, orderStatusLabels)
│   ├── test/                # Pruebas unitarias e integración con Vitest
│   ├── App.jsx              # Definición de rutas
│   ├── main.jsx             # Punto de entrada
│   └── App.css              # Estilos globales
├── backend/
│   └── src/
│       ├── server.js        # Configuración central de Express
│       ├── config/
│       │   └── db.js        # Pool de conexiones MySQL
│       ├── middleware/      # Auth, CSRF, errores, admin, rate limit
│       ├── routes/          # Rutas REST por recurso
│       ├── controllers/     # Controladores HTTP
│       ├── services/        # Lógica de negocio
│       └── models/          # Acceso directo a datos (productModel, etc.)
├── public/
├── .kilo/
│   ├── agents/              # Agentes especializados Kilo
│   └── rules/               # Reglas adicionales (vacío por compatibilidad)
├── package.json             # Dependencias frontend
├── vite.config.js
├── eslint.config.js
└── .env
```

## Comunicación frontend <-> backend

- **Protocolo**: HTTP + JSON.
- **API URL**: `import.meta.env.VITE_API_URL` o `http://localhost:3001/api` por defecto.
- **Credenciales**: `fetch` con `credentials: 'include'` para enviar cookies.
- **CSRF**: Doble cookie. Backend expone cookie `_csrf` y valida header `X-CSRF-Token` en métodos mutantes.
- **Autenticación**: JWT almacenado en cookie `auth_token` con `httpOnly` y `sameSite` según entorno. También se soporta token Bearer en header `Authorization`.
- **Revocación**: Token blacklist en memoria para logout (con límite de 10,000 tokens).
- **Respuestas**: Formato `{ success, data, message }` con `ApiError` personalizado.

## Reglas generales para modificar código

1. **Analizar primero**: Leer el código existente, entender el flujo y las convenciones antes de modificar.
2. **No inventar**: No agregar archivos, endpoints, tablas, funciones o dependencias que no existan sin necesidad.
3. **Mantener arquitectura**: Respetar la separación frontend/backend, la estructura de carpetas y el flujo de datos actual.
4. **Reutilizar antes de crear**: Buscar componentes, servicios, slices o utilidades existentes antes de crear nuevos.
5. **Ámbito específico**: Cada agente solo debe modificar archivos dentro de su especialidad, salvo integración estrictamente necesaria.
6. **No eliminar código funcional sin autorización**: Si hay que reemplazar, hacerlo de forma explícita y documentada.
7. **No exponer secretos**: Nunca registrar, loggear ni hardcodear valores de `.env` o secretos.
8. **Manejo de variables de entorno**: Usar `process.env` en backend y `import.meta.env` en frontend. Validar existencia de variables requeridas antes de iniciar.
9. **Convenciones**:
   - Backend: ESM, controladores en `controllers/`, lógica en `services/`, acceso a datos en `models/`.
   - Frontend: Componentes en PascalCase en `components/` y `pages/`, hooks personalizados en `hooks/`, estado global en `features/`.
   - Rutas Express definidas en `routes/`, montadas en `server.js`.
10. **Pruebas**: Ejecutar `npm test` o `npm run lint` cuando corresponda antes y después de cambios.
11. **No instalar dependencias innecesarias**: Verificar primero si una funcionalidad puede resolverse con dependencias existentes.
12. **Explicar cambios**: Documentar claramente qué se modificó, por qué y qué archivos fueron tocados.

## Seguridad

- No exponer claves JWT, contraseñas, tokens ni secretos en logs, commits ni frontend.
- El backend expone headers de seguridad mediante Helmet.
- Contraseñas hasheadas con bcryptjs.
- Cookies `httpOnly` en producción, `sameSite: 'none'` solo en producción con `secure: true`.
- Validación de CSRF en métodos mutantes.
- CORS restringido por whitelist.
- Rate limiting en rutas sensibles (`/api/auth`).

## Ejecución

### Frontend
```bash
npm run dev      # Servidor de desarrollo en http://localhost:5173
npm run build    # Build para producción en dist/
npm run test     # Pruebas con Vitest
npm run lint     # Lint con ESLint
npm run format   # Formato con Prettier
```

### Backend
```bash
cd backend && npm run dev   # Servidor con nodemon en http://localhost:3001
cd backend && npm start     # Servidor en producción
cd backend && npm test      # Pruebas con Jest
```
