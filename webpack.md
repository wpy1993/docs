- webpack5 的持久化缓存，这样就不需要webpack4的dll了 （Dynamic Link Library）
- webpack5 源码如何跑起来？下载源码，install之后，记得npm link 同时本处 npm link webpack。防止/node_modules/webpack-cli找不到webpack；link webpack的时候会报错，那么 `npm link webpack --legacy-peer-deps` 或者 `npm link webpack --force` 修复报错。报错大约是 pug-loader 版本兼容问题之类的，force或者peer就好

- webpack 还是基于tabable这个框架


- 流程总览
1. 初始化阶段 - 创建compiler
2. 构建阶段 - make
3. 生成阶段 - seal && emitAssets
Q: 什么时候创建的Compilation

- 初始化阶段
new Webpack --> createCompiler --> [getNormalizedWebpackOptions、 applyOptions、 new Compiler、 new WebpackOptionApply().process] --> compiler.run --> compiler.compile

- 构建阶段
[compileation]addEntry --> handleModuleCreation --> factorizeModule --> addModule --> [module]build -> [loader-runner]runLoaders --> [jsParser]parse(acorn.parse) --> preWalkStatements --> blockPreWalkStatements ··· module.handleParseResult --> [HarmonyExportDependencyParserPlugin]xxx --> [module]addDependency

- 生成阶段 compiler.js中，compilation.seal
遍历 this.modules  遍历 this.chunks --> compiler.emitAssets



- [webpack5](https://mp.weixin.qq.com/s/SbJNbSVzSPSKBe2YStn2Zw)


### tree shaking
- HarmonyExportSpecifierDependency
- HarmonyExportExpressionDependency

-  [webpack tree-shaking](https://juejin.cn/post/7002410645316436004)