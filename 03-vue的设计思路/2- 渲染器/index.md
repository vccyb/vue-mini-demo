渲染函数可以拿到虚拟 dom

那么虚拟 dom 如何变成真实的 dom 呢？依赖到一个东西：渲染器

可以看一个渲染器的例子

我们写了一个最简单的渲染器

但是渲染器的精髓在于，当我们接受到的虚拟 dom，也就是 vnode 对象改变的时候，能够值更新变更的内容
。
而不是走一遍完整的创建元素的流程
