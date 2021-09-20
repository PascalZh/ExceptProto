# Build
- Compile `public/pdf.worker.min.js` with webpack, or just find it in the `pdfjs-dist` module and copy it into public.
- Copy cmaps into `public/node_modules/pdfjs-dist/cmaps`.

# Todo
- [x] cmaps are not loaded correctly. cmaps are loaded by relative paths (`./node_modules/pdfjs-dist/cmaps/...`), when building into `dist/index.html` the relative paths are wrong. Maybe we can build the `pdf.worker.min.js` with vite or webpack, so that all paths are compiled correctly.

- [ ] listen to ctrl+scroll event and touch pad pinch gestures to zoom in and zoom out pdf viewer with pdf viewer's apis.
