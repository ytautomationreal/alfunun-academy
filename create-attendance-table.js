const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createAttendanceTable() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log("Connected to DB.");

        // Check if table exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                status ENUM('present', 'absent', 'leave') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_date (date),
                INDEX idx_student_id (student_id),
                UNIQUE KEY unique_attendance (student_id, date)
            )
        `);

        console.log("Attendance table created successfully.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

createAttendanceTable();
