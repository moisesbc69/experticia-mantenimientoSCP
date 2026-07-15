export const environment = {
  production: false,
  // Ruta relativa: en desarrollo el proxy de ng serve la redirige a :8000
  // (proxy.conf.json); en producción Django sirve API y frontend juntos.
  apiUrl: '/api',
};
