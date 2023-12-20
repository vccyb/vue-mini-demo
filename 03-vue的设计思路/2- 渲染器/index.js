const vnode = {
  tag: "div",
  props: {
    onClick: () => alert("hello"),
  },
  children: "click me",
};

// 编写一个渲染器

function renderer(vnode, container) {
  // 使用vnode.tag作为标签的名创建dom节点
  const el = document.createElement(vnode.tag);
  // 便利props,添加到dom上
  for (let key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(key.substr(2).toLocaleLowerCase(), vnode.props[key]);
    }
  }

  // 处理children
  if (typeof vnode.children === "string") {
    el.appendChild(document.createTextNode(vnode.children));
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => render(child, el));
  }
  container.appendChild(el);
}

renderer(vnode, document.body);
