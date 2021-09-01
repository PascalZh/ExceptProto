const webpack = require('webpack') // eslint-disable-line no-unused-vars
const path = require('path')

module.exports = {
  context: __dirname,
  entry: {
    'pdf.worker.min': 'pdfjs-dist/build/pdf.worker.entry'
  },
  mode: 'production',
  output: {
    path: path.join(__dirname, 'public')
  }
}
