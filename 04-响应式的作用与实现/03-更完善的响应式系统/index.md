一个响应式的工作流程

1. 读取操作的时候，收集依赖，将副作用函数收集到桶里
2. 当设置操作发生的时候，从桶里获取副作用函数并执行

3. 优化点 1
   注册的副作用函数的机制

这里我们其实就是优化了可以使用匿名函数这种副作用函数

同时最后的测试我们也发现了 bug

```
setTimeout(() => {
  obj.notExist = "测试响应式系统2222";
  console.log("obj.notExist run");
}, 3000);
```

按道理，我们这个字段 obj.notExist 没有和副作用进行响应式相关的绑定呀，
但是依旧会打印出 obj.notExist run
并且在打印一次 console.log("effect run");

这是因为啥？

因为我们在 set，触发了拦截，拿出桶的副作用函数又执行了一次，就这么简单

所以我们就要有话，
需要建立联系，不是副作用函数 - 所有字段的 get-set

副作用函数 与目标字段建立联系

4. 优化点 2

首先思考结构

- target
- key
- effect

target - key map
key - effect set

ok 搞定了核心的优化后，我们发现，此时 只会执行两次的 console.log("effect run");
因为此时副作用函数已经关联上字段了，并非桶中所有的副作用函数都全部执行一遍

```ts
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    if (!activeEffect) {
      return target[key]; // 不需要收集
    }
    // 根据target从桶里面获取对应的map，这个map存的 key:key value:set的一个结构
    let depsMap = bucket.get(target);
    if (!depsMap) {
      // 如果没有，要给这个targe新建立一个
      depsMap = new Map();
      bucket.set(target, depsMap);
    }
    let deps = depsMap.get(key);
    if (!deps) {
      deps = new Set();
      depsMap.set(key, deps);
    }
    // 最后我们在这个set里面添加副作用函数
    deps.add(activeEffect);
    return target[key];
  },
  set(target, key, value) {
    // 拦截设置操作
    target[key] = value;
    // 取出桶的副作用函数并且执行
    const depsMap = bucket.get(target);
    if (!depsMap) return;
    const deps = depsMap.get(key);
    deps && deps.forEach((fn) => fn());

    return true;
  },
});
```

优化点 3
把 收集依赖，触发依赖封装为两个函数
track
trigger
也是一样的
