const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('test', {
   methods: ['GET'],
   authLevel: 'anonymous', 
   route: 'test',
   handler: async (request, context) => {
       let pool;
       try {
           const config = {
               user: process.env.DB_USER,
               password: process.env.DB_PASSWORD,
               server: process.env.DB_SERVER,
               database: process.env.DB_DATABASE,
               options: {
                   encrypt: true,
                   trustServerCertificate: false
               }
           };

           // Verbindung aufbauen
           pool = await sql.connect(config);
           
           // Query ausführen
           const result = await pool.request()
               .query('SELECT update_interval FROM settings');

           return {
               status: 200,
               jsonBody: {
                   message: 'API is working',
                   env: {
                       hasDbUser: !!process.env.DB_USER,
                       hasDbPassword: !!process.env.DB_PASSWORD,
                       hasDbServer: !!process.env.DB_SERVER,
                       hasDbDatabase: !!process.env.DB_DATABASE
                   },
                   data: result.recordset
               }
           };
       } catch (error) {
           context.error('Database error:', error);
           return {
               status: 500,
               jsonBody: {
                   message: 'Database connection failed',
                   error: error.message,
                   code: error.code
               }
           };
       } finally {
           if (pool) {
               await pool.close();
           }
       }
   }
});