# 副作用函数如果我们写了分支的形式

```ts
effect(function effectFn() {
  document.body.innerText = obj.ok ? obj.text : "not";
});
```

理想：我们希望 obj.ok 如果赋值为 false 后，之后的 obj.text 改动应该不会在进行重新从桶里拿出副作用函数，并且执行这样的逻辑

但是现状是

```
effect run  // 第一次手动注册副作用函数
effect run  // 设置obj.ok = false
set obj.ok = false
obj.ok = false and obj.text = 'changed'
effect run  // 此时obj.ok = false, 但是依旧还是执行了副作用函数
```

我们来看下桶的存储的副作用函数

```
bucket.get(data)

获取的是一个Map，map key 是字段，value是副作用函数

可以看到，我们把ok，text字段，都注册了对应的副作用函数
这个是合理的，一开始我们执行注册副作用函数的时候，拦截对象的读取操作，
此时就回去给对应每个字段收集副作用函数了
```

所以你设置 obj.ok = false, set 存储的副作用函数没有变，所以有问题

问题就是，obj.ok = false, 在设置 obj.text = 'xxxx', 依旧重新执行了副作用函数，而不是按照代码的想要的不改变

## 解决方案

每次副作用函数执行的时候，我们可以先把它从所有关联的依赖集合先删除掉

啥意思，执行副作用函数的时候，就是把 set 里面的依赖全部删掉，没有必要
副作用函数执行完毕后，会建立新的联系

obj.ok = false; => 会重新执行副作用函数，但是需要把之前 ok 对应的依赖删掉

就需要知道，副作用函数，在哪些依赖集合中使用到了

1. 关键代码

```ts
function effect(fn) {
  // 副作用函数
  const effectFn = () => {
    activeEffect = effectFn; // 把自己给全局变量
    fn();
  };

  // 还要收集所有与该副作用函数相关的依赖集合
  effectFn.deps = [];

  // 最后还是要执行副作用函数
  effectFn();
}

// track
activeEffect.deps.push(deps); // 这个副作用函数存在关联的依赖集合
```

做完这一步，我们就关联上了副作用函数和与他相关的依赖集合

2. 有了这个我们就按照上面的思路，每次副作用函数去执行的时候，先删掉这个副作用函数对应的依赖集

```ts
clean;
```

3. 但是有个问题，无限循环
   trigger 中，遍历了 effects 集合，里面存储了副作用函数 set，
   当副作用函数执行的时候，我们调用 cleanup，cleanup 就是从 effects 集合中将当前的副作用函数剔除掉。但是副作用函数的执行会导致其又被收集到依赖中

此时控制台再试试， obj.txt = xxx
发现已经不会在触发副作用函数
