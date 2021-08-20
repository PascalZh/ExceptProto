const { app, BrowserWindow, ipcMain, nativeTheme, dialog, Menu, MenuItem } = require('electron')
const path = require('path')

let win;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile(path.join(__dirname, 'index.html'))

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

  ipcMain.handle('file:open', () => {
    return dialog.showOpenDialogSync({ properties: ['openFile'],
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