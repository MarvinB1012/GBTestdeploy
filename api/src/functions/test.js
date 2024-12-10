const { app } = require('@azure/functions');

const sql = require('mssql');

app.http('test', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'test',
    handler: async (request, context) => {
        return {
            status: 200,
            jsonBody: {
                message: 'API is working',
                env: {
                    hasDbUser: !!process.env.DB_USER,
                    hasDbPassword: !!process.env.DB_PASSWORD,
                    hasDbServer: !!process.env.DB_SERVER,
                    hasDbDatabase: !!process.env.DB_DATABASE
                }
            }

        };
    }
});