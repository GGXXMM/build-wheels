import { defineComponent, h, getCurrentInstance } from 'vue';

export default defineComponent({
    setup() {
        return () => {
            // 1. 获取组件实例
            const { proxy: { $router } } = getCurrentInstance()

            // 2. 获取想要渲染的组件
            // 1）获取配置 routes
            // 2）通过current地址匹配 routes 对应组件
            let component;
            const route = $router.options.routes.find(
                (route) => route.path === unref($router.current)
            )
            if(route) {
                component = route.component
                return h(component, 'router-view')
            }else{
                console.warn('no match component')
                return h('div', '')
            }
            
        }
    }
})