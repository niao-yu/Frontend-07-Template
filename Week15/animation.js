const TICK = Symbol('tick')
const TICK_HANDLER = Symbol('tick_handler')
const ANIMATIONS = Symbol('animations')
const START_TIME = Symbol('start-time')
const PAUSE_TIME = Symbol('pause-time')
const RESUME_TIME = Symbol('resume-time')

export class TimeLine {
  constructor() {
    this[ANIMATIONS] = new Set() // 所有的动画们
    this[START_TIME] = new Map() // 动画们的添加时间
    this[RESUME_TIME] = 0
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
          t = now - startTime - this[RESUME_TIME]
        } else { // 还没有到点
          t = now - thisStartTime - this[RESUME_TIME]
        }
        if (animation.duration < t) { // 超出时间了
          this[ANIMATIONS].delete(animation)
          t = animation.duration
        }
        animation.receive(t)
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK])
    }
    this[TICK]()
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
  pause() {
    this[PAUSE_TIME] = Date.now()
    cancelAnimationFrame(this[TICK_HANDLER])
  }

  // 恢复
  resume() {
    this[RESUME_TIME] += Date.now() - this[PAUSE_TIME]
    this[TICK]()
  }

  // 重置
  reset() {}
}

export class Animation {
  constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
    this.object = object
    this.property = property
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.delay = delay
    this.timingFunction = timingFunction
    this.template = template
  }
  receive(time) {
    if (time < 0) return
    // 属性值变化的区间
    let range = this.endValue - this.startValue
    let newVal = this.startValue + range / this.duration * time

    this.object[this.property] = this.template ? this.template(newVal) : newVal
  }
}