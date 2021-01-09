# 学习笔记

# defineProperty 和 proxy

## 对象和类的 getter 和 setter

getter 和 setter 作用于对象或类的一个属性，设置当获取或设置该属性时，执行的方法。

使用 getter 或 setter 定义的属性，称为伪属性。

### getter

官方文档：[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get)

语法：
```js
{get prop() { ... } }
{get [expression]() { ... } }
```
- prop：要获取值的的属性名
- expression：表达式，类似比如 `let type = 'apple'; obj[type] = 100;`

### setter

官方文档：[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/set)

语法：
```js
{set prop(val) { . . . }}
{set [expression](val) { . . . }}、
```

- prop：要设置 setter 的属性名
- val：传入的数据，也就是要设置的值
- expression：表达式，类似比如 `let type = 'apple'; obj[type] = 100;`

### getter 和 setter 程序说明

```js
let obj = {
  _num: 0,
  get num() {
    this._num++
    return this._num
  },
  set num(val) {
    this._num = val * 10
    return this._num
  }
}

console.log(obj._num) // 0 - 直接取 _num，直接返回，无其他作用
console.log(obj.num) // 1 - 取 num，执行了方法 _num 自增1，并返回 _num
console.log(obj._num) // 1 - 直接取 _num，直接返回，此时 _num 在上一步被自增 1
console.log(obj.num) // 2
console.log(obj._num) // 2

obj.num = 2 // 设置 num，执行它的 setter 方法，实际给 _num 设置的值是 2 * 10

console.log(obj._num) // 20 直接取 _num
console.log(obj.num) // 21 取 num，先自增1
```

直接打印对象 obj，可以看到如下的显示：

- _num 是普通属性，直接显示
- num 会在获取时调用 getter 方法，可能会影响程序运行，所以没有直接显示，可以点击一下，执行 getter 方法查看
- num 的 getter 和 setter 方法表现为暗色的属性

