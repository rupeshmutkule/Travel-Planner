// API Configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  appUrl: import.meta.env.VITE_APP_URL || window.location.origin,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
