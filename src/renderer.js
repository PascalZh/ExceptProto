document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
})

document.getElementById('open-file').addEventListener('click', async () => {
  var filePaths = await window.file.open()
  
  if (filePaths.length === 1) {
    var filePath = filePaths[0]
    document.getElementById('pdf-file-path').innerHTML = filePath
    loadPDF2Canvas(filePath, 'the-canvas')
  }
})

window.addEventListener('load', () => {
  loadPDF2Canvas("C:\\Users\\Pascal\\Documents\\我的坚果云\\LaTeX_RefSheet.pdf", 'the-canvas');
})

function loadPDF2Canvas(filePath, canvasID) {
  // The workerSrc property shall be specified.
  //
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    '../node_modules/pdfjs-dist/build/pdf.worker.js';

  var loadingTask = pdfjsLib.getDocument(filePath);
  loadingTask.promise.then(function(pdf) {
    // Fetch the first page.
    pdf.getPage(1).then(function(page) {
      var scale = 2;
      var viewport = page.getViewport({ scale: scale, });

      // Prepare canvas using PDF page dimensions.
      var canvas = document.getElementById(canvasID);
      var context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context.
      var renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
    });
  });
}

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
  // eslint-disable-next-line no-alert
  alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
}

// The workerSrc property shall be specified.
//
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../node_modules/pdfjs-dist/build/pdf.worker.js";

// Some PDFs need external cmaps.
//
const CMAP_URL = "../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

const DEFAULT_URL = "C:\\Users\\Pascal\\Documents\\我的坚果云\\LaTeX_RefSheet.pdf";
// To test the AcroForm and/or scripting functionality, try e.g. this file:
// var DEFAULT_URL = "../../test/pdfs/160F-2019.pdf";

const SEARCH_FOR = ""; // try 'Mozilla';
const SANDBOX_BUNDLE_SRC = "../node_modules/pdfjs-dist/build/pdf.sandbox.js";

const container = document.getElementById("viewerContainer");

const eventBus = new pdfjsViewer.EventBus();

// (Optionally) enable hyperlinks within PDF files.
const pdfLinkService = new pdfjsViewer.PDFLinkService({
  eventBus,
});

// (Optionally) enable find controller.
const pdfFindController = new pdfjsViewer.PDFFindController({
  eventBus,
  linkService: pdfLinkService,
});

// (Optionally) enable scripting support.
const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  eventBus,
  sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
});

const pdfViewer = new pdfjsViewer.PDFViewer({
  container,
  eventBus,
  linkService: pdfLinkService,
  findController: pdfFindController,
  scriptingManager: pdfScriptingManager,
  enableScripting: true, // Only necessary in PDF.js version 2.10.377 and below.
});
pdfLinkService.setViewer(pdfViewer);
pdfScriptingManager.setViewer(pdfViewer);

eventBus.on("pagesinit", function () {
  // We can use pdfViewer now, e.g. let's change default scale.
  pdfViewer.currentScaleValue = "page-width";

  // We can try searching for things.
  if (SEARCH_FOR) {
    pdfFindController.executeCommand("find", { query: SEARCH_FOR });
  }
});

// Loading document.
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  cMapUrl: CMAP_URL,
  cMapPacked: CMAP_PACKED,
});
loadingTask.promise.then(function (pdfDocument) {
  // Document loaded, specifying document for the viewer and
  // the (optional) linkService.
  pdfViewer.setDocument(pdfDocument);

  pdfLinkService.setDocument(pdfDocument, null);
});