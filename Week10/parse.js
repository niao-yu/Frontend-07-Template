const EOF = Symbol('EOF')
const css = require('css');
const layout = require('./layout')
const rules = []

let currentToken = null;
let currentAttribute = null; // 记录属性的
const stack = [{type: 'document', children: []}]
let currentTextNode = null

// 接受并生成虚拟dom
function emit(token) {
  let top = stack[stack.length - 1]
  // console.log(token)

  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: [],
    }

    element.tagName = token.tagName

    for (let key in token) {
      if (key !== 'tagName' && key !== 'type') {
        element.attributes.push({
          name: key,
          value: token[key]
        })
      }
    }

    // 计算 css 规则
    computeCSS(element)

    top.children.push(element)
    element.parent = top

    if (!token.isSelfClosing) {
      stack.push(element)
    }

    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName === token.tagName) {
      // 收集并解析 css style 规则
      if (top.tagName === 'style') {
        addCSSRules(top.children[0].content)
      }
      layout(top)
      stack.pop()
    } else {
      throw new Error(`标签头尾不对应：${top.tagName}, ${token.tagName}`)
    }
    currentTextNode = null
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: '',
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

// 收集并解析 css style 规则
function addCSSRules(text) {
  let ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}

// 计算 css 规则
function computeCSS(element) {
  // console.log('计算css规则')
  // 深拷贝一层栈数组，并反转数组，也就是把dom元素，从内向外依次匹配css规则
  let elements = stack.slice().reverse()

  if (!element.computedStyle) {
    element.computedStyle = {}
  }

  for (let rule of rules) {
    for (let selectors of rule.selectors) {
      let selectorParts = selectors.split(' ').reverse() // 一个组合的选择器
      // 如果当前元素不是这个选择器的目标，直接 continue
      if (!match(element, selectorParts[0])) continue
  
      let matched = false
      let j = 1
  
      for (let i = 0; i < elements.length; i++) {
        if (match(elements[i], selectorParts[j])) {
          j++
        }
      }
      // 全匹配到了
      if (j >= selectorParts.length) {
        matched = true
        // console.log(element, selectorParts)
      }
  
      if (matched) {
        let computedStyle = element.computedStyle
        for (let declaration of rule.declarations) {
          // console.log(declaration)
          // console.log(selectorParts)
          let sp = specificity(selectorParts) // 计算权重
          if (!computedStyle[declaration.property]) { // 还没有设置过
            computedStyle[declaration.property] = {}
            computedStyle[declaration.property].value = declaration.value
            computedStyle[declaration.property].specificity = sp
          } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) { // 设置过了，需要对比一下权重，再看是否需要覆盖样式
            computedStyle[declaration.property].value = declaration.value
            computedStyle[declaration.property].specificity = sp
          }
        }
        // console.log(element.computedStyle)
      }
    }
  }
}

// 计算权重
function specificity(selectorParts) {
  let allSelect = []
  for (let selectorPart of selectorParts) {
    allSelect.push(...parseSelect(selectorPart))
  }

  let spArr = new Array(4).fill(0) // [0, 0, 0 ,0]
  for (let onSelect of allSelect) {
    if (onSelect.charAt(0) === '.') spArr[2]++
    else if (onSelect.charAt(0) === '#') spArr[1]++
    else spArr[3]++
  }
  return spArr
}

// 比较权重
function compare(sp_1, sp_2) {
  for (let i = 0; i < 4; i++) {
    let space = sp_1[i] - sp_2[i]
    if (space < 0) return -1
    else if (space > 0) return 1
  }
  return 0
}

