'use strict'
import { loadPDF2Canvas, PDFViewerApp } from './pdfjs_viewer'

document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
})

document.getElementById('open-file').addEventListener('click', async () => {
  const filePaths = await window.file.open()

  if (filePaths.length === 1) {
    const filePath = filePaths[0]
    document.getElementById('pdf-file-path').innerHTML = filePath
    loadPDF2Canvas(filePath, 'the-canvas')
  }
})

const DEFAULT_URL = 'C:\\Users\\Pascal\\Downloads\\Real analysis measure theory, integration, and Hilbert spaces by Elias M. Stein, Rami Shakarchi (z-lib.org).pdf'

PDFViewerApp.initUI()
PDFViewerApp.open(DEFAULT_URL).then(() => PDFViewerApp.close())
window.App = PDFViewerApp
