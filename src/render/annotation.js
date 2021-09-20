import { getTextWidth, getFontSize } from './get_text_width'

function renderRange (range) {
  const r = range

  renderSpan(r.startSpan)

  for (let curSpan = r.startSpan.nextElementSibling;
    curSpan.nextElementSibling !== r.endSpan;
    curSpan = curSpan.nextElementSibling) {
    if (curSpan.nodeName === 'SPAN') {
      renderSpan(curSpan)
    }
  }

  renderSpan(r.endSpan)
}

window.renderRange = renderRange

function renderSpan (curSpan) {
  const annotationSpan = document.createElement('span')
  annotationSpan.classList = ['annotation']

  if (curSpan.firstElementChild !== null) {
    curSpan.removeChild(curSpan.firstElementChild)
  }
  curSpan.appendChild(annotationSpan)
}

export {
  renderRange
}
