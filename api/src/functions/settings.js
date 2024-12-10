const { app } = require('@azure/functions');

const sql = require('mssql');
const { dbConfig } = require('./shared/config');

app.http('getSettings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const sql = require('mssql');
        const { corsHeaders, dbConfig } = require('./shared/config');
        const headers = corsHeaders(request.headers.get('origin'));

        if (request.method === 'OPTIONS') {
            return { status: 204, headers };
        }

        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const query = 'SELECT update_interval FROM Settings WHERE id = 1';
            const result = await pool.request().query(query);
           
            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers,
                    body: JSON.stringify({ error: 'Einstellungen nicht gefunden' })
                };
            }
            return {
                status: 200,
                headers,
                body: JSON.stringify({ update_interval: result.recordset[0].update_interval })
            };
        } catch (error) {
            context.error('Fehler beim Abrufen der Einstellungen:', error);
            return {
                status: 500,
                headers,
                body: JSON.stringify({ error: 'Interner Serverfehler' })
            };
        } finally {
            if (pool) await pool.close();
        }
    }
});

app.http('updateInterval', {
    methods: ['PATCH'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const headers = corsHeaders(request.headers.get('origin'));

        if (request.method === 'OPTIONS') {
            return { status: 204, headers };
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return {
                status: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }

        const { update_interval } = body;
        
        if (update_interval === undefined || typeof update_interval !== 'number') {
            return {
                status: 400,
                headers,
                body: JSON.stringify({
                    error: 'Fehlende oder ungültige Daten: update_interval ist erforderlich und muss eine Zahl sein',
                    received: { update_interval, type: typeof update_interval }
                })
            };
        }

        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const request = pool.request();
            
            const updateQuery = `
                UPDATE Settings
                SET update_interval = @update_interval
                WHERE id = 1;
                
                SELECT @@ROWCOUNT as affected;
            `;
            
            request.input('update_interval', sql.Int, update_interval);
            const result = await request.query(updateQuery);
            
            if (result.recordset[0].affected === 0) {
                return {
                    status: 404,
                    headers,
                    body: JSON.stringify({
                        error: 'Eintrag in der Tabelle Settings mit id = 1 wurde nicht gefunden.'
                    })
                };
            }

            return {
                status: 200,
                headers,
                body: JSON.stringify({
                    message: 'Intervall erfolgreich aktualisiert',
                    update_interval
                })
            };
        } catch (err) {
            context.error('Fehler beim Aktualisieren des Intervalls:', err);
            return {
                status: 500,
                headers,
                body: JSON.stringify({ error: 'Fehler beim Aktualisieren des Intervalls' })
            };
        } finally {
            if (pool) await pool.close();
        }
    }
});