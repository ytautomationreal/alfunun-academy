const pool = require('./src/lib/db');

async function checkFees() {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id, 
                name, 
                admissionDate,
                admissionFeeAmount, 
                admissionFeeStatus,
                monthlyFeeAmount,
                monthlyFeeStatus
            FROM students
        `);

        console.log("Student Data:");
        console.table(rows);

        const [revenue] = await pool.query(`
             SELECT 
                DATE_FORMAT(admissionDate, '%b') as name,
                SUM(CASE WHEN admissionFeeStatus = 'Paid' THEN admissionFeeAmount ELSE 0 END) +
                SUM(CASE WHEN monthlyFeeStatus = 'Paid' THEN monthlyFeeAmount ELSE 0 END) as revenue
            FROM students
            WHERE admissionDate IS NOT NULL
            GROUP BY name
        `);
        console.log("Chart Query Result:");
        console.table(revenue);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkFees();
