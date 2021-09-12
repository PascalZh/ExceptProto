<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { PDFViewerApp } from './pdf_viewer'

const DEFAULT_URL = './Real analysis measure theory, integration, and Hilbert spaces by Elias M. Stein, Rami Shakarchi (z-lib.org).pdf'

PDFViewerApp.initUI()
PDFViewerApp.open(DEFAULT_URL)

async function toggleDarkMode () {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
}

async function resetToSystem () {
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
}

async function openFile () {
  const filePaths = await window.file.openDialog()

  if (filePaths && filePaths.length === 1) {
    PDFViewerApp.open(filePaths[0])
  }
}

</script>

<template lang="pug">
div
  #ui
    p(hidden)
      | Current theme source:
      strong#theme-source System
    p(hidden)
      | Current PDF file path:
      strong#pdf-file-path
    button(@click="toggleDarkMode")
      | Toggle Dark Mode
    button(@click="resetToSystem")
      | Reset to System Theme
    button(@click="openFile")
      | Open File
    br
    button#previous-page(@click="PDFViewerApp.pdfViewer.currentPageNumber--")
      | Previous Page
    button#next-page(@click="PDFViewerApp.pdfViewer.currentPageNumber++")
      | Next Page
    button(@click="PDFViewerApp.pdfViewZoomIn()")
      | Zoom In
    button(@click="PDFViewerApp.pdfViewZoomOut()")
      | Zoom Out
    p Page
      strong#page-number 1
    br
    label(class='apple-switch')
      input(type="checkbox")

</template>

<style lang="scss">
@import "./styles/base";
@import "pdfjs-dist/web/pdf_viewer.css";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#ui {
  z-index: 1;
  position: absolute;
}
</style>
