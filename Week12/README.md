# 学习笔记

## css 属性分类

叫当前目录下文件：css 属性分类.xmind

参考于[https://www.cnblogs.com/jeff2020/p/13903539.html](https://www.cnblogs.com/jeff2020/p/13903539.html)

## css 盒模型

FC 的含义，就是Fomatting Context，它是 CSS2.1 规范中的一个概念，它是页面中的一块渲染区域，而且有一套渲染规则，它决定了其子元素将怎样定位，FC 会根据布局自动形成，包括以下两个常见的 FC：
- IFC（Inline Formatting Context）：行内格式化上下文，内部元素横向排列
- BFC（Block Formatting Context）：块级格式化上下文，内部元素纵向排列

IFC 包含：
- text 文本
- inline-box 行内盒

BFC 包含：
- line-box
- block-level-box

- Block Container：内部有 BFC 的，属于它的盒子类型有：
  - block
  - inline-block
  - table-cell
  - flex item
  - grid cell
  - table-caption
- Block-level Box：外面有 BFC 的。
  - block
  - flex
  - table
  - grid
- Block Box = Block Container + Block-level Box：内外都有 BFC 的。

> 一个特殊的 display: run-in; 跟随父级，几乎无人用过。