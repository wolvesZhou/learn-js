/**
 * 1. new Promise时，需要传递一个executor执行器，执行器立即执行
 * 2. executor 接受两个参数，分别是resolve和reject
 * 3. promise 只能从pending到Rejected，或者从pending到fulfilled
 * 4. promise的状态一旦改变，就不会再改变
 * 5. promise都有then方法，then接收两个参数，分别是promise成功的回调onfulfilled，和promise失败的回调onrejected。
 * 6. 如果调用then时，promise已经成功，则执行onFulfilled，并将promise的值作为参数传递进去
 *    如果promise已经失败，那么执行onrejected，并将promise失效的原因作为参数传递进去
 *    如果promise的状态是pending，需要将onFulfilled和onRejected函数存放起来，等待状态确定后，在依次将对应的函数执行（发布订阅）
 * 7. then的参数onfulfilled和onrejected可以缺省
 * 8. promise可以then多次，promise的then方法返回一个promise
 * 9. 如果then返回的是一个结果，那么就会把这个结果作为参数，传递给下一个then的成功的回调（onfulfilled）
 * 10. 如果then中抛出了异常，那么就会把这个异常作为参数，传递给下一个then的失败的回调（onrejected）
 * 11. 如果then返回的是一个promise，如果需要等这个promise，那么会等这个promise执行完，promise如果执行成功，就走下一个then的成功，如果失败，就走下一个then的失败
 */

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function Promise(executor) {
  const self = this;
  self.status = PENDING;
  self.onFulfilled = [];
  self.onRejected = [];

  function resolve(value) {
    if (self.status = PENDING) {
      self.status = FULFILLED;
      self.value = value
      self.onFulfilled.forEach(fn => fn())
    }
  }

  function reject(reason) {
    if (self.status = PENDING) {
      self.status = REJECTED;
      self.reason = reason;
      self.onRejected.forEach(fn => fn())
    }
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  const self = this;

  if (promise2 === x) {
    reject(new TypeError('chaining cycle'));
  }

  if (x && typeof x === 'object' || typeof x === 'function') {
    let used;

    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (used) return;
          used = true;
          resolvePromise(promise2, y, resolve, reject);
        }, r => {
          if (used) return;
          used = true;
          reject(r);
        });
      } else {
        if (used) return;
        used = true;
        resolve(x);
      }
    } catch (e) {
      if (used) return;
      used = true;
      reject(e);
    }
  } else {
    reject(x);
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
  const self = this;

  const promise2 = new Promise((resolve, reject) => {
    if (self.status === FULFILLED) {
      setTimeout(() => {
        try {
          const x = onFulfilled(self.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    } else if (self.status === REJECTED) {
      setTimeout(() => {
        try {
          const x = onRejected(self.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    } else if (self.status === PENDING) {
      self.onFulfilled.push(() => {
        setTimeout(() => {
          try {
            const x = onFulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error)
          }
        })
      });
      self.onRejected.push(() => {
        setTimeout(() => {
          try {
            const x = onRejected(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  })

  return promise2;
}

