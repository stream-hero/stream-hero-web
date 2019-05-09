// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel
const express = require('express')()
const server = require('http').Server(express);
const io = require('socket.io')(server)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler()

let port = process.env.PORT || 3000

io.on('connect', socket => {
	socket.emit('now',
		{
			message:'zeir~~~'
		}
	)
})

app.prepare().then(() => {
	createServer((req, res) => {
		// Be sure to pass `true` as the second argument to `url.parse`.
		// This tells it to parse the query portion of the URL.
		const parsedUrl = parse(req.url, true);
		const { pathname, query } = parsedUrl;

		if (pathname === '/a') {
			app.render(req, res, '/b', query);
		} else if (pathname === '/b') {
			app.render(req, res, '/a', query);
		} else {
			handle(req, res, parsedUrl);
		}
	}).listen(port, err => {
		if (err) throw err;
		console.log('> Ready on http://localhost:' + port);
	});
});
