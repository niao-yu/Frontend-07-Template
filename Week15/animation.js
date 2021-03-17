const TICK = Symbol('tick')
const ANIMATIONS = Symbol('animations')

export class TimeLine {
  constructor() {
    this[ANIMATIONS] = new Set()
  }
  start() {
    let startTime = Date.now()
    this[TICK] = () => {
      let t = Date.now() - startTime // 当前距离开始时过去了多久
      for (let animation of this[ANIMATIONS]) {
        let t0 = t
        if (animation.duration < t) { // 超出时间了
          this[ANIMATIONS].delete(animation)
          t0 = animation.duration
        }
        animation.receive(t0)
      }
      if (this[ANIMATIONS].size) requestAnimationFrame(this[TICK])
    }
    requestAnimationFrame(this[TICK])
  }

  add(animation) {
    this[ANIMATIONS].add(animation)
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
  constructor(object, property, startValue, endValue, duration, timingFunction) {
    this.object = object
    this.property = property
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.timingFunction = timingFunction
  }
  receive(time) {
    console.log(time, this.duration)
    // 属性值变化的区间
    let range = this.endValue - this.startValue

    this.object[this.property] = this.startValue + range / this.duration * time
  }
}