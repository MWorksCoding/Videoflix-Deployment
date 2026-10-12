export const environment = {
    production: true,
    // Empty = same origin: nginx in the frontend container proxies the API
    // paths to the Django backend, so the app works on any domain/port.
    baseUrl: ''
  };
