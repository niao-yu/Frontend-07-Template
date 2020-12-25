# 学习笔记

## 字典树

### 适用场景：

给定多个字符串，作为**字符串集合**，判断这个字符串中，有多少个字符串是**完全重复**的，拿到重复最多的那个字符串，并获得这个字符串重复的次数。

### 字典树原理：

字典树会声明一个**记录对象：root**，把传进来的字符串拆分成单个字母，一个个记录到root中：

- 传入 'abc'，最终的root结构如下所示
```js
var root = {
  a: {
    b: {
      c: {
        repeatNum: 1,
      }
    }
  }
}
```
- 再传入 'abd'，root结构变为如下所示
```js
var root = {
  a: {
    b: {
      c: {
        repeatNum: 1,
      },
      d: {
        repeatNum: 1,
      },
    }
  }
}
```
- 再分别传入 'abc'、'ab'、'ac'、he'，root最终变为如下结构：
```js
var root = {
  a: {
    b: {
      repeatNum: 1,
      c: {
        repeatNum: 2, // 注意这里加1了
      },
      d: {
        repeatNum: 1,
      }
    },
    c: {
      repeatNum: 1,
    }
  },
  h: {
    e: {
      repeatNum: 1,
    },
  }
}
```

可见，root的会把每个字符串，拆分成单个字母，字母作为key添加到root中，如果某个字符是一个完整字符串的结尾，则这个字符中的`repeatNum`字段加1，`repeatNum`最终也就是这个字符串重复的次数。

root就是这些字符串的集合的字典树，字典树对象，就是维护root这个内部属性，并提供**插入字符串**和**读取重复最多字符**的方法。

具体代码实现见文件「字典树.html」。

## KMP算法

### 适用场景：

给定一个长字符串，再给定短字符串，判断这个长字符串是否包含短字符串。

当短字符串自己内部有小循环时，性能优化程度更大(比如`ababc`、`abcab`等等)。

### KMP算法原理：

暴力解的话，时间复杂度为O(mn)，m和n分别为长字符串和短字符串的字符数。

但实际上，短字符串本身，可能会局部重复自身，比如：
- 长字符串：`abababc`
- 短字符串：`ababc`

可以发现，按照暴力解法，会遍历长字符串，依次从每个字符开始，对比后面几位是否和段字符串完全一致。

```js
let result = judge('abababc', 'ababc')
console.log(result)

// 判断方法
function judge(longStr, shortStr) {
  // 双层遍历, 一次对比
  for (let i = 0; i < longStr.length; i++) {
    for (let j = 0; j < shortStr.length; j++) {
      // 判断是否匹配相等
      if (longStr[i + j] === shortStr[j]) { // 相等,进一步判断
        if (j === shortStr.length - 1) { // 是否是 shortStr 的最后一个字符,也就是全相等了
          return true
        } else continue
      } else break // 不相等, 跳出当前循环
    }
  }
  return false
}
```

可以发现，两个字符串的前4个字符是全等的，但第5个字符不等，按照逻辑，内部for循环跳出，外部for循环的i加1，再开始依次对比，所以时间复杂度是O(mn)

### KMP算法的思路，分为两步：

1. 解析整理短字符串

    先处理短字符串，找出其内部的小循环，比如`ababc`中，两个`ab`就形成了循环。

    声明一个数组table，长度为短字符串的长度，然后遍历短字符串，给table对应位置设置上数字：

    ```js
    // ababc
    // 00012
    let table = [0, 0, 0, 1, 2]
    ```

    概括说明：table中，索引值为`index`的数字`number`，表示的是，短字符串的索引为`index`的字符，预计和它本身的索引值为`number`的那个字母是重复的。

    详细举例说明：
    - `table`的索引值为 `0` 的一项的值为 `0` ：短字符串索引值为 `0` 的字母为 `a` ，预计和索引值为 `0` 的字母 `a` 相同
    - `table`的索引值为 `1` 的一项的值为 `0` ：短字符串索引值为 `1` 的字母为 `b` ，预计和索引值为 `0` 的字母 `a` 相同
    - `table`的索引值为 `2` 的一项的值为 `0` ：短字符串索引值为 `2` 的字母为 `a` ，预计和索引值为 `0` 的字母 `a` 相同
    - `table`的索引值为 `3` 的一项的值为 `1` ：短字符串索引值为 `3` 的字母为 `b` ，预计和索引值为 `1` 的字母 `b` 相同
    - `table`的索引值为 `4` 的一项的值为 `2` ：短字符串索引值为 `4` 的字母为 `c` ，预计和索引值为 `2` 的字母 `a` 相同

