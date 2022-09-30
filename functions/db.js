let pg = require('pg')

const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'demo_position',
    password: 'postgres',
    port: 5432,
}


const pool = new pg.Pool(config)

module.exports = {
    pool
}