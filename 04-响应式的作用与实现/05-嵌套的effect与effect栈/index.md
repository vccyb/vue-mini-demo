1. effect 是可以嵌套的

```ts
effect(function effectFn1() {
  effect(function effectFn2() {}
})
```

2. 当前不支持嵌套的问题

理想：

data

- foo
- effectFn1
- bar
- effectFn2

实际上你只有一个 fnrun 的 log
因为 activeEffect 被覆盖了
