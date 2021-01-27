const EOF = Symbol('EOF')

function data(char) {
  if (char === '<') {
    return tagOpen
  } else if (char === EOF) {
    return
  } else {
    return data
  }
}

// 开始了一个标签名，不知道是开始还是结束标签
function tagOpen(char) {
  if (char === '/') {
    return endTagOpen // 是一个结束标签的开始
  } else if (char.match(/^[a-zA-Z]$/)) { // 开始了 tag 名拼写
    return tagName(char)
  } else {
  }
}

// 是一个结束标签的开始
function endTagOpen(char) {
  if (char.match(/^[a-zA-Z]$/)) { // 开始了 tag 名拼写
    // currentToken = {
    //   type: 'endTag',

    // }
  } else if (char === '>') {

  } else if (char === EOF) {

  } else {

  }
}

// 开始输入开始标签的 tag 名
function tagName(char) {
  if (char.match(/^[\t\n\f ]$/)) { // 结束了
    return beforeAttributeName // 即将开始属性名输入
  } else if (char === '/') { // 是一个即将输入完的 自封闭标签
    return selfClosingStartTag
  } else if (char.match(/^[a-zA-Z]$/)) { // 正常输入 tag 名
    return tagName
  } else if (char === '>') { // 标签名输入完了
    return data
  } else {
    return tagName
  }
}

// 开始输入属性
function beforeAttributeName(char) {
  if (c.match(/^[a-zA-Z]$/)) {
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
    return data
  } else if (char === EOF) {

  } else {
    
  }
}

module.export.parseHtml = function parseHTML(html) {
  let state = data;
  for (let char of html) {
    state = state(char)
  }
  state = state(EOF)
}