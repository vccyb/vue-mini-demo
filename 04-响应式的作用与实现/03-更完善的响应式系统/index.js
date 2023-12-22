const bucket = new WeakMap();

// 用一个全局变量存储被注册的副作用函数
let activeEffect;

// effect函数用户注册副作用函数
function effect(fn) {
  activeEffect = fn; // 给个名字
  fn(); //  执行副作用函数，就是上一节的effect()
}

// 这样我们给一个匿名函数也可以支持里;
// effect(() => (document.body.innerText = "xxx"));

// 原始数据
const data = {
  text: "Hello, world!",
};

// 再看代理

// const obj = new Proxy(data, {
//   get(target, key) {
//     // 拦截获取
//     // 如果activeEffect有值，表示我们要注册副作用函数,要收集
//     if (activeEffect) {
//       bucket.add(activeEffect);
//     }
//     return target[key];
//   },
//   set(target, key, value) {
//     // 拦截操作
//     target[key] = value;
//     bucket.forEach((fn) => fn());
//     return true;
//   },
// });

// get中拦截。调用，用于收集副作用函数
function track(target, key) {
  if (!activeEffect) return target[key];
  let depsMap = bucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  // 最关键的一步
  deps.add(activeEffect);
  return target[key];
}

// 用于set中，拦截去获取字段对应的副作用函数
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  effects && effects.forEach((fn) => fn());
}

// 优化后的proxy
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, value) {
    // 拦截设置操作
    target[key] = value;
    trigger(target, key);
    return true;
  },
});

// 来试试我们改造的effect，试试匿名函数
effect(() => {
  console.log("effect run");
  document.body.innerText = obj.text;
});

setTimeout(() => {
  obj.text = "测试响应式系统2222";
}, 1000);

setTimeout(() => {
  obj.notExist = "测试响应式系统3333";
  console.log("obj.notExist run");
}, 3000);
