export default () => {
  console.log({ env: process.env });
  return {
    database: {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
    },
    app: {
      frontendUrl: process.env.FRONTEND_URL,
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
      corsEnabled: process.env.CORS_ENABLED !== 'false',
      swaggerEnabled: process.env.SWAGGER_ENABLED === 'true'
    },
  }
};