import './global_options'
import {
  GlobalWorkerOptions, getDocument,
  InvalidPDFException, MissingPDFException, UnexpectedResponseException,
  shadow
} from 'pdfjs-dist'
import { PDFViewer, EventBus, PDFLinkService, PDFFindController, PDFScriptingManager, PDFHistory, ProgressBar, NullL10n } from 'pdfjs-dist/web/pdf_viewer'

// The workerSrc property shall be specified.
//
GlobalWorkerOptions.workerSrc = './pdf.worker.min.js'

// Some PDFs need external cmaps.
//
const CMAP_URL = './node_modules/pdfjs-dist/cmaps/'
const CMAP_PACKED = true

// To test the AcroForm and/or scripting functionality, try e.g. this file:
// var DEFAULT_URL = "../../test/pdfs/160F-2019.pdf";

const SEARCH_FOR = '' // try 'Mozilla';
const SANDBOX_BUNDLE_SRC = './node_modules/pdfjs-dist/build/pdf.sandbox.js'

// eslint-disable-next-line no-unused-vars
const PDFViewerApp = {
  container: null,
  eventBus: null,
  pdfLoadingTask: null,
  pdfDocument: null,
  pdfViewer: null,
  pdfHistory: null,
  pdfLinkService: null,
  l10n: null,

  /**
   * Opens PDF document specified by URL.
   * @returns {Promise} - Returns the promise, which is resolved when document
   *                      is opened.
   */
  open (url) {
    if (this.pdfLoadingTask) {
      // We need to destroy already opened document
      return this.close().then(
        function () {
          // ... and repeat the open() call.
          return this.open(url)
        }.bind(this)
      )
    }

    const self = this

    // Loading document.
    const loadingTask = getDocument({
      url,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED
    })
    this.pdfLoadingTask = loadingTask

    loadingTask.onProgress = function (progressData) {
      self.progress(progressData.loaded / progressData.total)
    }

    return loadingTask.promise.then(
      function (pdfDocument) {
        // Document loaded, specifying document for the viewer.
        self.pdfDocument = pdfDocument
        self.pdfViewer.setDocument(pdfDocument)
        self.pdfLinkService.setDocument(pdfDocument)
        self.pdfHistory.initialize({ fingerprint: pdfDocument.fingerprint })

        self.loadingBar.hide()
      },
      function (exception) {
        const message = exception && exception.message
        const l10n = self.l10n
        let loadingErrorMessage

        if (exception instanceof InvalidPDFException) {
          // change error message also for other builds
          loadingErrorMessage = l10n.get(
            'invalid_file_error',
            null,
            'Invalid or corrupted PDF file.'
          )
        } else if (exception instanceof MissingPDFException) {
          // special message for missing PDFs
          loadingErrorMessage = l10n.get(
            'missing_file_error',
            null,
            'Missing PDF file.'
          )
        } else if (exception instanceof UnexpectedResponseException) {
          loadingErrorMessage = l10n.get(
            'unexpected_response_error',
            null,
            'Unexpected server response.'
          )
        } else {
          loadingErrorMessage = l10n.get(
            'loading_error',
            null,
            'An error occurred while loading the PDF.'
          )
        }

        loadingErrorMessage.then(function (msg) {
          self.error(msg, { message })
        })
        self.loadingBar.hide()
      }
    )
  },

  /**
   * Closes opened PDF document.
   * @returns {Promise} - Returns the promise, which is resolved when all
   *                      destruction is completed.
   */
  close () {
    if (!this.pdfLoadingTask) {
      return Promise.resolve()
    }

    const promise = this.pdfLoadingTask.destroy()
    this.pdfLoadingTask = null

    if (this.pdfDocument) {
      this.pdfDocument = null

      this.pdfViewer.setDocument(null)
      this.pdfLinkService.setDocument(null, null)

      if (this.pdfHistory) {
        this.pdfHistory.reset()
      }
    }

    return promise
  },

  initUI () {
    const container = document.getElementById('viewer-container')
    this.container = container

    const eventBus = new EventBus()
    this.eventBus = eventBus

    // (Optionally) enable hyperlinks within PDF files.
    const pdfLinkService = new PDFLinkService({
      eventBus
    })
    this.pdfLinkService = pdfLinkService

    // (Optionally) enable find controller.
    const pdfFindController = new PDFFindController({
      eventBus,
      linkService: pdfLinkService
    })
    this.pdfFindController = pdfFindController

    // (Optionally) enable scripting support.
    const pdfScriptingManager = new PDFScriptingManager({
      eventBus,
      sandboxBundleSrc: SANDBOX_BUNDLE_SRC
    })
    this.pdfScriptingManager = pdfScriptingManager

    this.l10n = NullL10n

    const pdfViewer = new PDFViewer({
      container,
      eventBus,
      linkService: pdfLinkService,
      findController: pdfFindController,
      l10n: this.l10n,
      scriptingManager: pdfScriptingManager,
      enableScripting: true, // Only necessary in PDF.js version 2.10.377 and below.
      removePageBorders: false // Removes the border shadow around the pages. The default value is `false`.
    })
    this.pdfViewer = pdfViewer

    this.pdfHistory = new PDFHistory({
      linkService: pdfLinkService,
      eventBus
    })
    pdfLinkService.setHistory(this.pdfHistory)

    pdfLinkService.setViewer(pdfViewer)
    pdfScriptingManager.setViewer(pdfViewer)

    eventBus.on('pagesinit', function () {
      // We can use pdfViewer now, e.g. let's change default scale.
      pdfViewer.currentScaleValue = 1

      // We can try searching for things.
      if (SEARCH_FOR) {
        pdfFindController.executeCommand('find', { query: SEARCH_FOR })
      }
    })

    eventBus.on(
      'pagechanging',
      function (evt) {
        const page = evt.pageNumber
        const numPages = PDFViewerApp.pdfDocument.numPages

        document.getElementById('page-number').innerHTML = page
        document.getElementById('previous-page').disabled = page <= 1
        document.getElementById('next-page').disabled = page >= numPages
      },
      true
    )
  },

  pdfViewZoomIn (ticks) {
    const DEFAULT_SCALE_DELTA = 1.1
    const MAX_SCALE = window.globalOptions.pdfViewer.maxScale
    let newScale = this.pdfViewer.currentScale
    do {
      newScale = (newScale * DEFAULT_SCALE_DELTA)
      newScale = Math.ceil(newScale * 10) / 10
      newScale = Math.min(MAX_SCALE, newScale)
    } while (--ticks && newScale < MAX_SCALE)
    this.pdfViewer.currentScaleValue = newScale
  },

  pdfViewZoomOut (ticks) {
    const DEFAULT_SCALE_DELTA = 1.1
    const MIN_SCALE = window.globalOptions.pdfViewer.minScale
    let newScale = this.pdfViewer.currentScale
    do {
      newScale = (newScale / DEFAULT_SCALE_DELTA)
      newScale = Math.floor(newScale * 10) / 10
      newScale = Math.max(MIN_SCALE, newScale)
    } while (--ticks && newScale > MIN_SCALE)
    this.pdfViewer.currentScaleValue = newScale
  },

  get loadingBar () {
    const bar = new ProgressBar('#loadingBar', {})

    return shadow(this, 'loadingBar', bar)
  },

  progress (level) {
    const percent = Math.round(level * 100)
    // Updating the bar if value increases.
    if (percent > this.loadingBar.percent || isNaN(percent)) {
      this.loadingBar.percent = percent
    }
  }
}

function loadPDF2Canvas (filePath, canvasID) {
  const loadingTask = getDocument(filePath)
  loadingTask.promise.then(function (pdf) {
    // Fetch the first page.
    pdf.getPage(1).then(function (page) {
      const scale = 2
      const viewport = page.getViewport({ scale: scale })

      // Prepare canvas using PDF page dimensions.
      const canvas = document.getElementById(canvasID)
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      // Render PDF page into canvas context.
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      page.render(renderContext)
    })
  })
}

export {
  loadPDF2Canvas,
  PDFViewerApp
}

export default PDFViewerApp
