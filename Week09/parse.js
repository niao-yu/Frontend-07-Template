const EOF = Symbol('EOF')

let currentToken = null;
let currentAttribute = null; // 记录属性的
const stack = [{type: 'document', children: []}]
let currentTextNode = null

function emit(token) {
  let top = stack[stack.length - 1]

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

    top.children.push(element)
    element.parent = top

    if (!token.isSelfClosing) {
      stack.push(element)
    }

    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName === token.tagName) {
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
    console.log(token.content)
    currentTextNode.content += token.content
  }
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
  } else if (char === '\u0000') {

  } else if (char === EOF) {

  } else {
    currentAttribute.value += char
    return doubleQuotedAttributeValue
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
  state = state(EOF)
  console.log(stack[0])
}