CREATE TABLE sessions (
  user_id INTEGER NOT NULL,
  session_id VARCHAR(36) PRIMARY KEY,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);