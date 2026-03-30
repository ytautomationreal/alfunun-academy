CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fatherName VARCHAR(255) NOT NULL,
    cnic VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    course VARCHAR(100) NOT NULL,
    feeStatus ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
    admissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Monitor',
    col_span VARCHAR(50) DEFAULT 'md:col-span-1',
    bg_class VARCHAR(100) DEFAULT 'bg-zinc-900/50',
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS technologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Code2'
);
