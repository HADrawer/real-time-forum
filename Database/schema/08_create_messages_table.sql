CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  isRead INTEGER DEFAULT 0,
  FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
);