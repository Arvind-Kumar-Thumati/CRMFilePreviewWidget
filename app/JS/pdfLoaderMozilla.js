// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
// var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
// var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
// src ="app/pdfjs-dist/build/pdf.worker.js"

// pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdfjs-dist/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1,
    canvas = document.getElementById("cnv"),
    ctx = canvas.getContext("2d");

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    // Update page counters
    document.getElementById('npages').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

function onZoomIn(){
    scale++;
    queueRenderPage(pageNum);
}
document.getElementById("zoomIn").addEventListener('click', onZoomIn)

function onZoomOut(){
    scale--;
    if(scale <= 0) scale = 0.5;
    queueRenderPage(pageNum);
}
document.getElementById("zoomOut").addEventListener('click', onZoomOut)

/**
 * Asynchronously downloads PDF.
 */

function renderPDF( url) {
    pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
          document.getElementById('pageCount').textContent = pdfDoc.numPages;

        // Initial/first page rendering
        renderPage(pageNum);
    });
}