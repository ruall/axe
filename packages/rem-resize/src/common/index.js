import './reset.css'

const docEl = document.documentElement
const metaEl = document.querySelector('meta[name="viewport"]')

const maxWidth = window.__MAX_WIDTH__ || 750
const divPart = window.__DIV_PART__ || 15
const bodySize = window.__BODY_SIZE__ || 12

let scale = 1
let dpr = 1
let timer = null

if (metaEl) {
  console.warn('根据已有的meta标签来设置缩放比例')

  const match = metaEl.getAttribute('content').match(/initial-scale=([\d.]+)/)

  if (match) {
    scale = parseFloat(match[1])
    dpr = parseInt(1 / scale)
  }
} else {
  if (window.navigator.appVersion.match(/iphone/gi)) {
    dpr = parseInt(window.devicePixelRatio) || 1
    scale = 1 / dpr
  }

  const newMetaEl = document.createElement('meta')
  newMetaEl.setAttribute('name', 'viewport')
  newMetaEl.setAttribute('content', `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}, user-scalable=no`)
  docEl.firstElementChild.appendChild(newMetaEl)
}

// 设置根节点dpr
docEl.setAttribute('data-dpr', dpr)

function bodyLoaded (cb) {
  if (document.body) {
    cb && cb()
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      cb && cb()
    }, false)
  }
}

// 窗口宽度改变时，刷新rem
function refreshRem () {
  let width = docEl.clientWidth

  if (width / dpr > maxWidth) {
    width = maxWidth * dpr
  }

  // 设置根节点font-size
  window.remUnit = width / divPart
  docEl.style.fontSize = window.remUnit + 'px'

  bodyLoaded(() => {
    // 测试rem的准确性，如果和预期不一样，则进行缩放
    let noEl = document.createElement('div')
    noEl.style.width = '1rem'
    noEl.style.height = '0'
    document.body.appendChild(noEl)

    let rate = noEl.clientWidth / window.remUnit

    if (Math.abs(rate - 1) >= 0.01) {
      docEl.style.fontSize = (window.remUnit / rate) + 'px'
    }

    document.body.removeChild(noEl)
  })
}

// 初始化
refreshRem()

bodyLoaded(() => {
  document.body.style.fontSize = bodySize * dpr + 'px'
  document.body.style.maxWidth = maxWidth * dpr + 'px'
})

window.addEventListener('resize', function () {
  clearTimeout(timer)
  timer = setTimeout(refreshRem, 200)
}, false)

// 浏览器返回时，iPhone7以上手机的页面可见宽度为实际尺寸（不会乘以设备像素比）
// 目前在安卓机的表现未可知，因此注释掉该段代码
// 猜测原因可能是因为viewport是js动态填充的，返回时没有拿到计算后的viewport值
// window.addEventListener('pageshow', function (e) {
//   if (e.persisted) {
//     refreshRem()
//   }
// }, false)

// 全局单位转换方法
window.px2rem = function (d) {
  let val = parseFloat(d) / window.remUnit

  if (typeof d === 'string' && d.match(/px$/)) {
    val += 'rem'
  }

  return val
}

window.rem2px = function (d) {
  let val = parseFloat(d) * window.remUnit

  if (typeof d === 'string' && d.match(/rem$/)) {
    val += 'px'
  }

  return val
}
