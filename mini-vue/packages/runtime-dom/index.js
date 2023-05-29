// ---runtime-dom---
import { createRender } from '../runtime-core/index'
// dom平台特有的节点操作
const renderOptions = {
    querySelector(selector) {
        return document.querySelector(selector)
    },
    insert(child, parent, anchor) {
        // anchor 为锚点，为null时调用appendChild
        parent.insertBefore(child, anchor || null)
    }
}
// 确保renderer是单例
let renderer
function ensureRenderer() {
    return renderer || (renderer = createRender(renderOptions))
}
// 创建App实例
export function createApp(rootComponent) {
    return ensureRenderer().createApp(rootComponent)
}