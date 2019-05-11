// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel
const next = require("next");
const open = require("open");

const express = require("express");
const { createServer } = require("http");
const http = require("http").Server(express());
const socket = require("socket.io");
const { parse } = require("url");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let port = process.env.PORT || 3000;

// fake DB
const messages = [];

// Custom Routing
app.prepare().then(() => {


	const server = createServer((req, res) => {
		// Be sure to pass `true` as the second argument to `url.parse`.
		// This tells it to parse the query portion of the URL.
		const parsedUrl = parse(req.url, true);
		const { pathname, query } = parsedUrl;

		if (pathname === "/io") {
			app.render(req, res, "/io", query);
		} else if (pathname === "/messages") {
			app.get('/messages', (req, res) => {
				res.send(JSON.stringify(messages));
			})
		} else {
			handle(req, res, parsedUrl);
		}
	}).listen(port, err => {
		if (err) throw err;
		console.log("> Ready on http://localhost:" + port);
	});

	const io = socket.listen(server);

	io.on("connect", socket => {
		socket.emit("io", {
			message: "~~~ Stream Hero Connected ~~~",
			launch: {
				test: 'test',
				obs: 'obs',
				discord: 'discord',
				browser: 'browser',
			}
		});
	});

	// socket.io server
	io.on("connection", socket => {
		console.log("Socket connected: ", socket.id);

		socket.on('io', (data) => {
		  console.log('io', data)
		});

		socket.on("message", data => {
			if (data.value == 'launch') {
				socket.broadcast.emit('io', {
					open: true,
					launch: 'obs'
				})
			}
			console.log("message: ", data);
			messages.push(data);
			socket.broadcast.emit("message", data);
		});

		socket.on("disconnect", function() {
			console.log("user disconnected");
		});
	});
});

// .then(() => {
// 	const server = express()

// 	// server.get("/io", (req, res) => {
// 	// 	app.render(req, res);
// 	// });

// 	server.get("/messages", (req, res) => {
// 		res.json(messages);
// 	});

// 	server.get("/p/:id", (req, res) => {
// 		const actualPage = "/post";
// 		const queryParams = { title: req.params.id };
// 		app.render(req, res, actualPage, queryParams);
// 	});

// 	server.get("*", (req, res) => {
// 		const parsedUrl = parse(req.url, true);
// 		const { pathname, query } = parsedUrl;
// 		return handle(req, res, parsedUrl);
// 	});

// 	server.listen(3000, err => {
// 		if (err) throw err;
// 		console.log("> Ready on http://localhost: " + port);
// 	});
// })
// .catch(ex => {
// 	console.error(ex.stack);
// 	process.exit(1);
// });
