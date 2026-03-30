const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addIndexes() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log('Adding database indexes for performance...');

        // It's safe to try adding indexes; if they exist, it might error or warn depending on DB version,
        // but typically we safeguard or just run it.
        // Simple way: Execute and catch specific "Duplicate key name" error or similar if strictly needed.
        // For this script, we'll try/catch each index creation.

        const queries = [
            "CREATE INDEX idx_student_date ON students(admissionDate)",
            "CREATE INDEX idx_student_name ON students(name)",
            "CREATE INDEX idx_student_course ON students(course)",
            "CREATE INDEX idx_student_group ON students(group_batch)",
            "CREATE INDEX idx_student_fees ON students(admissionFeeStatus, monthlyFeeStatus)"
        ];

        for (const query of queries) {
            try {
                await pool.execute(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`Index already exists (skipped): ${query}`);
                } else {
                    console.error(`Error executing ${query}:`, err.message);
                }
            }
        }

        console.log('Indexing complete.');

    } catch (error) {
        console.error('Connection Error:', error.message);
    } finally {
        await pool.end();
    }
}

addIndexes();
