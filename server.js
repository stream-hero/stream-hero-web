// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel

const open = require('open')
const next = require('next')
const { parse } = require('url')
const express = require('express')()
const server = require('http').Server(express)
const io = require('socket.io')(server)

const names = require('./static/js/names')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let port = process.env.PORT || 3000

// fake DB
const messages = []
const connections = {}

/*
users:
	socket.hash
	socket.id
	uniqueName
	gridSize

	panels:
		icon
		text
		color?
		fonts?
		styles?
		css???

		actions:

			run:
				start app (exe/app)
				run batch file
				run shortcut
				open folder
				run shell/powershell/js script

			navigate:
				Switch panels
				Open URL

			input:
				text
				keypress

			utility:
				timer
				logout computer
				lock computer
				shutdown

			audio:
				play
				pause
				stop

			media:
				play
				pause
				stop
				next track
				prev track
				volume up
				volume down

			obs:
				scene select
				source toggle
				start stream
				stop stream
				start record
				stop record
				toggle record
				mute
				set volume
				volume up
				volume down

			twitter:
				tweet

			twitch:
				send message
				clear chat
				set stream marker
				create clip
				emote-only on
				emote-only off
				followers-only on
				followers-only off
				subs only on
				subs only off
				slow chat on
				slow chat off

*/

// Socket.io server
io.on('connection', socket => {
  console.log('Socket connected: ', socket.id)

  socket.on('io', data => {
    console.log('io', data)
  })

  socket.on('message', data => {
    if (data.value == 'launch') {
      socket.broadcast.emit('io', {
        open: true,
        launch: 'obs'
      })
    }
    console.log('message: ', data)
    messages.push(data)
    socket.broadcast.emit('message', data)
  })

  socket.on('disconnect', function () {
    console.log('user disconnected')
  })
})

io.on('connect', socket => {
  socket.emit('message', '~~~ Stream Hero Connected ~~~')
  socket.emit('io', {
    launch: {
      test: 'test',
      obs: 'obs',
      discord: 'discord',
      browser: 'browser'
    }
  })
})

const getUniqueName = () => {
  // Get unique name
  let name
  do {
	  name = names()
  } while (!name || connections[name])
  connections[name] = {}
  return name
}

// macOS: Hide dock icon
// if (app.dock && !opts.showDockIcon) app.dock.hide()

// Custom Routing
app.prepare()
  .then(() => {
    // HTTP server

    // JSON API
    express.get('/io/connect', (req, res) => {
      	const name = getUniqueName()
    	res.json(name)
    })
    express.get('/io/connect/:id', (req, res) => {
      const queryParams = { connection: req.params.id }
      let name
      if (!connections[ queryParams.connection ]) {
      	name = getUniqueName()
      }
      res.json(name)
    })

    express.get('/io/messages', (req, res) => {
      res.json(messages)
    })

    express.get('/p/:id', (req, res) => {
      const actualPage = '/post'
      const queryParams = { title: req.params.id }
      app.render(req, res, actualPage, queryParams)
    })

    // express.get("/p/:id", (req, res) => {
    // 	const actualPage = "/post";
    // 	const queryParams = { title: req.params.id };
    // 	app.render(req, res, actualPage, queryParams);
    // });

    express.get('*', (req, res) => {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
      return handle(req, res, parsedUrl)
    })

    server.listen(3000, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:' + port)
    })
  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
  })
