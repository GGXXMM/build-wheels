/**
 * Proxy代理实现响应式
 * @param {object} obj 需要做响应式处理的对象
 * @returns 
 */
export function reactive(obj) {
    return new Proxy(obj, {
        get(target, key) {
            return Reflect.get(target, key)
        },
        set(target, key, value) {
            return Reflect.set(target, key, value)
        },
        deleteProperty(target, key) {
            return Reflect.deleteProperty(target, key)
        }
    })
}