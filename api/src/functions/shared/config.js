require('dotenv').config();

const allowedOrigins = [
  'https://blue-coast-05c01eb03.4.azurestaticapps.net',
  'http://localhost:5173',
  'http://localhost:7071'  
];

const corsHeaders = (origin) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
  },
  port: 1433,
};

module.exports = { corsHeaders, dbConfig, allowedOrigins };