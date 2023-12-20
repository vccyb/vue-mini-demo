// vue声明式描述ui有两种方式，一种是模板、一种是js对象

// 模版就是
//  <div @click="xxx" :id></div>

// js对象描述
const title = {
  // 标签名称
  tag: "h1",
  // 标签属性
  props: {
    onClick: handler,
  },
  // 子节点
  children: [{ tag: "span" }],
};

// 对应到模板的代码是
{
  /* <h1 @click="handler"><span><span/></h1> */
}

// 使用js描述，就是我们说的虚拟dom

// h函数的调用，返回的是虚拟dom，h函数的作用就是为了简化我们写虚拟dom

// 渲染函数：一个组件要渲染的内容就是由一个渲染函数来描述的，也就是写的render，vue.js会根据渲染函数
// 返回的虚拟dom拿到虚拟dom
