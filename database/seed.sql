-- Leo GameZone Seed Data

USE leo_gamezone;

-- Insert admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES
('usr_0000000001', 'admin', 'admin@leogamezone.com', '$2a$10$7Zt8G9HjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzA', 'admin', 'System Administrator');

-- Insert staff user (password: staff123)
INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES
('usr_0000000002', 'staff1', 'staff@leogamezone.com', '$2a$10$8Zt8G9HjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzB', 'staff', 'John Staff');

-- Insert sample snacks
INSERT INTO snacks (id, name, description, price, quantity, category, supplier) VALUES
('snk_0000000001', 'Popcorn', 'Butter-flavored popcorn', 3.50, 50, 'Snacks', 'Snack Supply Co'),
('snk_0000000002', 'Nachos', 'Cheese nachos with salsa', 4.00, 30, 'Snacks', 'Snack Supply Co'),
('snk_0000000003', 'Soda', 'Coca-Cola 500ml', 2.50, 100, 'Beverages', 'Beverage Distributors'),
('snk_0000000004', 'Water', 'Bottled water 500ml', 1.50, 80, 'Beverages', 'Beverage Distributors'),
('snk_0000000005', 'Candy', 'Assorted candy pack', 2.00, 60, 'Sweets', 'Sweet Treats Inc'),
('snk_0000000006', 'Hot Dog', 'Classic hot dog with condiments', 4.50, 25, 'Food', 'Food Supply Co');

-- Insert sample games
INSERT INTO games (id, name, description, type, price_per_hour, max_players, status) VALUES
('gam_0000000001', 'PS5 - FIFA 24', 'Latest FIFA game on PlayStation 5', 'Console', 5.00, 2, 'available'),
('gam_0000000002', 'Xbox - Forza Horizon', 'Racing game on Xbox Series X', 'Console', 5.00, 2, 'available'),
('gam_0000000003', 'PC - Counter-Strike 2', 'Competitive FPS on PC', 'PC', 4.00, 5, 'available'),
('gam_0000000004', 'Nintendo Switch - Mario Kart', 'Family racing game', 'Console', 4.00, 4, 'available'),
('gam_0000000005', 'VR - Beat Saber', 'Virtual reality rhythm game', 'VR', 7.00, 1, 'available'),
('gam_0000000006', 'Arcade - Street Fighter', 'Classic fighting game arcade', 'Arcade', 3.00, 2, 'available');

-- Insert sample game sessions
INSERT INTO game_sessions (id, game_id, user_id, customer_name, start_time, end_time, total_amount, status) VALUES
('ses_0000000001', 'gam_0000000001', 'usr_0000000002', 'Alice Johnson', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 10.00, 'completed'),
('ses_0000000002', 'gam_0000000003', 'usr_0000000002', 'Bob Smith', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 8.00, 'completed');

-- Insert sample payments
INSERT INTO payments (id, session_id, amount, payment_method, status, payment_date) VALUES
('pay_0000000001', 'ses_0000000001', 10.00, 'cash', 'completed', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('pay_0000000002', 'ses_0000000002', 8.00, 'card', 'completed', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Insert sample snack sales
INSERT INTO snack_sales (id, session_id, snack_id, quantity, price_at_sale) VALUES
('sal_0000000001', 'ses_0000000001', 'snk_0000000001', 2, 3.50),
('sal_0000000002', 'ses_0000000001', 'snk_0000000003', 1, 2.50);