2. 遍历长字符串对比时，对算法进行调整
    
    之前遍历长字符串对比的思路是：从长字符串的每一项开始，往后依次和短字符串进行全等比较(可查看上面的暴力解的代码示例)

    现在的思路需要调整：
    - 长字符串从 `i = 0` 开始，短字符串从 `j = 0` 开始，结束条件是长字符串被遍历完
    - 依次对比 `长字符串[i]` 和 `短字符串[j]`
    - 如果相等，就 `++i` 和 `++j`，循环再次判断，直到把短字符串遍历完，则说明有全重复的了，可以记录下来 `i` 的值，再把 `j = 0`，再继续循环
    - 如果不相等，则判断 `j` 是否等于 `0`
      - 若 `j === 0`，则 `++i`，继续循环
      - 若 `j !== 0`，则设置 `j = table[j]`（**关键**），并继续循环

    这里整体完成后，能拿到若干个开始重复的索引值，这样的索引值有几个，就说明有几个循环。

    这里对上面的**关键**进行说明，不一定能明白，最好是打开代码，用脑编译，跟着流程一步步走一走：

    当 `j === 0`，说明当前对比就是**短字符串的第 1 个字符**，第一个字符就不一样，那就可以 `++i`，继续下一次循环了

    当 `j !== 0`，说明当前对比的是**短字符串中间的某个字符**，而短字符串**有可能**是内部循环的，是否循环我们已经有记录了，就在 `table` 中，`table[j]` 就是记录当前这个字符，和前面的索引值为几的字符是重复的。

    虽然是**预计重复**，但不一定真重复，所以 `j = table[j]` 后，`i` 的值不变就再去循环判断

    只要 `table[j] !== 0`，就说明当前字符，是处在一个**短字符串的内部循环**中的。

    既然 `j` 能走到这个值，说明短字符串的前面几位，和长字符串最近几位是全等的，那说明长字符串的这部分，也是和短字符串一样是内部循环的。

    如下所示，长字符串和短字符串的前 4 位相同，但第 5 位的红字 `a` 和 `c ` 不相同(github不支持行内样式，看不到颜色)：

    长字符串：<span style="color:#0a0">abab</span><span style="color:#f00">a</span>bc

    短字符串：<span style="color:#0a0">abab</span><span style="color:#f00">c</span>

    > `table` 的值为：`[0, 0, 0, 1, 2]`

    此时 `i === j === 4` ，设置 `j = table[j]`，则 `j === table[4] === 2`，在按照逻辑去循环(此时 `i === 4, j === 2`)，对比变成了如下所示

    长字符串：ab<span style="color:#0a0">ab</span><span style="color:#f00">a</span>bc

    短字符串：<span style="color:#0a0">ab</span><span style="color:#f00">a</span>bc

    此时长字符串的第 5 位，和短字符串的第 3 位的红色的字符都为 `a`，预计的相等真的相等了，可以把 `a` 标绿，从长字符穿的第三位开始、短字符串的第一位开始，继续对比了。

    当然，如果此时红字处的双方仍然不等，按照上面的逻辑，需要设置 `j = table[j]`，也就是 `j === table[2] === 0`，相当于把 `j` 归零了，也就是重头开始对比短字符串，逻辑也是正确的。
    
    
