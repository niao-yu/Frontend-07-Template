import { Component, createElement } from './framework'
class Carousel extends Component {
  constructor() {
    super()
    this.attributes = Object.create(null)
  }
  setAttribute(name, value) {
    this.attributes[name] = value
  }
  render() {
    this.root = document.createElement('div')
    this.root.classList.add(this.attributes.class)
    let imgs = this.attributes.src
    let children = []
    for (let src of imgs) {
      let divDom = document.createElement('div')
      divDom.style.backgroundImage = `url('${src}')`
      divDom.classList.add('item')
      children.push(divDom)
      this.root.appendChild(divDom)
    }

    let position = 0

    this.root.addEventListener('mousedown', function(event) {
      let startX = event.clientX

      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseup)
      
      function mousemove(event) {
        let clientX = event.clientX
        let space = clientX - startX
        // if (space > 500) space = 500
        // if (space < -500) space = -500

        let current = position - (space - space % 500) / 500

        for (let offset of [-1, 0, 1]) {
          let nowPostion = current + offset
          nowPostion = (nowPostion + children.length) % children.length

          children[nowPostion].style.transition = 'none'
          children[nowPostion].style.transform = `translateX(${ -nowPostion * 500 + offset * 500 + space }px)`
        }
      }

      function mouseup(event) {
        let clientX = event.clientX
        let space = clientX - startX
        // if (space > 500) space = 500
        // if (space < -500) space = -500

        position = position - Math.round(space / 500)

        for (let offset of [0, -Math.sign(Math.round(space / 500) - space + 250 * Math.sign(space))]) {
          let nowPosition = position + offset
          nowPosition = (nowPosition + children.length) % children.length

          children[nowPosition].style.transition = ''
          children[nowPosition].style.transform = `translateX(${ -nowPosition * 500 + offset * 500 }px)`
        }

        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
      }
    })

    // 设置轮播
    // let nowIndex = 0
    // let timer = setInterval(() => {
    //   let nextIndex = (nowIndex + 1) % imgs.length

    //   let nowDom = children[nowIndex]
    //   let nextDom = children[nextIndex]

    //   nextDom.style.transition = 'none'
    //   nextDom.style.transform = `translateX(${ -100 * nextIndex + 100 }%)`
    //   setTimeout(() => {
    //     nextDom.style.transition = ''

    //     nowDom.style.transform = `translateX(${ -100 * nowIndex - 100 }%)`
    //     nextDom.style.transform = `translateX(${ -100 * nextIndex }%)`

    //     nowIndex = nextIndex
    //   }, 16);
    // }, 3000);


    return this.root
  }
  mountTo(parent) {
    parent.appendChild(this.render())
  }
}

let imgs = [
  'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
]
let a = (
  <Carousel class="carouselBox" src={imgs}></Carousel>
)



a.mountTo(document.querySelector('body'))