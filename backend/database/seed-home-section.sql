-- Seed data for home section configuration.
-- This ensures the home page has a default section with the current title and first 8 products.
-- Run this after schema.sql

INSERT INTO home_sections (title)
SELECT 'Nuestra colección exclusiva de relojes'
WHERE NOT EXISTS (SELECT 1 FROM home_sections);

INSERT INTO home_section_items (home_section_id, product_id, sort_order)
SELECT s.id, p.id, ROW_NUMBER() OVER (ORDER BY p.id ASC) - 1 AS sort_order
FROM home_sections s
CROSS JOIN products p
WHERE p.id IN (1, 2, 3, 4, 5, 6, 7, 8)
  AND NOT EXISTS (
    SELECT 1 FROM home_section_items hsi
    WHERE hsi.home_section_id = s.id AND hsi.product_id = p.id
  );
