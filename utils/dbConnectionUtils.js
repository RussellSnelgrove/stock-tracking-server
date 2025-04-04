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

function closeDatabase() {
    pool.end();
}

module.exports = {
    queryDatabase,
    closeDatabase,
};
