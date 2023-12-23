const bucket = new WeakMap();

// 用一个全局变量存储被注册的副作用函数
let activeEffect;
const effectStack = [];

// effect函数用户注册副作用函数
// function effect(fn) {
//   activeEffect = fn; // 给个名字
//   fn(); //  执行副作用函数，就是上一节的effect()
// }

function effect(fn) {
  // 副作用函数
  const effectFn = () => {
    cleanup(effectFn); // 清除上一次的副作用函数
    activeEffect = effectFn; // 把自己给全局变量
    effectStack.push(effectFn); // 把副作用函数推入栈
    fn();
    effectStack.pop(); // 把栈顶的副作用函数弹出
    activeEffect = effectStack[effectStack.length - 1];
  };

  // 还要收集所有与该副作用函数相关的依赖集合
  effectFn.deps = [];

  // 最后还是要执行副作用函数
  effectFn();
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn); // 从依赖集合中删除掉effectF
  }
  effectFn.deps.length = 0;
}

// 这样我们给一个匿名函数也可以支持里;
// effect(() => (document.body.innerText = "xxx"));

// 原始数据
const data = {
  foo: true,
  bar: true,
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
  activeEffect.deps.push(deps); // 这个副作用函数存在关联的依赖集合
  return target[key];
}

// 用于set中，拦截去获取字段对应的副作用函数
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  // effects && effects.forEach((fn) => fn());
  const effectsToRun = new Set(effects);
  effectsToRun.forEach((effect) => effect());
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

let temp1, temp2;

effect(function effectFn1() {
  console.log("effectFn1 run");
  effect(function effectFn2() {
    console.log("effectFn2 run");
    temp2 = obj.bar;
  });
  temp1 = obj.foo;
});
