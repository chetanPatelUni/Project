ALTER TABLE addresses
ADD CONSTRAINT fk_addresses_users
FOREIGN KEY (user_id)
REFERENCES users(user_id);

ALTER TABLE merchants
ADD CONSTRAINT fk_merchants_users
FOREIGN KEY (user_id)
REFERENCES users(user_id);

ALTER TABLE customization_requests
ADD CONSTRAINT fk_customization_requests_users
FOREIGN KEY (user_id)
REFERENCES users(user_id);

ALTER TABLE designer_proposals
ADD CONSTRAINT fk_designer_proposals_requests
FOREIGN KEY (request_id)
REFERENCES customization_requests(request_id);

ALTER TABLE designer_proposals
ADD CONSTRAINT fk_designer_proposals_merchants
FOREIGN KEY (merchant_id)
REFERENCES merchants(merchant_id);

ALTER TABLE payments
ADD CONSTRAINT fk_payments_users
FOREIGN KEY (user_id)
REFERENCES users(user_id);

ALTER TABLE payments
ADD CONSTRAINT fk_payments_merchants
FOREIGN KEY (merchant_id)
REFERENCES merchants(merchant_id);

ALTER TABLE payments
ADD CONSTRAINT fk_payments_orders
FOREIGN KEY (order_id)
REFERENCES orders(order_id);

ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_users
FOREIGN KEY (user_id)
REFERENCES users(user_id);

ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_merchants
FOREIGN KEY (merchant_id)
REFERENCES merchants(merchant_id);

ALTER TABLE chat
ADD CONSTRAINT fk_chat_sender
FOREIGN KEY (sender_id)
REFERENCES users(user_id);

ALTER TABLE chat
ADD CONSTRAINT fk_chat_receiver
FOREIGN KEY (receiver_id)
REFERENCES users(user_id);