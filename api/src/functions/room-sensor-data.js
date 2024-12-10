const { app } = require('@azure/functions');

const sql = require('mssql');
const { dbConfig } = require('./shared/config');

app.http('room-sensor-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-sensor-data/{sensorId?}',
    handler: async (request, context) => {
        const headers = corsHeaders(request.headers.get('origin'));

        if (request.method === 'OPTIONS') {
            return { status: 204, headers };
        }

        const sensorId = request.params.sensorId;
        let pool;

        try {
            pool = await sql.connect(dbConfig);
            
            if (!pool.connected) {
                return {
                    status: 503,
                    headers,
                    body: JSON.stringify({
                        error: 'Database Connection Error',
                        message: 'Could not establish database connection',
                    }),
                };
            }

            let query = `
                SELECT
                    sensor_id,
                    temperature AS current_temp,
                    humidity AS current_humidity,
                    timestamp AS last_updated
                FROM SENSOR
            `;
            
            if (sensorId) {
                query += ' WHERE sensor_id = @sensorId';
            }

            const dbRequest = pool.request();
            if (sensorId) {
                dbRequest.input('sensorId', sql.VarChar, sensorId);
            }

            const result = await dbRequest.query(query);
            
            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers,
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: sensorId ? `Sensordaten für Sensor ${sensorId} nicht gefunden` : 'Keine Sensordaten gefunden',
                    }),
                };
            }

            return {
                status: 200,
                headers,
                body: JSON.stringify(sensorId ? result.recordset[0] : result.recordset),
            };
        } catch (error) {
            context.error('Fehler aufgetreten:', error);
            return {
                status: 500,
                headers,
                body: JSON.stringify({
                    error: 'Interner Serverfehler',
                    message: error.message,
                }),
            };
        } finally {
            if (pool) await pool.close();
        }
    }
});