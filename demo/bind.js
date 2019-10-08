// call
Function.prototype.call = function (context) {
  if (!context) {
    context = typeof window === 'undefined' ? global : window;
  }

  context.fn = this; // this 表示当前函数
  const args = [...arguments].slice(1) // 类数组转换为数组，获取指向对象之外的剩余参数
  const result = context.fn(...args);
  delete context.fn
  return result;
}

// apply
Function.prototype.apply = function (context, rest) {
  if (!context) {
    context = typeof window === 'undefined' ? global : window
  }

  context.fn = this;
  let result
  if (rest === undefined || rest === null) {
    result = context.fn(rest)
  } else if (typeof rest === 'object') {
    retult = context.fn(...rest)
  }
  delete context.fn;
  return result;
}

// bind
Function.prototype.bind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('not a function');
  }

  const args = [...arguments].slice(1);
  let self = this;
  Function fn() {

  };
  Fn.prototype === this.prototype;
  let bound = function () {
    let res = [...args, ...arguments];
    context = this instanceof Fn ? this : context || this;
    return self.apply(context, res)
  }
  bound.prototype = new Fn();
  return bound;
}
