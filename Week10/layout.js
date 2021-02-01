function layout(element) {
  if (!element.computedStyle) return

  let elementStyle = getStyle(element)

  // 当前的布局只能使用flex布局
  if (elementStyle.display !== 'flex') return

  let items = element.children.filter(e => e.type === 'element')

  items.sort((a, b) => a.order || 0 - b.order - 0)

  let style = elementStyle;

  ['width', 'height'].forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null
    }
  })

  // 对 flex 的一些配置设置默认值
  if (!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row'
  }
  if (!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch'
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start'
  }
  if (!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap'
  }
  if (!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch'
  }

  // 自定义准备属性
  let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase

  // 判断当前的布局结构，赋值变量
  if (style.flexDirection === 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }
  if (style.flexDirection === 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'left'
    mainSign = -1
    mainBase = style.width

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }
  if (style.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd = 'bottom'
    mainSign = +1
    mainBase = 0

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }
  if (style.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd = 'top'
    mainSign = -1
    mainBase = style.height

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }
  if (style.flexWrap === 'wrap-reverse') {
    let temp = crossStart
    crossStart = crossEnd
    crossEnd = temp
    crossSign = -1
  } else {
    crossBase = 0
    crossSign = 1
  }

  // 开始配置

  // 自动换行情况的处理
  let isAutoMainSize = false // 是自动尺寸
  if (!style[mainSize]) { // 没有设置主轴尺寸，那么就是自动尺寸了
    style[mainSize] = 0
    for (let item of items) {
      let itemStyle = getStyle(item)
      style[mainSize] += itemStyle[mainSize] || 0
    }
    isAutoMainSize = true
  }

  // 整理行们
  let flexLine = [], flexLines = [flexLine]

  let mainSpace = style[mainSize] // 当前行主轴的剩余的空间
  let crossSpace = 0 // 垂直轴，当前行的占用空间

  for (let item of items) {
    let itemStyle = getStyle(item)

    // 如果没有设置值，设为0
    if (itemStyle[mainSize] === null) itemStyle[mainSize] = 0

    // 如果设置了 flex 这个css属性，说明当前元素是可伸缩的了，必然是在当前行
    if (itemStyle.flex) {
      flexLine.push(item)
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) { // 父盒子不换行且自适应宽度
      mainSpace -= itemStyle[mainSize] // 更新主轴剩余空间
      crossSpace = Math.max(crossSpace, itemStyle[crossSign]) // 更新附行所占用的空间
      flexLine.push(item)
    } else { // 允许换行时的逻辑
      if (itemStyle[mainSize] > style[mainSign]) {
        itemStyle[mainSize] = style[mainSign]
      }

      if (mainSpace < itemStyle[mainSize]) { // 需要换行了
        flexLine.mainSpace = mainSpace
        flexLine.crossSpace = crossSpace
        flexLine = [item]
        flexLines.push(flexLine)
        // 重置两个值
        mainSpace = style[mainSize]
        crossSpace = 0
      } else {
        flexLine.push(item)
      }
      mainSpace -= itemStyle[mainSize] // 更新主轴剩余空间
      crossSpace = Math.max(crossSpace, itemStyle[crossSize]) // 更新附行所占用的空间
    }
  }

  flexLine.mainSpace = mainSpace

  // 开始分配剩余空间，铺满，还是留着，等等

  // 整理主轴
  // 根据是否换行，得到当前行的高度，是设置的值，还是内容撑开等等
  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = style[crossSize] !== undefined ? style[crossSize] : crossSpace
  } else {
    flexLine.crossSpace = crossSpace
  }

  // 不换行、不自动宽度时，主轴不够用了
  if (mainSpace < 0) {
    let scale = style[mainSize] / (style[mainSize] - mainSpace) // 缩小比例
    let currentMain = mainBase // 元素的开头，距离父盒子开头的距离
    for (let item of items) {
      let itemStyle = getStyle(item)

      // 这个子元素，设置了flex自适应的值
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0
      }

      // 按比例 设置尺寸
      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      // 设置元素的开头，距离父盒子开头的距离
      itemStyle[mainStart] = currentMain
      // 设置元素的结尾，距离父盒子开头的距离
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
      currentMain = itemStyle[mainEnd] // 更新
    }
  } else { // 单行时没有填满，或者多行的情况
    flexLines.forEach(items => {
      let mainSpace = items.mainSpace // 拿到每一行剩余的空间
      let flexTotal = 0 // 这一行，所有的给了 flex 属性的值的和

      for (let item of items) {
        let itemStyle = getStyle(item)

        if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
          flexTotal += itemStyle.flex
        }
      }

      // 有值，需要等比扩张
      if (flexTotal > 0) {
        var currentMain = mainBase
        for (let item of items) {
          let itemStyle = getStyle(item)

          // 这个子元素设置了 flex，等比扩张一下
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
          }

          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize] || 0
          currentMain = itemStyle[mainEnd]
        }
      } else { // 没有值，不用扩张了，可以看一下其他属性的布局了
        let currentMain, step
        if (style.justifyContent === 'flex-start') {
          currentMain = mainBase // 内容们的开始位置
          step = 0
        }
        if (style.justifyContent === 'flex-end') {
          currentMain = mainSpace * mainSign + mainBase // 内容们的开始位置
          step = 0
        }
        if (style.justifyContent === 'center') {
          currentMain = mainSpace / 2 * mainSign + mainBase // 内容们的开始位置
          step = 0
        }
        if (style.justifyContent === 'space-between') {
          currentMain = mainBase
          step = mainSpace / (items.length - 1) * mainSign
        }
        if (style.justifyContent === 'space-around') {
          step = mainSpace / items.length * mainSign
          currentMain = step / 2 + mainBase
        }
        
        for (let item of items) {
          let itemStyle = getStyle(item)


          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize] || 0
          currentMain = itemStyle[mainEnd] + step
        }
      }
    })
  }
  // console.log(11, element.children)
  // console.log(element.children[1])

  // 整理交叉轴

  crossSpace = undefined

  // 没有设置高度，则内部高度由子元素撑开
  if (!style[crossSize]) {
    crossSpace = 0
    elementStyle[crossSize] = 0
    for (let flexLine of flexLines) {
      elementStyle[crossSize] += flexLine.crossSpace
    }
  } else { // 否则，去这个值减去一行行的 flexLine 的高
    crossSpace = style[crossSize]
    for (let flexLine of flexLines) {
      crossSpace -= flexLine.crossSpace
    }
  }

  // 分配行高
  if (style.flexWrap === 'wrap-reverse') crossBase = style[crossSize]
  else crossBase = 0

  // let lineSize = style[crossSize] / flexLines.length
  let step = undefined

  if (style.justifyContent === 'flex-start') {
    crossBase += 0
    step = 0
  }
  if (style.justifyContent === 'flex-end') {
    crossBase += crossSign * crossSpace
    step = 0
  }
  if (style.justifyContent === 'center') {
    crossBase += crossSign * crossSpace / 2
    step = 0
  }
  if (style.justifyContent === 'space-between') {
    crossBase += 0
    step = crossSpace / (flexLines.length - 1)
  }
  if (style.justifyContent === 'space-around') {
    step = crossSpace / flexLines.length
    crossBase += crossSign * step / 2
  }
  if (style.justifyContent === 'stretch') {
    crossBase += 0
    step = 0
  }

  flexLines.forEach(items => {
    let lineCrossSize = style.alignContent === 'stretch' ? (items.crossSpace + crossSpace / flexLines.length) : items.crossSpace;

    for (let item of items) {
      let itemStyle = getStyle(item)

      let align = itemStyle.alignSelf || style.alignItems

      if (item === null) {
        itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0
      }

      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
      }
      if (align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = crossBase + crossSign * (itemStyle[crossSize] !== null && itemStyle[crossSize]) || 0

        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }

    }
    crossBase += crossSign * (lineCrossSize + step)
  })

  // console.log(items)

}

// 计算获取属性，对属性的值进行格式处理，主要把px和数字字符串格式的值转为数字
function getStyle(element) {
  if (!element.style) element.style = {}

  for (let prop in element.computedStyle){
    // let p = element.computedStyle.value
    // console.log(prop, element.computedStyle[prop])

    element.style[prop] = element.computedStyle[prop].value

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop])
    }
    if (element.style[prop].toString().match(/^[\d\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop])
    }
  }

  return element.style
}

module.exports = layout