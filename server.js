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
let messages = []
let connections = {}
let activeConnections = {}
let ioActions = [
  {
    type: 'boot'
  }
]

// let connections = {
// 	heroName: {
// 		socket.id,
// 		socket.hash?
// 		userID,
// 		name,
// 		phone,
// 		gridSize,
// 		emsil?
// 		seetings
// 	}
// }

// socket.emit('message', '~~~ Stream Hero Connected ~~~')
// socket.emit('io', {
// type: launch,
//   launch: {
//     test: 'test',
//     obs: 'obs',
//     discord: 'discord',
//     browser: 'browser'
//   }
// })

/*
pm2 - process manager
TWILIO - SMS verification
Offline reconnection for mobile app: https://www.twilio.com/blog/2017/02/send-messages-when-youre-back-online-with-service-workers-and-background-sync.html

io types besides launch

SERVER ON CONNECT/reset:
	enumerate connected users:
		soucket.id:
			Lookup heroname
				If active on control device, attempt reconnect TODO

users:
	name
	email?
	phone?
	socket.hash
	socket.id
	uniqueName
	gridSize

	settings:
		grid size
		launch on system start
		tray only (hide from dock)
		dark/light mode
		sync automatically?

	panels:
		icon
		text
		color?
		gradient?
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
const emitIO = (socket, actions) => {
  actions.forEach((action, i) => {
    if (action.type = 'launch') {
      socket.emit('launch', action)
    } else if (false) {

    }
  })
}

// Socket.io server
io.on('connection', socket => {
  console.log('Socket connected: ', socket.id)
  emitIO(socket, [{ tye: 'launch', launch: 'atom' }])
  socket.on('io', data => {
    console.log('io', data)
    if (data.type == 'launch') {
    	console.log('!!!!!!!1launching')
    }
  })

  socket.on('message', data => {
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
  emitIO(socket, [{ tye: 'launch', launch: 'discord' }])
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
    // JSON API
    express.get('/io/connect', (req, res) => {
      	const name = getUniqueName()
    	res.json(name)
    })

    express.get('/io/connect/:id', (req, res) => {
      // QRAB QUERY
      const queryParams = { heroName: req.params.id }
      // CLEAN URI
      let heroname = encodeURIComponent(queryParams.heroName)
      if (!connections.heroName) {
      	// New Dashboard
      	// Add to DB - TODO
      	connections.heroName = heroName
      	connections.heroName.id = activeConnections.id
      	res.redirect(`/d/${heroname}`)
      } else {
      	// Dashboard exists
      	activeConnections[ heroname ] = heroName
      }
      res.redirec(`/d/${heroname}?np=1`)
    })

    express.get('/io/messages', (req, res) => {
      res.json(messages)
    })

    express.get('/getio', (req, res) => {
      res.json(io)
    })

    // HTTP server
    // express.get('/d', (req, res) => {
    //   // If logged in, DASHBOARD from storage
    //   // If not, HOMEPAGE
    // })

    express.get('/d/:id', (req, res) => {
      const actualPage = '/dashboard'
      const queryParams = { heroName: req.params.id, np: req.params.np || true }
      app.render(req, res, actualPage, queryParams)
    })

    express.get('*', (req, res) => {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
      handle(req, res, parsedUrl)
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
