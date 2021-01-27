const EOF = Symbol('EOF')

let currentToken = null;

function emit(token) {
  console.log(token)
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
  if (char.match(/^[a-zA-Z]$/)) {
    return beforeAttributeName
  } else if (char === '>') { // 属性名输完了，且结束了开始标签的数据
    return data
  } else if (char === '=') {
    return beforeAttributeName
  } else {
    return beforeAttributeName
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
}