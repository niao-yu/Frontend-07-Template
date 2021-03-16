export function createElement(type, attributes, ...children) {
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

  for (let child of children) {
    if (typeof child === 'string') {
      child = new TextWrapper(child)
    }
    child.mountTo(element)
  }

  return element
}

export class Component {

  // constructor(type) {
  //   this.root = this.render(type)
  // }

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

class ElementWrapper extends Component {
  constructor(type) {
    this.root = document.createElement(type)
  }
  // render(type) {
  //   return document.createElement(type)
  // }
}

class TextWrapper extends Component {
  constructor(text) {
    this.root = document.createTextNode(text)
  }
  // render(text) {
  //   return document.createTextNode(text)
  // }
}