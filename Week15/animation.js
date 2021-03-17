const TICK = Symbol('tick')
const TICK_HANDLER = Symbol('tick_handler')
const ANIMATIONS = Symbol('animations')
const START_TIME = Symbol('start-time')

export class TimeLine {
  constructor() {
    this[ANIMATIONS] = new Set() // 所有的动画们
    this[START_TIME] = new Map() // 动画们的添加时间
  }
  start() {
    let startTime = Date.now() // TimeLine.start 开始运行的时间
    this[TICK] = () => {
      let now = Date.now() // 当前时间
      // 当前距离开始时过去了多久
      for (let animation of this[ANIMATIONS]) {
        let thisStartTime = this[START_TIME].get(animation) // 获取这个动画设置的 startTime
        let t;
        if (thisStartTime < startTime) { // TimeLine.start 之前就应该已经开始了
          t = now - startTime
        } else { // 还没有到点
          t = now - thisStartTime
        }
        if (animation.duration < t) { // 超出时间了
          this[ANIMATIONS].delete(animation)
          t = animation.duration
        }
        animation.receive(t)
      }
      if (this[ANIMATIONS].size) requestAnimationFrame(this[TICK])
    }
    requestAnimationFrame(this[TICK])
  }

  add(animation, startTime) {
    if (arguments.length < 2) {
      startTime = Date.now() + (animation.delay || 0)
    }
    this[ANIMATIONS].add(animation)
    this[START_TIME].set(animation, startTime) // 动画们的添加时间
    // console.log(this[ANIMATIONS].size)
  }

  //暂停
  pause() {}

  // 恢复
  resume() {}

  // 重置
  reset() {}
}

export class Animation {
  constructor(object, property, startValue, endValue, duration, delay, timingFunction) {
    this.object = object
    this.property = property
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.delay = delay
    this.timingFunction = timingFunction
  }
  receive(time) {
    if (time < 0) return
    console.log(time, this.duration)
    // 属性值变化的区间
    let range = this.endValue - this.startValue

    this.object[this.property] = this.startValue + range / this.duration * time
  }
}