import { TimeLine, Animation } from './animation'

let animation = new Animation(document.querySelector('#el').style, 'transform', 0, 1000, 3000, 0, null, val => `translateX(${val}px)`)
let timeLine = new TimeLine()
timeLine.add(animation)
timeLine.start()

document.querySelector('#stop').addEventListener('click', function() {
  timeLine.pause()
})

document.querySelector('#start').addEventListener('click', function() {
  timeLine.resume()
})