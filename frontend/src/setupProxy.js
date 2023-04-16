const { createProxyMiddleware } = require('http-proxy-middleware');
const { baseUrl } = require('./config');

module.exports = function(app) {
  app.use(
    '/base',
    createProxyMiddleware({
      target: baseUrl,
      changeOrigin: true,
    })
  );
};