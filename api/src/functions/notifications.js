const { app } = require('@azure/functions');

const sql = require('mssql');
const { dbConfig } = require('./shared/config');


async function createNotification(pool, sensorId, roomId, description, type) {
    
    try {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            const deleteRequest = transaction.request();
            deleteRequest.input('room_id', sql.VarChar, roomId);
            deleteRequest.input('type', sql.VarChar, type);
            await deleteRequest.query(`
                DELETE FROM Notification 
                WHERE room_id = @room_id 
                AND type = @type
            `);

            const idRequest = transaction.request();
            const result = await idRequest.query(`
                SELECT ISNULL(MAX(CAST(notification_id AS INT)), 0) + 1 AS next_id 
                FROM Notification
            `);
            const notificationId = result.recordset[0].next_id.toString();

            const insertRequest = transaction.request();
            insertRequest.input('notification_id', sql.VarChar, notificationId);
            insertRequest.input('sensor_id', sql.VarChar, sensorId);
            insertRequest.input('room_id', sql.VarChar, roomId);
            insertRequest.input('type', sql.VarChar, type);
            insertRequest.input('description', sql.NVarChar, description);

            await insertRequest.query(`
                INSERT INTO Notification (
                    notification_id, sensor_id, room_id, type, description, status
                ) VALUES (
                    @notification_id, @sensor_id, @room_id, @type, @description, 0
                )
            `);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Fehler beim Erstellen der Benachrichtigung:', error);
        throw error;
    }
}

app.http('notifications', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'notifications',
    handler: async (request, context) => {
        
        context.log('Notifications endpoint called');

        const origin = request.headers.get('origin');
        const headers = corsHeaders(origin);

        if (request.method === 'OPTIONS') {
            return { status: 204, headers };
        }

        let pool;
        try {

            if (!dbConfig.server || !dbConfig.database) {
                throw new Error('Database configuration is incomplete');
            }

            pool = await sql.connect(dbConfig);
            const query = `
                SELECT
                    n.*,
                    r.name as room_name
                FROM Notification n
                LEFT JOIN ROOM r ON n.room_id = r.room_id
                ORDER BY timestamp DESC
            `;
            const result = await pool.request().query(query);

            return {
                status: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: result.recordset
                })
            };
        } catch (error) {
            context.log.error('Error in notifications:', error);

            return {
                status: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: "Ein Fehler ist aufgetreten",
                    error: error.message,
                    data: []
                })
            };
        } finally {
            if (pool) await pool.close();
        }
    }
});