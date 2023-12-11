// 好玩的卡死
const delay = (time) => {
  const now = Date.now();
  while (Date.now() <= now + time) {}
};

delay(2000);

/**
 * 验证不同版本event loop的节奏
 */
console.log("outer-1");
setTimeout(() => {
  console.log("a");
  new Promise((resolve) => {
    console.log("b");
    resolve();
  }).then(() => {
    console.log("c");
  });
});

console.log("outer-2");
process.nextTick(() => {
  console.log("next-tick");
});

setTimeout(() => {
  console.log("d");
  new Promise((resolve) => {
    console.log("e");
    resolve();
  }).then(() => {
    console.log("f");
  });
});

Promise.resolve().then(() => {
  setTimeout(() => {
    console.log(111);
  });
});

// node 18 -> outer-1  outer-2  next-tick  a  b  c  d  e  f 111
// node 10 -> outer-1  outer-2  next-tick  a  b  d  e  c  f 111
// 由此可见，新版的node，将每一个setTimeout这种宏任务，都认为是一次独立的event loop
// chrome/safari 最新版同node 18，也就是每一个宏任务，独立进入一次event loop成为主流

// node 10认为，两个setTimeout属于同一个新任务，
// 但是Promise.resolve中微任务生成的setTimeout，10以及以后，一致认为它不属于两个setTimeout任务所在的队列
// node 8.17.0就有意思了，关于排序很随机，关于宏任务微任务很随机，所以就致命了。
