// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
// See https://github.com/zeit/next.js/issues/1245 for discussions on Universal Webpack or universal Babel

const open = require('open')
const next = require('next')
const { parse } = require('url')
const express = require('express')()
const server = require('http').Server(express)
const io = require('socket.io')(server)
const hasha = require('hasha')
const uuidv3 = require('uuid/v3')

const broadcast = require('./static/js/broadcast')
const randomNames = require('./static/js/names')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let port = process.env.PORT || 3000

// fake DB
let DBmessages = {}
let connections = {}
let activeConnections = []
let ioActions = [
  {
    type: 'boot'
  }
]

// let connections = {
//  heroName: {
//    socket.id,
//    socket.hash?
//    userID,
//    name,
//    phone,
//    gridSize,
//    email?
//    seetings
//  }
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
  // TODO clear disconnections
  let name
  do {
    name = cleanHeroName(randomNames())
  } while (!name && getNameExists(name))
  return name
}

// Add messages from WS
const addMessage = data => DBmessages.push(data)

// Return all DB messages
const cleanHeroName = heroName =>
  extract(encodeURIComponent(heroName), '[-0-9a-z]+')

// Removes all but the specified regex
const extract = (str, pattern) => (str.match(pattern) || []).pop() || ''

// Return all DB messages
const getMessages = () => DBmessages

// Return true if hero exists | bool
const getNameExists = heroName => !!connections.hasOwnProperty(heroName)

// Return user
const getUser = heroName => connections[heroName] || false

// Display all users
const getUsers = () => Object.keys(connections)

// Display all users
const getHeros = () => connections

// Combine state for hero
const setUser = (heroName, heroStats) => {
  connections[heroName] = Object.assign({}, connections[heroName], heroStats)
  console.log(connections)
  return connections[heroName]
}

// macOS: Hide dock icon
// if (app.dock && !opts.showDockIcon) app.dock.hide()

// Custom Routing
app
  .prepare()
  .then(() => {
    /* JSON API */

    // Returns true if dashboard exists
    express.get('/io/exists/:heroName', (req, res) => {
      const queryParams = { heroName: req.params.heroName }
      let heroName = cleanHeroName(queryParams.heroName)
      res.json(getNameExists(heroName))
    })

    // Returns a unique string for ids like `fuzzy-muzzle`
    express.get('/io/connect', (req, res) => {
      const name = cleanHeroName(getUniqueName()) // SAFETY FIRST
      res.json(name)
    })

    // Returns array of un-processed messages
    express.get('/io/messages', (req, res) => {
      const messages = getMessages()
      res.json(messages)
    })

    // // Returns array of un-processed messages
    // express.get('/io/messages', (req, res) => {
    //   const messages = getMessages()
    //   res.json(messages)
    // })

    /* HTTP Server */

    express.get('/x', (req, res) => {
      // If logged in, DASHBOARD from storage/cookies
      // If not, HOMEPAGE
      res.redirect('/')
    })

    // Dashboard page - setup if non-existent
    express.get('/x/:heroName', (req, res) => {
      const actualPage = '/dashboard'
      // TODO double check if new
      const queryParams = {
        heroName: req.params.heroName,
        n: req.params.np || true
      }

      // CLEAN URI
      let heroName = cleanHeroName(queryParams.heroName)
      console.log('Hero Connected: ', heroName)

      let hero = {
        heroName,
      	queryParams,
        active: true,
        activeDate: Date.now(),
        hash: hasha(heroName),
        newUser: !getNameExists(heroName)
      }

      // console.log(hero)

      const user = setUser(heroName, hero)

      app.render(req, res, actualPage, queryParams)
    })

    /* Admin Routes */
    // Display single WS user
    express.get('/admin/users/:heroName', (req, res) => {
      const queryParams = { heroName: req.params.heroName }
      const heroName = cleanHeroName(queryParams.heroName)
      res.json(getUser(heroName))
    })

    // Display active WS users
    express.get('/admin/users/active', (req, res) => {
      // TODO filter active users
      res.json(getUsers())
    })

    // Display all WS users
    express.get('/admin/users', (req, res) => {
      res.json(getUsers())
    })
    express.get('/admin/users/all', (req, res) => {
      res.json(getUsers())
    })

    // express.get('/download', (req, res) => {
    //   const actualPage = '/dashboard'
    //   const queryParams = { heroName: req.params.id, np: req.params.np || true }
    //   app.render(req, res, actualPage, queryParams)
    // })

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
    console.error('err', ex.stack)
    process.exit(1)
  })

// Socket.io server
io.on('connection', socket => {
  console.log('Socket connected: ', socket.id)
  // emitIO(socket, [{ type: 'launch', launch: 'atom' }])
  socket.on('io', data => {
    console.log('io: ', data)
    if (data.type == 'launch') {
      console.log('launching', data)
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
