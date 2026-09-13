# Backend de la tienda

## Configuración

1. Copia `.env.example` a `.env` si todavía no existe.
2. Completa `DB_USER`, `DB_PASSWORD`, `DB_NAME` y genera un valor seguro para `JWT_SECRET`.
3. Crea una base de datos vacía en MySQL con el nombre configurado en `DB_NAME`.
4. Ejecuta `database/schema.sql` dentro de esa base de datos.
5. Ejecuta `database/seed-products.sql` para cargar los productos actuales.

Los scripts SQL no eliminan tablas ni sobrescriben registros existentes.

## Comandos

```bash
npm run dev
npm start
```

La API se inicia en `http://localhost:3001`. El endpoint `GET /api/health` verifica la conexión con MySQL.
