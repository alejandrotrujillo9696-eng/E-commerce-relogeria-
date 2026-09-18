import request from 'supertest';
import { app } from '../src/server.js';
import pool from '../src/config/db.js';

const uniqueEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@test.com`;

const getCsrfToken = async (agent) => {
  const initRes = await agent.get('/api/products');
  const cookieHeader = initRes.headers['set-cookie'];
  const csrfCookie = (cookieHeader || []).find((cookie) => cookie.startsWith('_csrf='));
  if (!csrfCookie) {
    return '';
  }

  const match = csrfCookie.match(/_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
};

const ensureHomeSectionTables = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS home_sections (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL DEFAULT 'Nuestra colección exclusiva de relojes',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS home_section_items (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      home_section_id BIGINT UNSIGNED NOT NULL,
      product_id BIGINT UNSIGNED NOT NULL,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_home_section_items_section (home_section_id),
      KEY idx_home_section_items_product (product_id),
      CONSTRAINT fk_home_section_items_section
        FOREIGN KEY (home_section_id) REFERENCES home_sections (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      CONSTRAINT fk_home_section_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      UNIQUE KEY uq_home_section_items_section_product (home_section_id, product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

const ensureProductsStockColumn = async () => {
  const [columns] = await pool.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stock'"
  );
  if (!columns.length) {
    await pool.execute("ALTER TABLE products ADD COLUMN stock INT UNSIGNED NOT NULL DEFAULT 0");
  }
};

describe('Backend integration tests', () => {
  beforeAll(async () => {
    await ensureHomeSectionTables();
    await ensureProductsStockColumn();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('AUTH', () => {
    test('POST /api/auth/register -> 201 y devuelve usuario sin password_hash', async () => {
      const email = uniqueEmail('reg');
      const agent = request.agent(app);
      const response = await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email);
      expect(response.body.data.user.role).toBe('customer');
      expect(response.body.data.user.password_hash).toBeUndefined();
    });

    test('POST /api/auth/login -> 200 y devuelve usuario', async () => {
      const email = uniqueEmail('login');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      const response = await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email);
    });

    test('GET /api/auth/me autenticado -> 200', async () => {
      const email = uniqueEmail('me');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const response = await agent.get('/api/auth/me');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email);
    });

    test('GET /api/auth/me prioriza Bearer sobre una cookie distinta', async () => {
      const cookieUserEmail = uniqueEmail('cookie-user');
      const bearerUserEmail = uniqueEmail('bearer-user');
      const cookieAgent = request.agent(app);
      const bearerAgent = request.agent(app);

      await cookieAgent
        .post('/api/auth/register')
        .send({ firstName: 'Cookie', lastName: 'User', email: cookieUserEmail, password: 'test1234' });
      const bearerLogin = await bearerAgent
        .post('/api/auth/register')
        .send({ firstName: 'Bearer', lastName: 'User', email: bearerUserEmail, password: 'test1234' });

      const response = await cookieAgent
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${bearerLogin.body.data.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe(bearerUserEmail);
    });

    test('GET /api/auth/me no autenticado -> 401', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });

    test('POST /api/auth/logout autenticado -> 200', async () => {
      const email = uniqueEmail('logout');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const csrfToken = await getCsrfToken(agent);

      const response = await agent
        .post('/api/auth/logout')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /api/auth/logout sin autenticación -> 200 (no requiere auth)', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCsrfToken(agent);

      const response = await agent
        .post('/api/auth/logout')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken);

      expect(response.status).toBe(200);
    });
  });

  describe('PRODUCTS', () => {
    test('GET /api/products -> 200', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    test('GET /api/products/:id -> producto existente', async () => {
      const response = await request(app).get('/api/products/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.id).toBe(1);
    });

    test('GET /api/products/:id -> producto inexistente -> 404', async () => {
      const response = await request(app).get('/api/products/999');
      expect(response.status).toBe(404);
    });

    test('GET /api/products/categories -> 200', async () => {
      const response = await request(app).get('/api/products/categories');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.categories)).toBe(true);
    });
  });

  describe('CART', () => {
    test('usuario autenticado puede consultar carrito -> 200', async () => {
      const email = uniqueEmail('cart');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const response = await agent.get('/api/cart');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('usuario no autenticado recibe 401 en /api/cart', async () => {
      const response = await request(app).get('/api/cart');
      expect(response.status).toBe(401);
    });

    test('agregar producto al carrito -> 201', async () => {
      const email = uniqueEmail('cartadd');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      await pool.execute('UPDATE products SET stock = 10 WHERE id = 1');

      const csrfToken = await getCsrfToken(agent);

      const response = await agent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 1, quantity: 1 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('ORDERS', () => {
    test('usuario autenticado puede crear una orden -> 201', async () => {
      const email = uniqueEmail('order');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const csrfToken = await getCsrfToken(agent);

      await pool.execute('UPDATE products SET stock = 10 WHERE id = 1');

      await agent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 1, quantity: 1 });

      const response = await agent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({
          shippingName: 'Test User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(Number(response.body.data.order.total)).toBeGreaterThan(0);
      expect(response.body.data.order.status).toBe('pending');
      expect(response.body.data.order.created_at).toBeDefined();
      expect(new Date(response.body.data.order.created_at).toString()).not.toBe('Invalid Date');
      expect(response.body.data.order.shipping_name).toBe('Test User');
      expect(response.body.data.order.shipping_address).toBe('Calle 1');
      expect(response.body.data.order.shipping_city).toBe('Bogotá');
      expect(response.body.data.order.shipping_zip).toBe('110111');
      expect(response.body.data.order.shipping_phone).toBe('1234567890');
    });

    test('usuario no autenticado recibe 403 en POST /api/orders por CSRF', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .send({
          shippingName: 'Test',
          shippingAddress: 'Calle',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '123',
        });

      expect(response.status).toBe(403);
    });

    test('usuario puede cancelar su propia orden pendiente', async () => {
      const email = uniqueEmail('cancel');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const csrfToken = await getCsrfToken(agent);

      await agent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 1, quantity: 1 });

      const createRes = await agent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({
          shippingName: 'Test User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      const orderId = createRes.body.data.order.id;

      const cancelRes = await agent
        .patch(`/api/orders/${orderId}/cancel`)
        .set('X-CSRF-Token', csrfToken);
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.data.status).toBe('cancelled');

      const detailRes = await agent.get(`/api/orders/${orderId}`);
      expect(detailRes.body.data.order.status).toBe('cancelled');
    });

    test('no puede cancelar orden de otro usuario', async () => {
      const email1 = uniqueEmail('cancelowner');
      const email2 = uniqueEmail('cancelother');
      const agent1 = request.agent(app);
      const agent2 = request.agent(app);

      await agent1
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Owner', lastName: 'User', email: email1, password: 'test1234' });

      await agent1
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: email1, password: 'test1234' });

      await agent2
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Other', lastName: 'User', email: email2, password: 'test1234' });

      await agent2
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: email2, password: 'test1234' });

      const csrfToken1 = await getCsrfToken(agent1);
      const csrfToken2 = await getCsrfToken(agent2);

      await agent1
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken1)
        .send({ productId: 1, quantity: 1 });

      const createRes = await agent1
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken1)
        .send({
          shippingName: 'Owner',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      const orderId = createRes.body.data.order.id;

      const cancelRes = await agent2
        .patch(`/api/orders/${orderId}/cancel`)
        .set('X-CSRF-Token', csrfToken2);
      expect(cancelRes.status).toBe(404);
    });
  });

  describe('ADMIN', () => {
    test('no autenticado -> 401 en /api/admin/orders', async () => {
      const response = await request(app).get('/api/admin/orders');
      expect(response.status).toBe(401);
    });

    test('customer -> 403 en /api/admin/orders', async () => {
      const email = uniqueEmail('admin403');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const response = await agent.get('/api/admin/orders');
      expect(response.status).toBe(403);
    });

    test('admin puede eliminar un usuario sin órdenes', async () => {
      const adminEmail = uniqueEmail('admindelete');
      const targetEmail = uniqueEmail('target');
      const adminAgent = request.agent(app);
      const targetAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const loginRes = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const userId = loginRes.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      await targetAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Target', lastName: 'User', email: targetEmail, password: 'test1234' });

      const targetUser = (await targetAgent.get('/api/auth/me')).body.data.user;

      const csrfToken = await getCsrfToken(adminAgent);

      const deleteRes = await adminAgent
        .delete(`/api/admin/users/${targetUser.id}`)
        .set('X-CSRF-Token', csrfToken);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.data.id).toBe(targetUser.id);
    });

    test('no puede eliminar un usuario que tiene órdenes asociadas', async () => {
      const adminEmail = uniqueEmail('adminblock');
      const targetEmail = uniqueEmail('targetorder');
      const adminAgent = request.agent(app);
      const targetAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const loginRes = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const userId = loginRes.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      await targetAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Target', lastName: 'User', email: targetEmail, password: 'test1234' });

      const targetUser = (await targetAgent.get('/api/auth/me')).body.data.user;

      const targetCsrfToken = await getCsrfToken(targetAgent);

      await targetAgent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', targetCsrfToken)
        .send({ productId: 1, quantity: 1 });

      await targetAgent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', targetCsrfToken)
        .send({
          shippingName: 'Target User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      const adminCsrfToken = await getCsrfToken(adminAgent);

      const deleteRes = await adminAgent
        .delete(`/api/admin/users/${targetUser.id}`)
        .set('X-CSRF-Token', adminCsrfToken);
      expect(deleteRes.status).toBe(409);
      expect(deleteRes.body.success).toBe(false);
      expect(deleteRes.body.message).toMatch(/pedidos asociados/i);

      const stillExists = await targetAgent.get('/api/auth/me');
      expect(stillExists.body.data.user.id).toBe(targetUser.id);
    });

    test('admin puede eliminar una orden existente', async () => {
      const adminEmail = uniqueEmail('admindeleteorder');
      const customerEmail = uniqueEmail('customerorder');
      const adminAgent = request.agent(app);
      const customerAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const adminLogin = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const adminUserId = adminLogin.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      await customerAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Customer', lastName: 'User', email: customerEmail, password: 'test1234' });

      await customerAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: customerEmail, password: 'test1234' });

      const customerCsrfToken = await getCsrfToken(customerAgent);

      await customerAgent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', customerCsrfToken)
        .send({ productId: 1, quantity: 1 });

      const orderRes = await customerAgent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', customerCsrfToken)
        .send({
          shippingName: 'Customer User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      const orderId = orderRes.body.data.order.id;

      const csrfToken = await getCsrfToken(adminAgent);

      const deleteRes = await adminAgent
        .delete(`/api/admin/orders/${orderId}`)
        .set('X-CSRF-Token', csrfToken);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.data.id).toBe(orderId);

      const notFound = await adminAgent.get(`/api/admin/orders/${orderId}`);
      expect(notFound.status).toBe(404);
    });

    test('no puede eliminar una orden inexistente', async () => {
      const adminEmail = uniqueEmail('admindeleteorder404');
      const adminAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const adminLogin = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const adminUserId = adminLogin.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const csrfToken = await getCsrfToken(adminAgent);

      const deleteRes = await adminAgent
        .delete('/api/admin/orders/999999')
        .set('X-CSRF-Token', csrfToken);
      expect(deleteRes.status).toBe(404);
    });

    test('admin puede buscar órdenes por ID', async () => {
      const adminEmail = uniqueEmail('adminsearch');
      const customerEmail = uniqueEmail('customersearch');
      const adminAgent = request.agent(app);
      const customerAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const adminLogin = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const adminUserId = adminLogin.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      await customerAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Customer', lastName: 'User', email: customerEmail, password: 'test1234' });

      await customerAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: customerEmail, password: 'test1234' });

      const customerCsrfToken = await getCsrfToken(customerAgent);

      await customerAgent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', customerCsrfToken)
        .send({ productId: 1, quantity: 1 });

      const orderRes = await customerAgent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', customerCsrfToken)
        .send({
          shippingName: 'Customer User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      const orderId = orderRes.body.data.order.id;

      const searchRes = await adminAgent.get(`/api/admin/orders?search=${orderId}`);
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.success).toBe(true);
      expect(searchRes.body.data.orders).toHaveLength(1);
      expect(searchRes.body.data.orders[0].id).toBe(orderId);
    });
  });

  describe('CSRF', () => {
    test('GET /api/products no requiere CSRF', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
    });

    test('POST /api/auth/register funciona sin CSRF', async () => {
      const email = uniqueEmail('csrfregister');
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      expect(response.status).toBe(201);
    });

    test('POST /api/auth/login funciona sin CSRF', async () => {
      const email = uniqueEmail('csrflogin');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      const response = await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      expect(response.status).toBe(200);
    });

    test('POST /api/orders con CSRF activo funciona', async () => {
      const email = uniqueEmail('csrforder');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const csrfToken = await getCsrfToken(agent);

      await agent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 1, quantity: 1 });

      const response = await agent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({
          shippingName: 'Test User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      expect(response.status).toBe(201);
    });

    test('PATCH /api/orders/:id/cancel con CSRF activo funciona', async () => {
      const email = uniqueEmail('csrfcancel');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const csrfToken = await getCsrfToken(agent);

      await agent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 1, quantity: 1 });

      const createRes = await agent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({
          shippingName: 'Test User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      const orderId = createRes.body.data.order.id;

      const cancelRes = await agent
        .patch(`/api/orders/${orderId}/cancel`)
        .set('X-CSRF-Token', csrfToken);
      expect(cancelRes.status).toBe(200);
    });

    test('DELETE /api/orders/:id con CSRF activo funciona', async () => {
      const email = uniqueEmail('csrfdeleteorder');
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Test', lastName: 'User', email, password: 'test1234' });

      await agent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, password: 'test1234' });

      const csrfToken = await getCsrfToken(agent);

      await agent
        .post('/api/cart/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 1, quantity: 1 });

      const createRes = await agent
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({
          shippingName: 'Test User',
          shippingAddress: 'Calle 1',
          shippingCity: 'Bogotá',
          shippingZip: '110111',
          shippingPhone: '1234567890',
        });

      const orderId = createRes.body.data.order.id;

      const deleteRes = await agent
        .delete(`/api/orders/${orderId}`)
        .set('X-CSRF-Token', csrfToken);
      expect(deleteRes.status).toBe(200);
    });

    test('POST /api/admin/products con CSRF activo funciona para admin', async () => {
      const adminEmail = uniqueEmail('csrfadmin');
      const adminAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const adminLogin = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const adminUserId = adminLogin.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const csrfToken = await getCsrfToken(adminAgent);

      const response = await adminAgent
        .post('/api/admin/products')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Producto CSRF',
          description: 'Producto de prueba CSRF',
          price: 100,
          imageUrl: 'https://example.com/image.png',
          categoryId: 1,
        });

      expect(response.status).toBe(201);
    });
  });

  describe('HOME SECTION', () => {
    beforeEach(async () => {
      await pool.execute('DELETE FROM home_section_items');
    });

    test('GET /api/home-section devuelve la sección con título por defecto', async () => {
      const response = await request(app).get('/api/home-section');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.title).toBe('string');
      expect(response.body.data.title.length).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    test('admin puede actualizar el título de la sección de inicio', async () => {
      const adminEmail = uniqueEmail('hometitle');
      const adminAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const adminLogin = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const adminUserId = adminLogin.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const csrfToken = await getCsrfToken(adminAgent);

      const response = await adminAgent
        .put('/api/admin/home-section/title')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ title: 'Título personalizado' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Título personalizado');
    });

    test('admin puede agregar un producto a la sección de inicio', async () => {
      const adminEmail = uniqueEmail('homeadd');
      const adminAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const adminLogin = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const adminUserId = adminLogin.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const csrfToken = await getCsrfToken(adminAgent);

      const response = await adminAgent
        .post('/api/admin/home-section/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 9 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('admin puede eliminar un producto de la sección de inicio', async () => {
      const adminEmail = uniqueEmail('homedel');
      const adminAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ firstName: 'Admin', lastName: 'User', email: adminEmail, password: 'test1234' });

      const adminLogin = await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const adminUserId = adminLogin.body.data.user.id;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

      await adminAgent
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: adminEmail, password: 'test1234' });

      const csrfToken = await getCsrfToken(adminAgent);

      const addRes = await adminAgent
        .post('/api/admin/home-section/items')
        .set('Content-Type', 'application/json')
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: 1 });

      expect(addRes.status).toBe(201);
      const itemId = addRes.body.data.id;

      const response = await adminAgent
        .delete(`/api/admin/home-section/items/${itemId}`)
        .set('X-CSRF-Token', csrfToken);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('usuario no autenticado no puede modificar la sección de inicio', async () => {
      const response = await request(app)
        .put('/api/admin/home-section/title')
        .set('Content-Type', 'application/json')
        .send({ title: 'Hacked' });
      expect(response.status).toBe(403);
    });

    test('usuario no autenticado no puede modificar la sección de inicio', async () => {
      const response = await request(app).put('/api/admin/home-section/title').set('Content-Type', 'application/json').send({ title: 'Hacked' });
      expect(response.status).toBe(403);
    });

    test('usuario no autenticado no puede modificar la sección de inicio', async () => {
      const response = await request(app)
        .put('/api/admin/home-section/title')
        .set('Content-Type', 'application/json')
        .send({ title: 'Hacked' });
      expect(response.status).toBe(403);
    });
  });
});