## Wildcard字符串分析算法


### 适用场景

给定一个长字符串，再给定包含`*`和`?`的正则短字符串，判断这个长字符串是否包含正则短字符串。

### 算法原理

和KMP算法类似，但需要先把短字符串以 * 为分隔，分成几段。

比如 短字符串：`ab*cd*cd`，那么只要长字符串的开头两位为 ab，最后两位为ef，中间那部分包含一个cd，就是符合的，比如一下这几个长字符串都是符合的：

`abcdcd`、`ab0000cdcd`、`ab0000cd0000cd`

但要注意，长字符串 `abcd` 是不符合的。

最后就是 `?` 的处理，这个比较简单，因为它表示的是有一位任意的字母，哪怕是空格也符合，在对比时多一个判断即可。

### 代码实现

```js
/**
 * Wildcard字符串分析算法
 * 传入长和短字符串, 返回长字符串是否符合短字符串定义的格式
 * 短字符串中可能包含 * 和 ?
 * @param {String} longStr 
 * @param {String} shortStr 
 */
function Wildcard(longStr, shortStr) {
  let startCount = 0 // * 的个数

  for (let i = 0; i < shortStr.length; i++) {
    if (shortStr[i] === '*') startCount++
  }

  // 没有 *, longStr, shortStr 需要是全等(注意里面有?匹配符)
  if (!startCount) {
    // 长度不同
    if (shortStr.length !== longStr.length) {
      return false
    }
    for (let i = 0; i < shortStr.length; i++) {
      if (longStr[i] !== shortStr[i] && shortStr[i] !== '?') {
        return false
      }
    }
    return true
  } else { // 包含 * , 开始遍历处理

    let i = 0 // 取的 shortStr 的索引值
    let lastIndex = i // 正则的 exec 的 lastIndex, 后面会用

    // 判断第一个 * 之前的字符
    {
      for (; shortStr[i] !== '*'; i++) {
        if (longStr[i] !== shortStr[i] && shortStr[i] !== '?') {
          return false
        }
      }
      lastIndex = i // 更新一下, 让后面校验 longStr 时, 从 i 这个索引开启(i之前的部分,都是第一个星号之前的,已经匹配完了)
    }

    { // 判断中间部分的匹配
      for (let p = 0; p < startCount - 1; p++) {
        ++i // 注意, 经历了上面和上一个循环的步骤 shortStr[i] === '*', 所以 i 需要先加1

        let subshortStr = '' // shortStr 中, 被 * 分隔的字符串片段
        // shortStr 的当前这一项不是 *, 拼接取来, 用来下面的匹配查找
        while (shortStr[i] !== '*' && i < shortStr.length) {
          subshortStr += shortStr[i]
          i++
        }

        let Reg = new RegExp(subshortStr.replace(/\?/g, '[\\s\\S]'), 'g')

        Reg.lastIndex = lastIndex
        // 没有匹配上
        if (!Reg.exec(longStr)) {
          return false
        }

        // 这个片段匹配上了, 更新一下 lastIndex, 给下一个循环备用
        lastIndex = Reg.lastIndex
      }

      { // 判断最后一个 * 后面的字符, 必须全字符匹配

        ++i // 注意, 经历了上面和上一个循环的步骤 shortStr[i] === '*', 所以 i 需要先加1
        // 最后一个 * 后面还有东西
        if (i < shortStr.length) {

          for (let j = 1; shortStr[shortStr.length - j] !== '*'; j++) {
            let longStrIndex = longStr.length - j
            if (longStrIndex < lastIndex) {
              // 和上面已经比过的字符重叠了
              return false
            }
            if (longStr[longStr.length - j] !== shortStr[shortStr.length - j] && shortStr[shortStr.length - j] !== '?') {
              return false
            }
          }
        }
      }
      // 判断完成, 能走到这儿, 匹配通过
      return true
    }
  }
}

console.log(Wildcard('sfsff', 'sf?f'))
```


