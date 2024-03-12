因为单页面应用 FP FCP 已经不可靠了
那么2020年 google 纳入的新用户体验指标 就是LCP 、 FID 、 CLS

FP: first paint
FCP: first content paint
DCL: DOM content loaded
L: loaded
他们都在 performance.timing 对象里面

LCP large content loaded； 计算可以通过 import {getLCP, getFID, getCLS} from ‘web-vitals’


FP 和 FCP： FP 是 视图内 至少有样式； FCP 是视图内至少有内容

FP 和 DCL 顺序： 看DOM节点数量，如果数量少，就先DCL； 如果数量多，就可能解析一部分就先触发FP
DCL： DOMContentLoaded

首次可交互时间 performace.timing.domInteractive - performance.timing.fetchStart

domInteractive dom结构解析结束，加载内嵌资源时（还没渲染呢），也就是document.readyState 变成interactive，并抛出 readyStateChange事件

TTI 如果一直很忙碌，那么以FCP时间作为TTI

FID： first input delay

稳定性指标
CLS cumulative layout shift  - 页面视觉稳定性 - 所有布局偏移分数的汇总 - 非用户操作、意料之外的偏移

流畅性指标
FPS
longTask 通过 PerformanceObserver监听

关键指标 LCP FID CLS 来自于谷歌提出的 Core Web Vitals ； 有第三方库 web-vitals 可以获取


https://juejin.cn/post/7084481163137384479
https://zhuanlan.zhihu.com/p/195731901