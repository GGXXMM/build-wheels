// ---runtime-core----
// custom render api
export function createRender(options) {
    const render = (rootComponent, selector)=> {
        // 1. 获取宿主
        const container = options.querySelector(selector)
        // 2. 渲染视图
        const el = rootComponent.render.call(rootComponent.data())
        // 3. 追加到宿主
        options.insert(el, container)
    }
    return {
        render,
        // 提供custom createApp方法（与平台无关）
        createApp: createAppAPI(render)
    }
}

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        const app = {
            mount(selector) {
                render(rootComponent, selector)
            }
        }
        return app
    }
}