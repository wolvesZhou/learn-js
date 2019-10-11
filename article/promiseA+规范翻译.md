发现网上翻译Promises/A+的文章一大堆，但还是想着自己翻译一下，然后写下promise的源码。

原文： [Promises/A+](https://promisesaplus.com/#point-3)

> 一个开放的、健全的、可操作的JavaScript标准，由开发者制定，供开发者参考。

一个promise表示一个异步操作的最终结果。一个promise最主要的交互方式是通过它的then方法，一个用来展示promise的最终结果或者为什么这个promise不能被完成的原因的回调函数。

这个规范详细描述了then方法的行为，提供了一个所有基于Promise/A+标准实现健全的标准。因此规范必须考虑得十分稳定。虽然Promises/A+组织可能偶尔修订这个规范去做细小的向后兼容的改变，为了处理一些新发现的边缘情况，但我们也要经过深思熟虑，讨论和测试之后才能进行大的不兼容的调整。

从历史上看，Promises/A+ 在早期的建议基础上阐明了行为条款，在扩展它时解决一些不合适的行为，并且省略未指定和有问题的部分。

最终，Promise/A+核心规范没有选择处理怎么去创造、解决和拒绝promises，而是选择提供一个通用的then方法。未来可能在其他项目中实践这些规范。


## 1. 术语

##### 1.1 promise
promise是一个具有then方法的对象或者方法，其行为符合规范

##### 1.2 thenable
thenable是一个定义了then方法的对象或者方法

##### 1.3 value
value是任何JavaScript的合法值（包括undefined，thenable和promise）

##### 1.4 exception
exception是使用throw语句抛出的一个值

##### 1.5 reason
reason是表示一个promise的拒绝原因


## 2. 要求
### 2.1 promise 状态
一个promise必须是以下3个状态中的一个，等待（pending）,完成（fulfilled），拒绝（rejected）

#### 当处于等待态（pending）
需要可以迁移至完成态或者拒绝态

#### 当处于完成态（fulfilled）
1. 一定不能迁移至其他状态
2. 必须有个值，并且不能改变

#### 当处于拒绝态（rejected）
1. 一定不能迁移至其他状态
2. 必须有一个不能更改的理由

这里的不可改变指的是恒等，而不是深层次的不可改变


### 2.2 then方法
一个promise必须提供一个provide方法用来接收当前或者最终的值或者理由。

一个promise的then方法接收两个参数
```
promise.then(onFulfilled, onRejected)
```

onFulfilled和onRejected都是可选的参数
-  如果onFulfilled不是一个方法，那么它必须被忽略
-  如果onRejected不是一个方法，那么它必须被忽略

如果onFulfilled是一个函数：
- 在一个promise是完成状态之后必须被调用，其第一个参数为promise的终值
- 一定不能在一个函数是完成态之前调用
- 不能被调用多次

如果onRejected是一个函数
- 在promise是拒绝态之后必须被调用，其第一个参数为promise的理由
- 一定不能在promise是拒绝态之前被调用
- 不能被调用多次

onFulfilled和onRejected仅仅在执行上下文仅包含平台代码时调用。

onFulfilled和onRejected只能作为函数被调用（即没有this这个值）

then可能在同一个promise中调用多次
- 当promise是完成态时，所有onFulfilled回调必须按照及执行顺序依次调用
- 当promise是拒绝态时，所有onRejected回调必须按照执行顺序依次调用

then方法必须返回一个promise：
(promise2 = promise1.then(onFulfilled, onRejected);)
- 如果onFulfilled或者onRejected返回一个值x,则执行promise解决步骤
- 如果onFulfilled或者onRejected抛出一个异常e，promise2必须拒绝执行并把e作为拒绝原因
- 如果onFulfilled不是函数并且promise1是完成态，那么promise2必须执行并返回相同的结果
- 如果onRejected不是函数并且promise1是拒绝态，那么promise2必须被拒绝执行并返回相同的结果

### 2.3 Promise解决过程
promise解决过程是一个抽象的操作，需要输入一个promise和一个值，我们表示为[[Resolve]](promise,x).如果x可以执行then方法并且尝试使promise接受x的状态，假设x表现得像个promise。否则用x的值来执行x。

这种thenables的方式使promise具有通用性，只需暴露出一个符合Promise/A+的then方法。它也使得遵循promises/A+的then方法可以很好得兼容不太符合规范的。

执行[[Resolve]](promise,x)，表现为以下步骤：
######  如果promise和x指向同一个对象，则把TypeError为理由拒绝执行promise

###### 如果x是一个promise，则使它接受自己的状态
- 如果x处于等待态（pending），那么promise必须保持等待态直到x变为完成态或者拒绝态
- 如果x处于完成态（fulfilled），用相同的值执行promise
- 如果x处于拒绝态（Rejected），用相同的理由拒绝promise


###### 如果x是一个对象或者方法
1. 把x.then赋值给then
2. 如果取x.then的时候抛出错误，那么把e作为理由拒绝执行promise
3. 如果then是个方法，把x作为函数的作用域this调用，存在两个参数，第一个参数resolvePromise，第二个参数rejectPromise.
  - 如果resolvePromise以值y为参数被调用，则执行[[Resolve]](promise, y)
  - 如果rejectPromise把值r作为理由调用，则把r作为理由拒绝执行promise
  - 如果resolvePromise和rejectPromise都被调用，或者同个参数被调用多次，第一个被调用的优先执行并忽略其他调用
  - 如果执行then方法抛出异常e
    - 如果一个resolvePromise或者rejectPromise已经被调用，忽略它
    - 否则把e作为理由拒绝执行promise
4. 如果then不是一个方法，以x为参数执行promise


###### 如果x不是一个对象或者方法，以x为参数执行promise

如果一个promise被一个循环链中的thenable解决，而[[Resolve]](promise, thenable)的递归性又导致其再次被调用，按照上述的算法会最终导致无限递归。虽然不强制去检测，但是鼓励去检测这样的递归是否存在，若检测到则以一个可识别的TypeError来作为理由拒绝执行promise。

## 3. 备注
1. 这里的平台代码指得是引擎，环境以及promise实施代码。实践时要求onFulfilled和onRejected是异步执行的，而且在then方法被调用的那一轮事件循环之后一个新的执行栈中执行。这种执行方式可以按照宏任务机制执行，比如setTimeout或者setImmediate,或者微任务机制机制，比如MutationObserver或者process.nextTick。由于promise的实施代码本身就是平台代码，所以
在处理程序时本身可能就包括一个任务调度队列。
> 这里提及了 macrotask 和 microtask 两个概念，这表示异步任务的两种分类。在挂起任务时，JS 引擎会将所有任务按照类别分到这两个队列中，首先在 macrotask 的队列（这个队列也被叫做 task queue）中取出第一个任务，执行完毕后取出 microtask 队列中的所有任务顺序执行；之后再取 macrotask 任务，周而复始，直至两个队列的任务都取完。

[stackoverflow](https://stackoverflow.com/questions/25915634/difference-between-microtask-and-macrotask-within-an-event-loop-context)

2. 也就是说，在严格模式下，this的值是undefined，在非严格模式下为全局对象

3. 在满足要求的情况下，实现方案允许promise2 === promise1，每种说明都要有文档说明是否允许并且在哪种情况下允许

4. 总体来说，只有只有符合当前的实现，才会被认为是一个真正的promise。这个规则允许那些特例实现适应符合要求的promise状态

5. 这步我们先是储存了x.then的指向，然后测试并调用那个指向，避免多次指向访问x.then的属性。这种预防是非常有必要的，为了确认一个访问器属性的一致性，并且它的值可能在被检索调用时改变

6. 实现方式不应该对thenable链的深度设置限制，并且假设如果超过这个限制这个递归将是无限的。只有正确的循环才会导致TypeError错误。如果一个递归链上面的thenable都不相同，那么永远递归下去是正确的行为。