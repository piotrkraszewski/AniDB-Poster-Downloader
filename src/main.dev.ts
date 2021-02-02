/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import {startBrowser, scrapeAnimeData, onlyLogin, updateUserData, clearCookies} from './posterDownloader/posterScraperFunctions';


ipcMain.on('scrapePosters', async (e, searchName) => {
  const [resArr, error_msg, isLoggedIn, outLogin_msg, outDidTryLogin, outIsIpBlocked] = await scrapeAnimeData(searchName)
  e.sender.send('scrapeResArr', resArr, error_msg, isLoggedIn, outLogin_msg, outDidTryLogin, outIsIpBlocked)
})

ipcMain.on('selectPathInExplorer', async (e) => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  const downloadPath = res.filePaths[0]
  e.sender.send('newDownloadPath', downloadPath)
})

ipcMain.on('updateUserData', async (e, login, password) => {
  console.log('updateUserData');
  updateUserData(login, password)
})

ipcMain.on('loginUser', async (e) => {
  console.log('loginUser');
  const isLoggedIn = await onlyLogin()
  e.sender.send('loginUserRes', isLoggedIn)
})

ipcMain.on('clearCookies', async (e) => {
  try{
    await clearCookies()
    console.log('cookies cleard');
  }catch(err){
    console.error(err);
  }
})


function createLocalShortcut(){
  mainWindow?.webContents.on('before-input-event', (e, input) =>{
    if(input.key.toLocaleLowerCase() === 'f5' || (input.control && input.key.toLocaleLowerCase() === 'r')){
      // console.log('shotcut used');
      e.preventDefault()
      mainWindow?.webContents.send('refresh')
    }
  })
}

// skrot ktory dzia³a nawet jak elektron nie jest w focusie
function createGlobalShortcut(){
  globalShortcut.register('F5', () => {
    // console.log('shotcut used');
    mainWindow?.webContents.send('refresh')
  })
}




// ===== basic boiler plate ==================== 

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1080,
    height: 1080,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', async () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

      // starts browser after new window and checkslogin status
      const loginStatus = await startBrowser()
      mainWindow?.webContents.send('loginStatus', loginStatus)
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  // opens devTools alos in production mode
  // mainWindow.webContents.openDevTools()
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady()
.then(createWindow)
.catch(console.log)
.then(()=> createLocalShortcut())


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
})
