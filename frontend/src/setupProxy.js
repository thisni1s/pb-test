const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/base',
    createProxyMiddleware({
      target: 'https://base.jn2p.de',
      changeOrigin: true,
    })
  );
};