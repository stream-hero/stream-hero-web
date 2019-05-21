
/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * TODO:
 * - Use Twilio
 * - animate SVG images
 *
 * @flow
 * eslintignore: fs
 TODO:
 - Volume/mute on win32
 - canNotify/notifications for linux

 EXTRAS:
 https://electronjs.org/docs/tutorial/security489
 https://github.com/NodeRT/NodeRT
 https://electronjs.org/docs/api/notification
 https://electronjs.org/docs/api/net-log
 https://electronjs.org/docs/api/system-preferences
 https://electronjs.org/docs/api/touch-bar

https://github.com/sindresorhus/electron-util:
api
is
electronVersion
chromeVersion
platform()
activeWindow()
runJS()
fixPathForAsarUnpack()
enforceMacOSAppLocation()
menuBarHeight()
getWindowBoundsCentered()
setWindowBounds()
centerWindow()
disableZoom()
appLaunchTimestamp
isFirstAppLaunch()
darkMode
setContentSecurityPolicy
openNewGitHubIssue()
openUrlMenuItem()
showAboutWindow()
aboutMenuItem()
debugInfo()
appMenu()
 */
// import * as fs from "fs";
import child from 'child_process'
import path from 'path'
import events from 'events'
import log from 'electron-log'
import io from 'socket.io-client'
import loudness from 'loudness'
import Positioner from 'electron-positioner'
import { disableZoom } from 'electron-util'
import { getDoNotDisturb, getSessionState } from 'electron-notification-state'

import { app, BrowserWindow, protocol, shell, Tray } from 'electron'
import { autoUpdater } from 'electron-updater'

import MenuBuilder from './menu'
// import appMap from './constants/appMap';

/* Custom URL scheme 'hero://asd.xyz' -- future */
const PROTOCOL_PREFIX = 'hero'

const socket = io('http://localhost:3000')

// menubar code shamelessly ripped from Max Ogden's https://github.com/maxogden/menubar
const opts = {
  dir: __dirname,
  icon: '',
  width: 400,
  height: 400,
  tooltip: 'Stream Hero',
  alwaysOnTop: false,
  preloadWindow: true,
  showDockIcon: false,
  showOnRightClick: false,
  showOnAllWorkspaces: false,
  index: `file://${__dirname}/app.html`,
  windowPosition:
    process.platform === 'win32' ? 'trayBottomCenter' : 'trayCenter'
}
// Resolve absolute paths
if (!path.isAbsolute(opts.dir)) opts.dir = path.resolve(opts.dir)

// Tray icon path
const iconPath = path.join(opts.dir, 'iconTemplate.png')

// Setup autoupdates
export default class AppUpdater {
  constructor () {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

// Electron + Menubar vars
let mainWindow = null
const menubar = new events.EventEmitter()
menubar.app = app

// Development
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
  console.log(`This platform is ${process.platform}`)
  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log)
}

