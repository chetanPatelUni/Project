ALTER TABLE orders
ADD COLUMN merchant_id INTEGER REFERENCES merchants(merchant_id);

ALTER TABLE payments
ADD COLUMN customer_id INTEGER REFERENCES users(user_id),
ADD COLUMN payout_date TIMESTAMP;

-- Assuming you have a 'wishlist' table (not in the original schema)
ALTER TABLE wishlist
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Assuming you have a 'blog_posts' table (not in the original schema)
ALTER TABLE blog_posts
ADD COLUMN status VARCHAR(20) DEFAULT 'draft',
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE chat
ADD COLUMN message_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN read_status BOOLEAN DEFAULT FALSE;

-- Assuming you have a 'notifications' table (not in the original schema)
ALTER TABLE notifications
ADD COLUMN notification_type VARCHAR(20) NOT NULL,
ADD COLUMN expires_at TIMESTAMP;

ALTER TABLE customization_requests
ADD COLUMN due_date DATE,
ADD COLUMN priority VARCHAR(20) DEFAULT 'normal',
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE designer_proposals
ADD COLUMN proposal_details TEXT,
ADD COLUMN revision_number INTEGER DEFAULT 1,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN last_login TIMESTAMP;