// 分解一个选择器
function parseSelect(str) {
  return str.match(/^([^.^#]+)|(\.[^.^#]+)|(\#[^.^#]+)/g) || []
}

// 对比当前dom和规则是否匹配
// 认为只有三种选择器 类选择器 id选择器 tagName选择器
function match(element, selector) {
  // 条件判断，必须有 attributes
  if (!selector || !element.attributes) return false
  let selectorArr = parseSelect(selector)

  if (!selectorArr.length) return false
  
  for (let _selector of selectorArr) {
    let thisOk = false

    if (_selector.charAt(0) === '#') { // 是 id 选择器
      let attr = element.attributes.find(attr => attr.name === 'id')
  
      if (attr && attr.value === _selector.replace('#', '')) {
        thisOk = true
      }
    } else if (_selector.charAt(0) === '.') { // 是 类选择器
      let attr = element.attributes.find(attr => attr.name === 'class')
      
      if (attr && attr.value === _selector.replace('.', '')) {
        thisOk = true
      }
    } else { // 是 tagName 选择器
      if (element.tagName === _selector) {
        thisOk = true
      }
    }
    if (!thisOk) return false
  }
  return true
}

function data(char) {
  if (char === '<') {
    return tagOpen
  } else if (char === EOF) {
    emit({
      type: 'EOF',
    })
    return
  } else {
    emit({
      type: 'text',
      content: char,
    })
    return data
  }
}

// 开始了一个标签名，不知道是开始还是结束标签
function tagOpen(char) {
  if (char === '/') { // 是一个结束标签的开始
    return endTagOpen
  } else if (char.match(/^[a-zA-Z]$/)) { // 是一个开始标签的开始 开始了 tag 名拼写
    currentToken = {
      type: 'startTag',
      tagName: '',
    }
    return tagName(char)
  } else {
  }
}

// 是一个结束标签的开始
function endTagOpen(char) {
  if (char.match(/^[a-zA-Z]$/)) { // 开始了 tag 名拼写
    currentToken = {
      type: 'endTag',
      tagName: '',
    }
    return tagName(char)
  } else if (char === '>') {
  } else if (char === EOF) {
  } else {
  }
}

// 开始输入开始标签的 tag 名
function tagName(char) {
  if (char.match(/^[\t\n\f ]$/)) { // 即将开始属性名输入
    return beforeAttributeName
  } else if (char === '/') { // 是一个即将输入完的 自封闭标签
    return selfClosingStartTag
  } else if (char.match(/^[a-zA-Z]$/)) { // 正常输入 tag 名
    currentToken.tagName += char
    return tagName
  } else if (char === '>') { // 标签名输入完了
    emit(currentToken)
    return data
  } else {
    return tagName
  }
}

// 开始输入属性
function beforeAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) { // 即将开始输入属性名（可能多个空格）
    return beforeAttributeName
  } else if (char === '>' || char === '/' || char === EOF) { // 属性名输完了，且结束了开始标签的数据
    return afterAttributeName(char);
  } else if (char === '=') {
  } else {
    currentAttribute = {
      name: '',
      value: '',
    }
    return attributeName(char) // 去接收属性名
  }
}

// 接收属性名
function attributeName(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) { // 属性名输入完了
    return afterAttributeName(char)
  } else if (char === '=') { // 准备输入属性值了
    return beforeAttributeValue
  } else if (char === '\u0000') { // 即将开始输入属性名（可能多个空格）

  } else if (char === '"' || char === "'" || char === '<') {

  } else {
    currentAttribute.name += char
    return attributeName
  }
}

// 即将输入属性值
function beforeAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) { // 属性名输入完了
    return beforeAttributeValue
  } else if (char === '"') { // 是双引号的属性值
    return doubleQuotedAttributeValue;
  } else if (char === "'") { // 是单引号的属性值
    return singleQuotedAttributeValue;
  } else { // 没有写引号，直接写的值，也是合法的写法
    return UnquotedAttributeValue(char)
  }
}

// 是双引号的属性值
function doubleQuotedAttributeValue(char) {
  if (char === '"') { // 遇到了另一个 "，写完了这个属性
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (char === '\u0000') {

  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return doubleQuotedAttributeValue
  }
}

// 是单引号的属性值
function singleQuotedAttributeValue(char) {
  if (char === "'") { // 遇到了另一个 "，写完了这个属性
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (char === '\u0000') {

  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return singleQuotedAttributeValue
  }
}

// 写了值
function UnquotedAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/)) { // 遇到了另一个 "，写完了这个属性
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (char === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (char === '\u0000') {

  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return UnquotedAttributeValue
  }
}

// 属性名输入完成
function afterAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (char === '/') {
    return selfClosingStartTag
  } else if (char === '=') {
    return beforeAttributeValue
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (char === EOF) {

  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      naem: '',
      value: '',
    }
    return attributeName(char)
  }

}

function selfClosingStartTag(char) {
  if (char === '>') {
    currentToken.isSelfClosing = true
    emit(currentToken)
    return data
  } else if (char === EOF) {

  } else {
    
  }
}

module.exports.parseHtml = function parseHTML(html) {
  console.log('来了', html)
  let state = data;
  for (let char of html) {
    // console.log(char)
    state = state(char)
  }
  // console.log(rules)
  state = state(EOF)
  console.log(stack[0])
  // console.log(JSON.stringify(stack[0], null, '  '))
}