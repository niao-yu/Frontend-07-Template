# 学习笔记

本周主要收获有两点：
- 数据结构之「二叉堆」
- 时间复杂度

## 数据结构之「二叉堆」

本周课程实现的寻路算法，核心内容之一仍然是递归，最大的收获是开启了「数据结构」的认识。

本来我以为，数据结构是后台语言才会涉及到的，前端没有数据结构(原先也以为没有算法)，或者说心底里知道是有的，但认为其太复杂且平时用不到，导致自己没有深入探索过，而且还刻意的忽略了它。

这次老师用更优的数据结构，优化了寻路算法中最优点选择，让我认识到，塌下心来学习学习数据结构，不说达到很高的水平，只是简单的了解下并用在项目中，还是很容易办到且对项目帮助很大的。

工作日时大概总结了下，周五晚上才真正好好学习，下面是大概的一些总结，会形成文档自己整理下来，周六因为补觉和陪媳妇出去玩儿，没有补充，周日或者下周会整理好，到时候应该不会写在这儿，而是写在自己的文档记录里了。

- 二叉树(Binary tree)
- 满二叉树(Full Binary tree)：除最后一层无任何子节点外，每一层上的所有结点都有两个子结点的二叉树
- 完全二叉树(Complete Binary Tree)：子节点从上往下、从左往右依次排列，中间没有跳过的项

> 满二叉树肯定是完全二叉树，满二叉树是完全二叉树的特例

- 二叉搜索树/二叉查找树/二叉排序树(Binary Search Tree)(BST)：每一个节点，它如果有子节点，那么它左侧的所有子节点的值都比他小，右侧的所有子节点的值都比它大。

- 平衡树(Balance Tree)(BT)：根节点左侧的层数F_L和右侧的层数F_R，(F_L - F_R)的绝对值小于等于1，也就是左侧和右侧的层级相差最多差一层。
  - 不平衡的二叉树想平衡，需要调整结构，整体的结构变化，需要控制数左旋或右旋，左边层数少就往左旋，右边层数少就往右旋，旋的层级就看两边相差几层。
  - 有时遇到复杂一些的不平衡树，可能需要先左旋再右旋，或者先右旋再左旋。


## 时间复杂度

时间复杂度是我本周做算法题的时候，在查看题解时被一次次的被提及，而且算法群的同学也是不是讨论，让我也不得不再正视起来。

和上面的数据结构类似，我也知道时间复杂度的存在，而且最初入行的时候还学过，但总也不用，慢慢就放下了。

最近我在自己写文档，它又再次翻红，我就整理了一篇文档。

文档中对时间复杂的叙述还很浅，也只算是记录一下，日后如果忘了，再看一遍能让我更快的回忆起来。

下面是我的文档中的内容：

---

最近在做算法题，发现时间复杂度对算法的影响，意识到这一课不能再拖了，得补上。

- 每个方法都有自己的时间复杂度，但只有这个方法的参数，参与了方法内的循环时，它的时间复杂度才有意义。
- 没有入参或者入参没有参加方法内的循环时，这个方法时间复杂度固定为1，表示入参不会影响这个方法执行的时间
- 时间复杂度是个式子，是一个用入参n表示的式子
- 时间复杂度表示的是，当入参n变化，这个方法内部变化的趋势，比如式子`n`和`n^2`，前者随着n变大，花费的时间等比增加，后者则是随着n增大，花费时间以更陡峭的趋势增加。
- O(1) < O(logn) < O(n) < O(nlogn) < O(n^2) < O(n^3) < O(2^n) < O(n!) < O(n^n)
- 时间复杂度只是表示方法内部复杂程度随入参n的变化趋势，不代表方法的优劣，比如n的比较小时，O(n^n)可能比O(1)更节省资源，这需要看方法内部的处理。

方法的时间复杂度是个式子，数学上叫做函数，用T(n)表示，n就是这个方法参数，就好比这个简单的数学公式：`f(x) = 2x + 1`，在这里f就是T，x就是n。

f的表达式是`2x + 1`，时间复杂度的求解，就是分析js方法体，得出T的表达式了。

T的表达式，一般写作`T(n) = O(「式子」)`（大O表示法），关键就是里面的「式子」，下面就来说明这个式子如何得出了。


## 推导

### 常数级

分析下面这个方法：

```js
function temp(n) {
  let a = n // 执行1次
  let b = 2 * n // 执行1次
}
```

这个方法的时间复杂度为O(1)。

里面一共两条语句，而且没有循环、递归等等，只是简单的两条语句，所以这个方法的虽然传入了n，但代码执行次数固定为常数`2`，和n无关，所以时间复杂度为O(2)，但时间复杂度表示的是一个趋势，2是一个固定的常量，表达不了趋势，所以这里统一写成1，也就是O(1)。


### 线性级

分析下面这个方法：

```js
function temp(n) {
  let a = n // 执行1次
  let b = 2 * n // 执行1次
  for (let i = 0; i < n; i++) {
	  a = a * a // 执行n次
	  b = b * b // 执行n次
  }
}
```

这个方法的时间复杂度为O(n)。

正常理解，这个式子应为`1 + 1 + n + n` => `2 + 2n`，但仍然是那句话，时间复杂度表示的是一个趋势，常数是没有意义的，所以`2 + 2n`可以简写为`2n`。

但其实，2n还是3n还是100n，对趋势并没有影响，他都是线性函数，随着入参n的变化，这个方法的复杂度还是等比变化的，所以2n可以进一步简写成n，最后就是O(n)。


### 指数级

分析下面这个方法：

```js
function temp(n) {
  let a = n // 执行1次
  let b = 2 * n // 执行1次
  for (let i = 0; i < n; i++) {
	  a = a * a // 执行n次
	  b = b * b // 执行n次
	  for (let j = 0; j < n; i++) {
		  a = a * a // 执行n * n次
		  b = b * b // 执行n * n次
	  }
  }
}
```

这个方法的时间复杂度为O(n^2)。

正常理解，这个式子应为`1 + 1 + n + n + n * n + n * n` => `2 + 2n + 2n^2` => `n + n^2`，但其实和n^2相比，n存在的意义几乎可以忽略，n^2才控制了主要的趋势的走势，n实在是可有可无，所以这里可以简写为n^2，用大O表示法就是O(n^2)

### 对数级

分析下面这个方法：

```js
function temp(n) {
  for (let i = 0; i < n; i = i * 2) {
	  a = a * a // 执行了x次（以2为底，n的对数，比如n = 2, 则 x = 1; n = 4, 则 x = 2, x = 8, 则 x = 3）
  }
}
```

这个方法的时间复杂度为O(logn)。

注意这个方法中的for循环，里面i的递增并不是加1，而是乘2，x是以2为底n的对数，也就是说，2的x次方等于n。

而且，i的递增无论是乘几，哪怕是3、4...100，时间复杂度都写做O(logn)，这里的底，其实就类似于2n中的2，可以忽略掉。


## 总结

时间复杂度除了上述几种类型，还有很多其他类别，优劣排序为：
```
O(1) < O(logn) < O(n) < O(nlogn) < O(n^2) < O(n^3) < O(2^n) < O(n!) < O(n^n)
```

虽然一个方法有时间复杂度，但并不是说时间复杂度低的就一定好，当n比较小时，O(n^n)可能比O(1)更节省资源，这都需要看函数内部具体的指令了。