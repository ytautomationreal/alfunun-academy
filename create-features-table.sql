-- Create features table if it doesn't exist
CREATE TABLE IF NOT EXISTS features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Monitor',
    col_span VARCHAR(50) DEFAULT 'md:col-span-1',
    bg_class VARCHAR(100) DEFAULT 'bg-zinc-900/50',
    sort_order INT DEFAULT 0
);
