function createElement(type, attributes, ...children) {
  let element;

  if (typeof type === 'string') {
    element = new ElementWrapper(type)
  } else {
    element = new type()
  }

  if (attributes) {
    for (let name in attributes) {
      element.setAttribute(name, attributes[name])
    }
  }

  for (child of children) {
    if (typeof child === 'string') {
      child = new TextWrapper(child)
    }
    child.mountTo(element)
  }

  return element
}

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(child) {
    this.root.appendChild(child)
  }

  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

class TextWrapper {
  constructor(text) {
    this.root = document.createTextNode(text)
  }

  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

class Div {
  constructor() {
    this.root = document.createElement('div')
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(child) {
    this.root.appendChild(child)
  }

  mountTo(parent) {
    parent.appendChild(this.root)
  }

}

let a = (
  <Div id="a">
    <span>1</span>
    <span>2</span>
  </Div>
)

a.mountTo(document.querySelector('body'))