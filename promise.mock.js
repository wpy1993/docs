// base on Promise A+
// 实现一个符合Promise A+ 规范的Promise

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

/**
 * 把传进来的函数放在微队列中
 * @param {Function} callback
 */
function runMicroTask(callback) {
  // 判断环境 node or browser
  if (process && process.nextTick) {
    process.nextTick(callback);
  } else if (MutationObserver) {
    // 浏览器环境判断是否支持 new MutationObserver
    const p = document.createElement("p");
    const observer = new MutationObserver(callback);
    observer.observe(p, { childList: true });
    p.innerHTML = "null";
  } else {
    // 没办法了，模拟不了微队列了，开摆
    setTimeout(callback, 0);
  }
}

function isPromise(obj) {
  return !!(obj && typeof obj === "object" && typeof obj.then === "function");
}

class MyPromise {
  /**
   * 构建器
   * @param {Function} executor 任务执行器，立即执行
   */
  constructor(executor) {
    this._state = PENDING; // 状态
    this._value = undefined; // 数据
    this._handlers = []; // 处理函数形成的队列

    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      this._reject(e);
    }
  }

  /**
   * 向处理队列中添加一个函数
   * @param {Function} executor 添加的函数
   * @param {String} state 什么状态下执行
   * @param {Function} resolve then函数返回的Promise成功
   * @param {Function} reject then函数返回的Promise失败
   */
  _pushHandler(executor, state, resolve, reject) {
    this._handlers.push({
      executor,
      state,
      resolve,
      reject,
    });
  }

  _runHandlers() {
    if (this._state === PENDING) {
      return;
    }

    while (this._handlers[0]) {
      const handler = this._handlers[0];
      this._runOneHandler(handler);
      this._handlers.shift();
    }
  }

  // handler.executor() 执行时，非箭头函数下，this可能会指向 handler
  // 所以解构一下，让它指向本来的比如global/window
  _runOneHandler({ executor, state, resolve, reject }) {
    runMicroTask(() => {
      if (this._state !== state) {
        return;
      }
      if (typeof executor !== "function") {
        this._state === FULFILLED ? resolve(this._value) : reject(this._value);
      }

      try {
        const result = executor(this._value);
        if (isPromise(result)) {
          result.then(resolve, reject);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *  Promise A+规范的then
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   */
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._pushHandler(onFulfilled, FULFILLED, resolve, reject);
      this._pushHandler(onRejected, REJECTED, resolve, reject);
      this._runHandlers();
    });
  }

  /**
   * 更改任务状态
   * @param {String} newState 新状态
   * @param {any} value 相关数据
   */
  _changeState(newState, value) {
    if (this._state !== PENDING) {
      return;
    }
    this._state = newState;
    this._value = value;

    this._runHandlers();
  }

  /**
   * 标记当前任务完成
   * @param {any} data
   */
  _resolve(data) {
    // 改变状态和数据
    this._changeState(FULFILLED, data);
  }

  /**
   * 标记当前任务失败
   * @param {any} reason
   */
  _reject(reason) {
    // 改变状态和数据
    this._changeState(REJECTED, reason);
  }
}

// 测试代码
const pro1 = new MyPromise((resolve, reject) => {
  resolve(1);
});

pro1
  .then((data) => {
    console.log(data);
    return 3;
  })
  .then((data) => {
    console.log(data);
    return 4;
  })
  .then((data) => {
    console.log(data);
    return 5;
  });

pro1
  .then((data) => {
    console.log(data);
    return 11;
  })
  .then((data) => {
    console.log(data);
    return 12;
  })
  .then((data) => {
    console.log(data);
    return 13;
  });

function delay(duration) {
  return new MyPromise((resolve) => {
    setTimeout(resolve, duration);
  });
}

(async function () {
  console.log("start");
  await delay(2000);
  console.log("ok");
})();

// 设计时需要额外思考的点如下：
// resolve和reject只能第一次
// throw等错误需要被捕获
// then()内部可能是空或者不是函数 - 执行时再处理


- refer -> 渡一前端课程