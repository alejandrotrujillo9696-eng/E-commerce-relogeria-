-- Datos iniciales extraídos del catálogo actual del frontend.
-- INSERT IGNORE permite ejecutar el seed otra vez sin sobrescribir registros existentes.

INSERT IGNORE INTO categories (name) VALUES
  ('Diver'),
  ('Classic'),
  ('Modern'),
  ('Bracelet'),
  ('Vintage');

INSERT IGNORE INTO products (id, name, description, price, image_url, category_id) VALUES
  (1, 'Pro-mariner', 'Pro-mariner es un reloj profesional de buceo automático con fondo transparente', 364.99, 'https://classiquewatches.com/cdn/shop/files/9002W-KBKV.png?v=1730775923', (SELECT id FROM categories WHERE name = 'Diver')),
  (2, 'Ryan', 'Ryan es un reloj clásico y elegante con movimiento suizo de cuarzo', 465.00, 'https://classiquewatches.com/cdn/shop/files/28-149G-XBU0.png?v=1731979866', (SELECT id FROM categories WHERE name = 'Classic')),
  (3, 'Brooks', 'El reloj Brooks presenta una caja rectangular y brazalete', 497.99, 'https://classiquewatches.com/cdn/shop/files/28-114G-XBC9.png?v=1731458264', (SELECT id FROM categories WHERE name = 'Modern')),
  (4, 'Brooklyn', 'El reloj Brooklyn presenta una caja rectangular y brazalete', 649.00, 'https://classiquewatches.com/cdn/shop/files/28-113W-XBMD.png?v=1731458050', (SELECT id FROM categories WHERE name = 'Modern')),
  (5, 'Rory', 'El reloj Rory presenta una esfera redonda clásica con brazalete de malla de acero inoxidable', 329.00, 'https://classiquewatches.com/cdn/shop/files/28-151G-XKW0.png?v=1732516507', (SELECT id FROM categories WHERE name = 'Diver')),
  (6, 'Sterling', 'Sterling es un reloj audaz y sofisticado con movimiento suizo de cuarzo', 479.00, 'https://classiquewatches.com/cdn/shop/files/28-101G-XBU0.png?v=1730776028', (SELECT id FROM categories WHERE name = 'Bracelet')),
  (7, 'Vintage Square Shape Ring Ladies Watch', 'Diseño único y audaz, este reloj anillo es la forma perfecta de realzar tu estilo', 187.00, 'https://classiquewatches.com/cdn/shop/files/28-70G-XOSI.jpg?v=1731468307', (SELECT id FROM categories WHERE name = 'Vintage')),
  (8, 'Vintage Round Shape Ring Ladies Watch', 'Diseño único y audaz, este reloj anillo es la forma perfecta de realzar tu estilo', 192.00, 'https://classiquewatches.com/cdn/shop/files/28-69G-XOSI.jpg?v=1731461600', (SELECT id FROM categories WHERE name = 'Vintage')),
  (9, 'Vintage Square Half Bangle Ladies Watch', 'Reloj moderno y elegante con cara cuadrada y brazalete plano', 210.00, 'https://classiquewatches.com/cdn/shop/files/18-86W-XGWN.jpg?v=1730935207', (SELECT id FROM categories WHERE name = 'Vintage')),
  (10, 'Sienna', 'Una interpretación única del diseño clásico de brazalete, con banda detallada', 299.00, 'https://classiquewatches.com/cdn/shop/files/18-89G-XGWR.png?v=1730776002', (SELECT id FROM categories WHERE name = 'Vintage'));