![Snipaste_2020-12-31_16-25-21.png](https://docassets.junlli.com/img/5e2ffddfd065d02559ac8eb6b3103224.png)


### 注意

- 不能为一个已有真实值的变量使用 get 或 set ，也不能为一个属性设置多个 get 或 set
- 可以使用对象的 delete 方法删除伪属性
- 当给对象使用 get 关键字时，它和 Object.defineProperty() 有类似的效果
- 在类中使用 get 和 set，再通过类实例化出来的对象，属性将被定义在对象实例的原型上

## Object.defineProperty

官方文档：[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象

Object.defineProperty(obj, prop, descriptor)

- obj：要定义属性的对象
- prop：要定义或修改的属性的名称或 Symbol 
- descriptor(可选)：要定义或修改的属性描述符对象

属性描述符：是对象中一个属性的相关信息，比如这个属性的值、值是否可更改、是否可枚举等等。

使用 defineProperty 设置属性，主要就是为了设置属性描述符。

属性描述符又分为两种，一个描述符只能是这两者其中之一，不能同时是两者，否则会直接报错：
- 数据描述符：常规对象都是这种，是一个具有值的属性，该值可以是可写的，也可以是不可写的
- 存取描述符：属性描述符中有 get 或 set 属性的属性描述符们

所有属性描述符为以下几个字段：

|属性描述符|说明|默认值|
|-:|-|-|
|value|属性的值|undefined|
|writable|值为 true 时，属性的值（也就是 value）才能被修改|false|
|enumerable|值为 true 时，该属性才会出现在对象的枚举属性中|false|
|configurable|值为 true 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除|false|
|get|属性的 getter 函数，当访问该属性时，会调用此函数，执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的this并不一定是定义该属性的对象），该函数的返回值会被用作属性的值|undefined|
|set|属性的 setter 函数，当属性值被修改时，会调用此函数，该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 this 对象|undefined|

两种属性描述符可用的属性：
|描述符类型|configurable|enumerable|value|writable|get|set|
|-|-|-|-|-|-|-|
|数据描述符|可以|可以|可以|可以|不可以|不可以
|存取描述符|可以|可以|不可以|不可以|可以|可以

程序说明：
```js
const obj = {
  key_1: 100
};

let obj2 = Object.defineProperty(obj, 'pro_1', {
  value: '我是 pro_1',
})

Object.defineProperty(obj, 'pro_2', {
  enumerable: true, // 设置可枚举
  get() {
    return '我是 pro_2'
  },
})

obj.key_1 = 101 // 修改三个属性的值
obj.pro_1 = 101 // 修改三个属性的值
obj.pro_2 = 101 // 修改三个属性的值

console.log(obj === obj2) // true
console.log(obj.key_1) // 101 - 被修改
console.log(obj.pro_1) // 我是 pro_1 - 未设置 writable 为true 不能修改
console.log(obj.pro_2) // 我是 pro_2 - 设置了 get，是存取器属性，未设置 set，值无法被修改
console.log(Object.keys(obj)) // ['key_1', 'pro_2'] - 可以被枚举的属性
```

直接打印对象 obj，可以看到如下的显示：

- key_1 和 pro_2 可遍历的是亮的，不可遍历的 pro_1 颜色比较暗
- pro_2 的值是获取值才运行方法返回的，需要点击一下运行 get 方法才能看到值，所以直接打印是，pro_2 的值是省略号
- pro_2 是一个存取器属性，打印中也展示这一特点

![Snipaste_2020-12-31_15-10-55.png](https://docassets.junlli.com/img/d0adc709f9ff948e25c751d6e734a022.png)

## 对象代理 proxy

proxy 用于创建一个对象代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

官方文档：[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

语法：
```js
const objProxy = new Proxy(target, handler)
```
target：要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
handler：一个对象，属性通常为函数，每个函数分别定义了在执行各种操作时代理对象的行为。

handler对象最常用的两个属性：
- get：获取对象中某个属性，参数如下
  - target：被代理的对象本身
  - prop：要获取的属性
- set：设置对象中某个属性，参数如下：
  - target：被代理的对象本身
  - prop：要设置的属性
  - value：赋的值

> 所有的可设置见官网：[一个完整的_traps_列表示例](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy#%E4%B8%80%E4%B8%AA%E5%AE%8C%E6%95%B4%E7%9A%84_traps_%E5%88%97%E8%A1%A8%E7%A4%BA%E4%BE%8B)

程序说明：
```js
let obj = {
  num: 1,
}
// 生成对象代理
let obj_proxy = new Proxy(obj, {
  get(target, prop) {
    console.log(target === obj) // true
    return target[prop] + '——来自proxy'
  },
  set(target, prop, value) {
    console.log(target === obj) // true
    target[prop] = value * 10
    return target[prop]
  }
})
// 打印查看一下值
console.log(obj.num) // 1
console.log(obj_proxy.num) // 1——来自proxy

obj.num = 2 // 直接修改对象

console.log(obj.num) // 2
console.log(obj_proxy.num) // 2——来自proxy

obj_proxy.num = 3 // 通过对象代理修改

console.log(obj.num) // 3
console.log(obj_proxy.num) // 3——来自proxy

delete obj.num // 删除属性

console.log(obj.num) // undefined
console.log(obj_proxy.num) // undefined——来自proxy
```

### 自己封装 proxy 代理深层对象

proxy 作用于整个对象，但只能配置对象的直接属性，不能深层代理，比如对象的某个属性本身是个对象，就无法再代理这个对象了，这是就需要在 get 方法中，对值做一个判断，如果是个对象，则需要再次生成一个 proxy 代理。

```js
// 用于存储所有的 proxy
const proxys = new Map()

let obj = getProxy({
  a: 10,
  d: {e: '我是e'}
})

obj.b = {c: 100}
obj.b.c = 200
console.log(obj.b.c)
console.log(obj.d.e)

function getProxy(obj) {
  // 如果有，直接返回
  if (proxys.has(obj)) {
    return proxys.get(obj)
  }
  let proxy = new Proxy(obj, {
    set(target, prop, value) {
      console.log('设置 ', prop)
      target[prop] = value
      return target[prop]
    },
    get(target, prop) {
      console.log('获取 ', prop)
      if (typeof(target[prop]) === 'object') {
        return getProxy(target[prop])
      }
      return target[prop]
    },
  })
  // 存入 proxys 中
  proxys.set(obj, proxy)
  return proxy
}

// 最终打印顺序:
// 设置  b - 正在执行 obj.b = {c: 100}，要设置 b，需要先获取一下b
// 获取  b - 正在执行 obj.b.c = 200，要获取 c，需要获取它的父对象 b
// 设置  c - 正在执行 obj.b.c = 200，设置 c
// 获取  b - 正在执行 console.log(obj.b.c)，要打印 c，需要先获取 b
// 获取  c - 正在执行 console.log(obj.b.c)，获取了 b，要再获取 c
// 200 - 正在执行 console.log(obj.b.c) 正常打印的 c 的值
// 获取  d 正在执行 console.log(obj.d.e)，要打印 e，需要先获取 d
// 获取  e 正在执行 console.log(obj.d.e)，正常打印的 e 的值
```

### 可撤销的代理对象 Proxy.revocable

Proxy.revocable() 方法可以用来创建一个可撤销的代理对象。

语法：
```js
const { proxy, revoke } = Proxy.revocable(target, handler);
```

- proxy：new Proxy(target, handler) 的返回值
- revoke：撤销的当前代理对象的方法，可以直接执行

一旦某个代理对象被撤销，它将变得几乎完全不可调用，在它身上执行任何的可代理操作都会抛出 TypeError 异常（注意，可代理操作一共有 14 种，执行这 14 种操作以外的操作不会抛出异常）。一旦被撤销，这个代理对象便不可能被直接恢复到原来的状态，同时和它关联的目标对象以及处理器对象都有可能被垃圾回收掉。再次调用撤销方法 revoke() 则不会有任何效果，但也不会报错。

# 文档片段范围 Range

@[toc]

Range 接口表示一个包含节点与文本节点的一部分的文档片段，这个文本片段可以是空的、纯文字、成对的 dom 节点。

Range 是一个范围，基于 Dom 节点的范围，如果修改了 Range 范围中的 Dom，Range 的范围也会自动调整，如果删除了 Range 内的所有 Dom，相当于 Range 的开始和结束位置相等了。

Range 和 [Selection](https://developer.mozilla.org/zh-CN/docs/Web/API/Selection) 配合使用效果更佳。

## 创建方法

- Document.createRange()：返回一个以全局（global） Document 作为起点与终点的 Range 对象
- new Range()：返回一个以全局（global） Document 作为起点与终点的 Range 对象

## 生成的 Range 对象的属性
一个 Range 对象有一下几个**只读**属性：
- collapsed：布尔值，此 Range 对象的起始位置和终止位置是否相同。
- commonAncestorContainer：返回完整包含 startContainer 和 endContainer 的、最深一级的节点。
- endContainer：返回包含 Range 终点的节点。
- endOffset：返回一个表示 Range 终点在 endContainer 中的位置的数字。
- startContainer：返回包含 Range 开始的节点。
- startOffset：返回一个表示 Range 起点在 startContainer 中的位置的数字。

## 生成的 Range 对象的方法

### 定位功能的方法

用于定位和调整 range 范围

#### 设置起点和偏移 Range.setStart()

设置 Range 的起点。

语法：range.setStart(startNode, startOffset)
- startNode：一个 dom 节点，表示 Range 的开始位置所根据的节点。
- startOffset：偏移量，必须为不小于 0 的整数，表示从 startNode.childNodes 内部的第几个节点的开始位置算起。

**注意**：如果 Range 开头和结尾并不是成对的 dom 节点，则会自动删掉多余的部分。

```html
<!DOCTYPE html>
<body>
  <div class="box">
    asdf1
    <div class="box_1">小盒子1</div>
    <div class="box_2">小盒子2</div>
    <div class="box_3">小盒子3</div>
    <div class="box_4">小盒子4</div>
  </div>
</body>
<script>
  let domBox = document.querySelector('.box')
  // 先打印一下 dom 看一下
  for (let i = 0; i < domBox.childNodes.length; i++) {
    let child = domBox.childNodes[i]
    // 文本节点, 打印文本内容
    if (child.nodeType === 3) console.log(i, child.data)
    // 元素节点，打印 dom 的 string
    else console.log(i, child.innerHTML)
  }

  console.log('------ 隔离线 ------')

  // 创建 Range
  let docuRange = document.createRange()
  docuRange.setStart(domBox, 0)
  docuRange.setEnd(domBox, 4)

  // 打印 Range 的内容，主要看一下 Range 包含的范围
  console.log(docuRange.cloneContents()) // 获取 range 的内容进行打印
</script>
```

打印结果如下，可见 setStart 是设置 startNode 这个节点的内部某一处作为起始的。

startOffset 是 childNodes 的索引值，指的是第几个子节点的开头位置。

![Snipaste_2021-01-08_18-56-02.png](https://docassets.junlli.com/img/23b7ed7f0238246221a87cac95e5b054.png)

#### 设置结尾和偏移 Range.setEnd()

设置 Range 的终点，类似设置起始位置的 Range.setStart

语法：range.setStart(startNode, startOffset)
- endNode：一个 dom 节点，表示 Range 的结束位置所根据的节点。
- endOffset：偏移量，必须为不小于 0 的整数，表示从 endNode.childNodes 内部的第几个节点的开始位置算起。


#### 基于节点之前设置起点 Range.setStartBefore()

以其它节点为基准，设置 Range 的起点。

语法：range.setStartBefore(referenceNode)
- referenceNode：一个 dom 节点，以这个 dom 的前面作为 range 的起始位置，包含了这个节点

#### 基于节点之后设置起点 Range.setStartAfter()

以其它节点为基准，设置 Range 的起点。

语法：range.setStartAfter(referenceNode);
- referenceNode：一个 dom 节点，以这个 dom 的结尾处，作为 range 的起始位置

#### 基于节点之前设置结尾 Range.setEndBefore()

以其它节点为基准，设置 Range 的终点。

语法：range.setEndBefore(referenceNode)
- referenceNode：一个 dom 节点，以这个 dom 的前面作为 range 的结束位置

#### 基于节点之后设置结尾 Range.setEndAfter()

以其它节点为基准，设置 Range 的终点。

语法：range.setEndAfter(referenceNode)
- referenceNode：一个 dom 节点，以这个 dom 的结尾处，作为 range 的结束位置，包含了这个节点

#### 选中节点作为范围 Range.selectNode()

使 Range 直接选中某个节点作为 Range 的范围。

语法：range.selectNode(referenceNode)
- referenceNode：一个 dom 节点，以这个 dom 作为 Range 的范围。

#### 选中节点的内容作为范围 Range.selectNodeContents()

使 Range 直接选中某个节点的内容，作为 Range 的范围。

语法：range.selectNode(referenceNode)
- referenceNode：一个 dom 节点，以这个 dom 的内容作为 Range 的范围，不包含这个节点。

#### 压缩折叠 Range.collapse()

将 Range 折叠至其端点（boundary points，起止点，指起点或终点，下同）之一。

通俗来说，就是清空 Range，但 Range 表示一个范围，即使是空的，也只是表示他的开始和结束是同一个位置。

而开始和结束是同一位置，这个位置就是由参数 toStart 决定的。

折叠后的 Range 的 collapsed 属性为 true，表示起始位置和终止位置是相同的。

语法：range.collapse(toStart)
- toStart：可选，boolean 值，默认 false，表示是否折叠到 start 处(即使把结束位置移动到开始处)，false 折叠到 end 节点。

### 编辑功能的方法

可以从 Range 中获得节点，改变 Range 的内容。

#### 复制得到内部文档片段 Range.cloneContents()

返回一个包含 Range 中所有节点的[文档片段](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment)。

这个文档片段是对文档 Dom 的拷贝，获取后，再修改 Range 范围和文档 Dom，不会影响该文档片段。

使用DOM事件添加的事件侦听器在提取期间不会保留。

HTML属性事件将按Node.cloneNode()方法的原样保留或复制。

HTML id属性也会被克隆，如果提取了部分选定的节点并将其附加到文档中，则可能导致无效的文档。

```js
let range = document.createRange();
range.selectNode(document.getElementsByTagName("div"));
let documentFragment = range.cloneContents();
document.body.appendChild(documentFragment);
```

#### 删除内部文档节点 Range.deleteContents()

从文档中移除 Range 包含的内容，删除 Range 范围中的所有 Dom，Range 的范围也自动调整了。

语法：range.deleteContents()

#### 剪切得到文档片段 Range.extractContents()

把 Range 的内容从文档树移动到一个文档片段中。

功能类似于前面的 Range.cloneContents()，但 cloneContents 是返回拷贝的文档片段，而这个是移动。

且因为是移动，页面文档中的 Dom 也就因为移走而消失了，Range 的范围也会自动更新，效果类似于 Range.deleteContents()。

所以整体来看：Range.extractContents() === Range.cloneContents() + Range.deleteContents()

语法：documentFragment = range.extractContents();

#### 在起点处插入一个文档节点 Range.insertNode()

在 Range 的起点处插入一个 Dom 节点。

新节点是插入在 Range 开始位置之后，也就是范围内所有节点之前。

如果新节点是一个文档片段，则插入文档片段的子节点(就是文档片段内部的 Dom 节点)。

语法：range.insertNode(newNode);
- newNode：Dom 节点

#### 插入到新节点并选中新节点 Range.surroundContents()

将 Range 的内容移动到一个新的节点中，并将新节点放到这个范围的起始处。

这个方法与 newNode.appendChild(range.extractContents()) + range.insertNode(newNode) 等价。

应用以后，newNode 包含在 range 的边界点中。

然而，如果 Range 断开了一个非 Text 节点，只包含了节点的其中一个边界点，就会抛出异常。

也就是说，不像上述的等价方法，如果节点仅有一部分被选中，则不会被克隆，整个操作会失败。

语法：range.surroundContents(newParent);
newParent：一个包含内容的 Dom 节点。

### 其他方法

#### 比较两个 range 的端点 Range.compareBoundaryPoints()

比较两个 Range 的端点。

语法：compare = range.compareBoundaryPoints(how, sourceRange);
- compare：一个数字，-1，0 或 1，指示的相应的边界点是否Range是分别之前，等于，或之后的相应的边界点sourceRange。
- how：描述比较方法的常量，可选值：
  - Range.END_TO_END：将 sourceRange 的结束边界点与的结束边界点进行比较 Range。
  - Range.END_TO_START：将 sourceRange 的结束边界点与的开始边界点进行比较 Range。
  - Range.START_TO_END：比较 sourceRange 的开始边界点和的结束边界点 Range。
  - Range.START_TO_START：将 sourceRange 的起始边界点与的起始边界点进行比较 Range。
  - 如果参数值无效，则抛出 DOMException 带有 NotSupportedError 代码的。
- sourceRange：ARange比较边界点和范围。


#### 克隆得到一个新的 Range.cloneRange()

克隆一个 Range， 克隆的对象是复制过来的，而非引用，所以这两个对象双方各自做出的改变，都不会影响另一方。

语法：clone = range.cloneRange()
- clone：克隆的 Range 对象。

#### 释放 Range.detach()

不执行任何操作，只将 Range 从使用状态中释放，改善性能，它用于禁用 Range对象并允许浏览器释放关联的资源，该方法已保留用于兼容性。

语法：range.detach();


#### 得到范围中的文字内容 Range.toString()

把 Range 中的 Dom 节点中的文字内容返回(包括换行和空格等)。

语法：text = range.toString();
