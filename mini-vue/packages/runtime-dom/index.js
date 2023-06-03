// ---runtime-dom---
import { createRender } from '../runtime-core/index'

let renderer

// dom平台特有的节点操作
const renderOptions = {
    querySelector(selector) {
        return document.querySelector(selector)
    },
    insert(child, parent, anchor) {
        // anchor 为锚点，为null时调用appendChild
        parent.insertBefore(child, anchor || null)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    createElement(tag) {
        return document.createElement(tag)
    },
    remove(el) {
        const parent = el.parentNode
        if(parent) {
            parent.removeChild(el)
        }
    }
}
// 确保renderer是单例
function ensureRenderer() {
    return renderer || (renderer = createRender(renderOptions))
}
// 创建App实例
export function createApp(rootComponent) {
    // 返回App实例
    const app = ensureRenderer().createApp(rootComponent)
    // 暂存原mount函数
    const { mount } = app
    app.mount = (containerOrSelector) => {
        // 获取真实container dom节点
        const container = document.querySelector(containerOrSelector)
        mount(container)
    }
    return app
}