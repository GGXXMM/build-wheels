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
- [ ] mini-webpack
- [x] mini-vite
   - 解析 ES Module 文件
   - 解析第三方依赖