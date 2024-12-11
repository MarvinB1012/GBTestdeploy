const allowedOrigins = [
  'https://blue-coast-05c01eb03.4.azurestaticapps.net',
  'http://localhost:5173',
  'http://localhost:7071',
  '95.223.57.108'  
];

const corsHeaders = (origin) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': "*",
  'Access-Control-Allow-Methods': 'GET, PATCH, POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-cache'
});

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
      encrypt: true,
      trustServerCertificate: false,
      connectTimeout: 30000,
      requestTimeout: 30000
  },
  pool: {
      max: 50,
      min: 0,
      idleTimeoutMillis: 30000
  }
};

module.exports = { corsHeaders, dbConfig, allowedOrigins };