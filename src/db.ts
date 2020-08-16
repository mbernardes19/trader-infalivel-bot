import { Connection, createConnection } from 'mysql';

let connection: Connection;

console.log(parseInt(process.env.DB_PORT, 10))

if (process.env.NODE_ENV === 'production') {
    connection = createConnection({
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10)
    })
} else {
    connection = createConnection({
        host: process.env.DB_TEST_HOST,
        database: process.env.DB_TEST_DATABASE,
        user: process.env.DB_TEST_USER,
        password: process.env.DB_TEST_PASSWORD
    })
}

export { connection }
