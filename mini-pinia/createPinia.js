import { markRaw } from 'vue';

export const piniaSymbol = Symbol('pinia')
/**
 * 创建pinia实例（插件化）
 */
export function createPinia() {
    const pinia = markRaw({
        // 注册
        install(app) {
            pinia._a = app
            app.provide(piniaSymbol, pinia)
            app.config.globalProperties.$pinia = pinia
        },
        _s: new Map() // 存储子模块store
    })

    return pinia
}