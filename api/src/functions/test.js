const { app } = require('@azure/functions');
const sql = require('mssql');
const { dbConfig } = require('./shared/config');

app.http('test', {
   methods: ['GET'],
   authLevel: 'anonymous', 
   route: 'test',
   handler: async (request, context) => {
       let pool;
       try {

           // Verbindung aufbauen
           pool = await sql.connect(dbConfig);
            
           // Query ausführen
           const result = await pool.request()
               .query(`
                SELECT
                    sensor_id,
                    temperature AS current_temp,
                    humidity AS current_humidity,
                    timestamp AS last_updated
                FROM SENSOR
            `
            );

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