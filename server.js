// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel

const open = require('open')
const next = require('next')
const { parse } = require('url')
const express = require('express')()
const server = require('http').Server(express)
const io = require('socket.io')(server)

const broadcast = require('./static/js/broadcast')
const randomNames = require('./static/js/names')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let port = process.env.PORT || 3000

// fake DB
let DBmessages = []
let connections = {}
let activeConnections = []
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
// 		email?
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
convert to use logger instead of console
io types besides launch

SERVER ON CONNECT/reset:
	enumerate connected users:
		soucket.id:
			Lookup heroName
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

/* Actions */
const emitIO = (socket, actions) => {
  actions.forEach((action, i) => {
    switch (action.type) {
    	case 'launch':
	      socket.emit('launch', action)
	      break
	    default:
	    	break
	   }
  })
}

/* DB ACTIONS */
const getUniqueName = () => {
  // FAKE DB
  // Get unique name
  // TODO clear disconnections
  let name
  do {
	  name = randomNames()
	  console.log(name)
  } while (!name && getNameExists(name))
  return name
}

// Add messages from WS
const addMessage = (data) => DBmessages.push(data)

// Return user
const getUser = (heroName) => connections[heroName] && connections[heroName]

// Display all users
const getUsers = () => Object.keys(connections)

// Return true if hero exists | bool
const getNameExists = (heroName) => !!connections.hasOwnProperty(heroName)

// Return all DB messages
const getMessages = () => DBmessages

// Combine state for hero
const setUser = (heroName, hero) => {
  connections[heroName] = Object.assign({}, connections[heroName], hero)
  console.log(connections[heroName])
}

// Socket.io server
io.on('connection', socket => {
  console.log('Socket connected: ', socket.id)
  // emitIO(socket, [{ type: 'launch', launch: 'atom' }])
  socket.on('io', data => {
    console.log('io', data)
    if (data.type == 'launch') {
    	console.log('!!!!!!!1launching', data)
    }
  })

  socket.on('message', data => {
    console.log('message: ', data)
    addMessage(data)
    socket.broadcast.emit('message', data)
  })

  socket.on('disconnect', function (data) {
    console.log('user disconnected', data)
  })
})

io.on('connect', socket => {
  socket.emit('message', '~~~ Stream Hero Connected ~~~')
  // emitIO(socket, [{ type: 'launch', launch: 'discord' }])
})

// macOS: Hide dock icon
// if (app.dock && !opts.showDockIcon) app.dock.hide()

// Custom Routing
app.prepare()
  .then(() => {
    /* JSON API */

    // Returns a unique string for ids
    express.get('/io/connect', (req, res) => {
      const name = getUniqueName()
    	res.json(name)
    })

  	// Returns true if a heroName is taken
    express.get('/io/name/:id', (req, res) => {
    	const queryParams = { heroName: req.params.id }
    	const heroName = encodeURIComponent(queryParams.heroName)

    	const exists = getNameExists(heroName)

    	res.json(exists)
    })

    // Auth and connect Hero
    express.get('/io/connect/:id', (req, res) => {
      // GRAB QUERY
      const queryParams = { heroName: req.params.id }
      // CLEAN URI
      let heroName = encodeURIComponent(queryParams.heroName)
    	console.log('New Hero Connected', heroName)

      if (!connections[heroName]) {
      	// New Login - setup new user
      	// Hash beroName
      	// Add to DB - TODO
      	// USE ID - TODO
      	// Dashboard exists
      	// !connections[heroName]
      	let hero = {
      		active: true,
      		activeDate: Date.now()
      	}

      	setUser(heroName, hero)

      	// connections.heroName['id'] = activeConnections.id
      	// connections.heroName['userName'] = userName // better heroName
      	// connections.heroName['email'] = email
      	// connections.heroName['userName'] = userName
      	// connections.heroName['gridSize'] = gridSize //start with default

      	res.redirect(`/d/${heroName}?n=1`)
      } else if (connections[heroName] && !connections[heroName]['active']) {
      	// Old name, new login
      	let hero = {
      		active: true,
      		activeDate: Date.now()
      	}
      	setUser(heroName, hero)
	      res.redirect(`/d/${heroName}?rn=1`)
      } else {
      	// Old name, new login
      	let hero = {
      		active: true,
      		activeDate: Date.now()
      	}
      	setUser(heroName, hero)
	      res.redirect(`/d/${heroName}`)
      }
    })

    // Returns array of un-processed messages
    express.get('/io/messages', (req, res) => {
    	const messages = getMessages()
      res.json(messages)
    })

    /* HTTP Server */

    // express.get('/d', (req, res) => {
    //   // If logged in, DASHBOARD from storage
    //   // If not, HOMEPAGE
    // })

    // express.get('/download', (req, res) => {
    //   const actualPage = '/dashboard'
    //   const queryParams = { heroName: req.params.id, np: req.params.np || true }
    //   app.render(req, res, actualPage, queryParams)
    // })

    // Dashboard page, np=1 if new
    express.get('/d/:heroName', (req, res) => {
      const actualPage = '/dashboard'
      // TODO double check if new
      const queryParams = { heroName: req.params.heroName, n: req.params.np || true }

      app.render(req, res, actualPage, queryParams)
    })

    /* Admin Routes */
    // Display single WS user
    express.get('/admin/users/:heroName', (req, res) => {
      const queryParams = { heroName: req.params.heroName }
      const heroName = encodeURIComponent(queryParams.heroName)
      res.json(getUser(heroName))
    })

    // Display active WS users
    express.get('/admin/users/active', (req, res) => {
      // res.json(getUsers())
      res.json(getUsers())
    })

    // Display all WS users
    express.get('/admin/users/all', (req, res) => {
      res.json(getUsers())
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