/**
 * App Event listeners
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }
  // macOS: Hide dock icon
  // if (app.dock && !opts.showDockIcon) app.dock.hide()

  socket.on('io', data => {
    Object.keys(data).forEach(k => {
      // io types of data
      switch (k) {
        case 'launch':
          if (typeof data[k] === 'string') {
            launchApp(data[k])
          } else if (typeof data[k] === 'object') {
            // launch multiple apps
            Object.keys(data[k]).forEach(k2 => {
              launchApp(data[k][k2])
            })
          }
          break
        case 'exe':
          // var child = require('child_process').execFile;
          // var executablePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
          // var parameters = ["--incognito"];
          // child.execFile(executablePath, parameters, function(err, data) {
          //      console.log(err)
          //      console.log(data.toString());
          // });
          break
        case 'refresh':
          break
        default:
          break
      }
    })

    socket.on('connect', () => {
      broadcast('connected')
    })

    socket.on('disconnected', () => {
      broadcast('dconnected')
    })
  })

  socket.on('message', data => {
    broadcast('message: ', data)
  })

  let cachedBounds // cachedBounds are needed for double-clicked event
  let supportsTrayHighlightState = false // System-specific
  const defaultClickEvent = opts.showOnRightClick ? 'right-click' : 'click'

  menubar.tray = new Tray(iconPath)
  menubar.tray.on(defaultClickEvent, clicked)
  menubar.tray.on('double-click', clicked)
  menubar.tray.setToolTip(opts.tooltip)

  try {
    menubar.tray.setHighlightMode('never')
    supportsTrayHighlightState = true
  } catch (e) {
    /* not supported */
  }

  if (opts.preloadWindow) {
    createWindow()
  }

  menubar.showWindow = showWindow
  menubar.hideWindow = hideWindow
  menubar.emit('ready')

  function launchApp (launch) {
    switch (launch.toLowerCase()) {
      case 'obs':
        // shell.openItem()
        break
      case 'discord':
        // shell.openItem()
        break
      default:
        try {
          // shell.openItem(launch);
        } catch (e) {
          socket.emit('error', `Could not launch {$launch}: {$e}`)
        }
        break
    }
  }

  function canNotify (msg) {
    if (getDoNotDisturb()) {
      return false
    }
    const notificationState = getSessionState()
    if ((process.platform === 'darwin' && notificationState === 'SESSION_ON_CONSOLE_KEY') || (process.platform === 'win32' && notificationState === 'QUNS_ACCEPTS_NOTIFICATIONS')) {
      return true
    }
  }

  function mute () {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      loudness.setMuted(true)
        .catch((err) => {
          broadcast(err)
        })
    }
  }

  function unmute () {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      loudness.setMuted(false)
        .catch((err) => {
          broadcast(err)
        })
    }
  }

  function volume (vol) {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      loudness.setVolume(vol)
        .catch((err) => {
          broadcast(err)
        })
    } else if (process.platform === 'win32') {
      // https://github.com/nomadcn/node-win-volume
      // https://github.com/fcannizzaro/win-audio
    }
  }

  function volumeDown () {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      loudness.getVolume((err, vol) => {
        if (err) throw err
        return vol
      })
        .then((vol) => {
          const volume = vol + 10
          return loudness.setVolume(volume)
        })
        .catch((err) => {
          broadcast(err)
        })
    }
  }

  function volumeUp () {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      loudness.getVolume((err, vol) => {
        if (err) throw err
        return vol
      })
        .then((vol) => {
          const newVol = vol + 10
          return loudness.setVolume(newVol)
        })
        .catch((err) => {
          broadcast(err)
        })
    }
  }

  function clicked (e, bounds) {
    if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return hideWindow()
    if (menubar.window && menubar.window.isVisible()) return hideWindow()
    cachedBounds = bounds || cachedBounds
    showWindow(cachedBounds)
  }

  function createWindow () {
    /* Menubar Window */
    menubar.emit('create-window')
    const defaults = {
      show: false,
      frame: false
    }

    const winOpts = Object.assign(defaults, opts)
    menubar.window = new BrowserWindow(winOpts)

    menubar.positioner = new Positioner(menubar.window)
    menubar.window.on('blur', () => {
      if (opts.alwaysOnTop) {
        emitBlur()
      } else {
        hideWindow()
      }
    })

    if (opts.showOnAllWorkspaces !== false) {
      menubar.window.setVisibleOnAllWorkspaces(true)
    }

    menubar.window.on('close', windowClear)
    menubar.window.loadURL(opts.index)
    menubar.emit('after-create-window')

    /* Custom URL scheme 'hero://asd.xyz' -- future */
    protocol.registerHttpProtocol(PROTOCOL_PREFIX, (req, cb) => {
      const fullUrl = `http://${req}.url`
      broadcast(`full url to open ${fullUrl}`)
      mainWindow.loadURL(fullUrl)
      if (cb) cb(req)
    })
  }

  function showWindow (pos) {
    let trayPos = pos
    if (supportsTrayHighlightState) menubar.tray.setHighlightMode('always')
    if (!menubar.window) {
      createWindow()
    }

    menubar.emit('show')

    if (trayPos && trayPos.x !== 0) {
      // Cache the bounds
      cachedBounds = trayPos
    } else if (cachedBounds) {
      // Cached value will be used if showWindow is called without bounds data
      trayPos = cachedBounds
    } else if (menubar.tray.getBounds) {
      // Get the current tray bounds
      trayPos = menubar.tray.getBounds()
    }

    // Default the window to the right if `trayPos` bounds are undefined or null.
    let noBoundsPosition = null
    if (
      (trayPos === undefined || trayPos.x === 0) &&
      opts.windowPosition.substr(0, 4) === 'tray'
    ) {
      noBoundsPosition =
        process.platform === 'win32' ? 'bottomRight' : 'topRight'
    }

    const position = menubar.positioner.calculate(
      noBoundsPosition || opts.windowPosition,
      trayPos
    )

    const x = opts.x !== undefined ? opts.x : position.x
    const y = opts.y !== undefined ? opts.y : position.y

    menubar.window.setPosition(x, y)
    menubar.window.show()
    menubar.emit('after-show')
  }

  function hideWindow () {
    if (supportsTrayHighlightState) menubar.tray.setHighlightMode('never')
    if (!menubar.window) return
    menubar.emit('hide')
    menubar.window.hide()
    menubar.emit('after-hide')
  }

  function windowClear () {
    delete menubar.window
    menubar.emit('after-close')
  }

  function emitBlur () {
    menubar.emit('focus-lost')
  }

  // prints given message both in the terminal console and in the DevTools
  function broadcast (...args) {
    console.log('broadcast', args[0])
    console.log.apply(args)
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`console.log.apply("${args}")`)
    }
  }

  /* MAIN ELECTRON WINDOW */
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    titleBarStyle: 'hidden',
    frame: false
  })

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
})
