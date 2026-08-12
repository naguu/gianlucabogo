require('dotenv').config();

const required = (name, fallback) => {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Umgebungsvariable ${name} fehlt, bitte .env anlegen (siehe .env.example)`);
  }
  return value;
};

module.exports = {
  port: Number(process.env.PORT) || 3000,
  adminPassword: required('ADMIN_PASSWORD'),
  sessionSecret: required('SESSION_SECRET'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  isProduction: process.env.NODE_ENV === 'production',
};
