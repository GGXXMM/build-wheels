# 造轮子
## vue生态
### mini-vue
- [x] runtime
    - createApp
    - render
    - patch
- [ ] compiler
- [x] reactivity
    - reactive

### mini-vuex(4.x)
- [x] createStore
    - store
    - state
    - commit
    - dispatch
    - action

### mini-pinia
- [x] defineStore（定义store）
- [x] createPinia（pinia统一管理多个store）

### mini-router(4.x)
- [x] createRouter
    - router实例
    - RouterLink
    - RouterView

## 构建工具
- [x] super-tiny-compiler
    - tokenizer 词法分析
    - parser 语法分析
    - transformer 转换
    - coddeGenerator 生成目标代码
- [x] mini-webpack
    - 读取文件
    - 分析依赖 parseModules
        - 解析文件为 ast
        - 根据 ast 转换浏览器可执行代码 code
        - 存储文件路径、依赖及 code，生成依赖图
    - 根据依赖图生成 bundle
- [x] mini-vite
    - 解析 ES Module 文件
    - 解析第三方依赖
- [x] mini-vue-compiler
    - parse 生成ast
    - transform 转化ast
    - generate 生成目标代码
