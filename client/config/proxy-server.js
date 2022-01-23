const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer();

const server = http.createServer((req, res) => {
    let target = 'http://127.0.0.1:8080';

    if (req.url.startsWith('/api/') || req.url.startsWith('/assets/')) {
        target = 'http://192.168.1.100:8080';
    }

    proxy.web(req, res, { target }, () => {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });

        res.end('"Proxy error"');
    });
});

server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head, { target: 'http://192.168.1.100:8080' });
});

console.log('Proxy server is running on port 80');
server.listen(80);
