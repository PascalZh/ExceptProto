const pdfjsLib = require('pdfjs-dist')
const pdfjsViewer = require('pdfjs-dist/web/pdf_viewer')
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})

contextBridge.exposeInMainWorld('file', {
  open: () => ipcRenderer.invoke('file:open'),
})