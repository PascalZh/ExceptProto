const pdfViewer = {
  _defaultScale: 1,
  get defaultScale () {
    return this._defaultScale
  },
  set defaultScale (value) {
    this._defaultScale = value
  },
  _maxScale: 10,
  get maxScale () {
    return this._maxScale
  },
  set maxScale (value) {
    this._maxScale = value
  },
  _minScale: 0.25,
  get minScale () {
    return this._minScale
  },
  set minScale (value) {
    this._minScale = value
  }
}

const globalOptions = { pdfViewer }

window.globalOptions = globalOptions

export default globalOptions
