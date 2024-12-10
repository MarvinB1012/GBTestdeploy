const { app } = require('@azure/functions');

const sql = require('mssql');
const { dbConfig } = require('./shared/config');

app.http('room-data', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'room-data/{roomId?}',
    handler: async (request, context) => {
        
        const headers = corsHeaders(request.headers.get('origin'));

        if (request.method === 'OPTIONS') {
            return { status: 204, headers };
        };

        let pool;
        try {
            // Verbindungstest vor dem eigentlichen Query
            pool = await sql.connect(dbConfig);
            await pool.request().query('SELECT 1');
            
            const roomId = request.params.roomId;
            let query = `
                SELECT
                    room_id,
                    name,
                    imageURL,
                    target_temp,
                    target_humidity,
                    sensor_id
                FROM ROOM
            `;
            
            if (roomId) {
                query += ' WHERE room_id = @roomId';
            }

            const dbRequest = pool.request();
            if (roomId) {
                dbRequest.input('roomId', sql.VarChar, roomId);
            }

            const result = await dbRequest.query(query);
            
            return {
                status: 200,
                headers,
                body: JSON.stringify(roomId ? result.recordset[0] : result.recordset)
            };
        } catch (error) {
            context.error('Database error:', error);
            return {
                status: 500,
                headers,
                body: JSON.stringify({
                    message: 'Database connection failed',
                    error: error.message,
                    code: error.code
                })
            };
        } finally {
            if (pool) {
                try {
                    await pool.close();
                } catch (error) {
                    context.error('Error closing pool:', error);
                }
            }
        }
    }
});

app.http('updateTargets', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    route: 'rooms/{roomId}/targets',
    handler: async (request, context) => {
        context.log('Anfrage zum Aktualisieren der Sollwerte erhalten');

        const roomId = request.params.roomId; // Raum-ID aus der Route
        const { target_temp, target_humidity } = await request.json(); // Sollwerte aus der Anfrage
        context.log(`Aktualisierung für Raum ${roomId}:`, { target_temp, target_humidity });

        if (!roomId || (!target_temp && !target_humidity)) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'Room ID und mindestens ein Sollwert (target_temp oder target_humidity) sind erforderlich',
                }),
            };
        }

        let pool;
        try {
            // Verbindung zur Datenbank herstellen
            pool = await sql.connect(dbConfig);

            if (!pool.connected) {
                return {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Database Connection Error',
                        message: 'Could not establish database connection',
                    }),
                };
            }

            // Update-Abfrage für Sollwerte
            const dbRequest = pool.request();
            dbRequest.input('roomId', sql.VarChar, roomId);

            let query = 'UPDATE ROOM SET ';
            if (target_temp !== undefined) {
                query += 'target_temp = @target_temp';
                dbRequest.input('target_temp', sql.Float, target_temp);
            }
            if (target_humidity !== undefined) {
                if (target_temp !== undefined) {
                    query += ', ';
                }
                query += 'target_humidity = @target_humidity';
                dbRequest.input('target_humidity', sql.Float, target_humidity);
            }
            query += ' WHERE room_id = @roomId';

            const result = await dbRequest.query(query);

            if (result.rowsAffected[0] === 0) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Not Found',
                        message: `Raum ${roomId} nicht gefunden`,
                    }),
                };
            }

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({ message: 'Sollwerte erfolgreich aktualisiert' }),
            };
        } catch (error) {
            context.error('Fehler beim Aktualisieren der Sollwerte:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Interner Serverfehler',
                    message: error.message,
                }),
            };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    },
});

