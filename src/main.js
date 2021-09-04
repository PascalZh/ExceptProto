const { app, BrowserWindow, ipcMain, nativeTheme, dialog, Menu, MenuItem } = require('electron')
const path = require('path')

let win
const isDev = process.env.NODE_ENV === 'development'
// const isDev = true

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.maximize()

  if (isDev) {
    win.loadURL('http://localhost:3000/')
  } else {
    win.loadFile('dist/index.html')
  }

  if (isDev) {
    win.webContents.toggleDevTools()
  }

  win.show()

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })

  ipcMain.handle('file:open-dialog', () => {
    return dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })
  })
  return win
}

app.whenReady().then(() => {
  win = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Create Menu and Shortcuts
const menu = new Menu()
menu.append(new MenuItem({
  label: 'Develop',
  submenu: [{
    role: 'ToggleDevTools',
    accelerator: process.platform === 'darwin' ? 'F12' : 'F12',
    click: () => {
      win.webContents.toggleDevTools()
    }
  }]
}))

Menu.setApplicationMenu(menu)
