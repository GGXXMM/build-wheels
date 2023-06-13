import { ref } from 'vue';
import RouterLink from './RouterLink';
import RouterView from './RouterView';
/**
 * 创建路由实例
 * @param {*} options 路由配置
 * @return
 */
export function createRouter(options) {
    const router = {
        options,// 保存配置项
        current: ref(window.location.hash.slice(1) || '/'),
        install(app) {
            const router = this
            // 1. 注册全局组件
            app.component('RouterLink', RouterLink)
            app.component('RouterView', RouterView)

            // 2. 注册$router
            app.config.globalProperties.$router = router
        }
    }
    // 监听hashchange事件
    window.addEventListener('hashchange', () => {
        // 变化保存到current
        router.current.value = window.location.hash.slice(1)
    })
    return router
}