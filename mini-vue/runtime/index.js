export function createApp(rootComponent) {
    return {
        render() {},
        mount(selector) {
            // 1. 获取宿主
            const container = document.querySelector(selector)
            // 2. 渲染视图
            const el = rootComponent.render.call(rootComponent.data())
            // 3. 追加到宿主
            container.appedChild(el)
        }
    }
}