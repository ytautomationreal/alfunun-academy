const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Default fees map
const COURSE_FEES = {
    "Web Designing": 3000,
    "Web Development": 4000,
    "Graphic Designing": 3000,
    "Office Automation": 2500,
    "Basic Computer Skills": 2000,
    "Digital Marketing": 3500,
    "Python Programming": 4000,
    // Add variations just in case
    "Graphic Design": 3000,
};

const DEFAULT_FEE = 3000;
const DEFAULT_ADMISSION_FEE = 1000;

async function fixFees() {
    try {
        console.log("Connecting to database...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("Fetching students with 0 fees...");
        const [students] = await connection.execute(
            'SELECT id, name, course, admissionFeeAmount, monthlyFeeAmount FROM students WHERE admissionFeeAmount = 0 OR monthlyFeeAmount = 0 OR admissionFeeAmount IS NULL OR monthlyFeeAmount IS NULL'
        );

        console.log(`Found ${students.length} students to update.`);

        for (const student of students) {
            let monthlyFee = student.monthlyFeeAmount;
            let admissionFee = student.admissionFeeAmount;
            let updated = false;

            if (!monthlyFee || monthlyFee === 0) {
                // Try to find fee by course name
                monthlyFee = COURSE_FEES[student.course] || DEFAULT_FEE;
                updated = true;
            }

            if (!admissionFee || admissionFee === 0) {
                admissionFee = DEFAULT_ADMISSION_FEE;
                updated = true;
            }

            if (updated) {
                console.log(`Updating ${student.name} (${student.course}): Adm=${admissionFee}, Mth=${monthlyFee}`);
                await connection.execute(
                    'UPDATE students SET admissionFeeAmount = ?, monthlyFeeAmount = ? WHERE id = ?',
                    [admissionFee, monthlyFee, student.id]
                );
            }
        }

        console.log("Migration complete!");
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

fixFees();
