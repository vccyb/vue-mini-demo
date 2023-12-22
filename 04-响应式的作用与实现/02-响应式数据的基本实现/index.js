// 存储副作用函数的桶
const bucket = new Set();

// 原始数据
const data = {
  text: "Hello, world!",
};

// 对原始数据进行代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 收集到桶里面
    bucket.add(effect);
    // 返回值
    return target[key];
  },

  set(target, key, newVal) {
    // 设置值
    target[key] = newVal;
    // 拦截读取操作
    bucket.forEach((fn) => fn());
    // 返回true表示设置成功
    return true;
  },
});

// 副作用函数
function effect() {
  document.body.innerText = obj.text;
}

setTimeout(() => {
  obj.text = "触发响应式变化";
}, 1000);

effect();
