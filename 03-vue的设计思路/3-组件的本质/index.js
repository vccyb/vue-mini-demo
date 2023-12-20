const MyComponent = function () {
  return {
    tag: "div",
    props: {
      onClick: () => alert("hello"),
    },
    children: "click me",
  };
};

const vnode = {
  tag: MyComponent,
};

// renderer就要支持组件的渲染

function renderer(vnode, container) {
  if (typeof vnode.tag === "string") {
    // 说明vnode 描述的是标签元素
    mountElement(vnode, container);
  } else if (typeof vnode.tag === "function") {
    // 说明 vnode 描述的是组件
    mountComponent(vnode, container);
  }
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.tag);

  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(key.slice(2).toLocaleLowerCase(), vnode.props[key]);
    }
  }

  if (typeof vnode.children === "string") {
    el.appendChild(document.createTextNode(vnode.children));
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => renderer(child, el));
  }

  container.appendChild(el);
}

function mountComponent(vnode, container) {
  const subtree = vnode.tag(); // 调用组件函数得到子树
  renderer(subtree, container);
}
