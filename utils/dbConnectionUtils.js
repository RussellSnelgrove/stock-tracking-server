const { Pool } = require('pg');

const { postgresDB } = require('../config/config.js');
const { logger } = require('./logger.js')

const pool = new Pool({
    user: postgresDB.user,
    host: 'localhost',
    database: postgresDB.db,
    password: postgresDB.password,
    port: 5432,
});

async function queryDatabase(query, params = []) {
    try {
        const res = await pool.query(query, params);
        return res.rows;
    } catch (err) {
        logger.error(`Database query error: ${err}`);
        throw err;
    }
}

async function insertUpdateDatabase(query, params = []) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const res = await client.query(query, params);
        await client.query('COMMIT');
        return res;
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`Database query error: ${err}`);
        throw err;
    } finally {
        client.release();

    }
}

// Only call if running batch scripts are done
// Do not call when app is actively running and may need to make additional connections
function closeDatabase() {
    pool.end();
}

module.exports = {
    queryDatabase,
    insertUpdateDatabase,
    closeDatabase,
};
