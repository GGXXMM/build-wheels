// 当前活动的副作用
let activeEffect;

export function effect(fn) {
    activeEffect = fn
}

/**
 * Proxy代理实现响应式
 * @param {object} obj 需要做响应式处理的对象
 * @returns 
 */
export function reactive(obj) {
    return new Proxy(obj, {
        get(target, key) {
            const value = Reflect.get(target, key)
            // 依赖跟踪
            track(target, key)
            return value
        },
        set(target, key, value) {
            const result = Reflect.set(target, key, value)
            // 依赖触发
            trigger(target, key)
            return result
        },
        deleteProperty(target, key) {
            return Reflect.deleteProperty(target, key)
        }
    })
}

// 创建一个Map保存依赖关系 {target: {key: [fn1, fn2]}}，fn1/2为依赖函数
const targetMap = new WeakMap()
function track(target, key) {
    if(activeEffect) {
        let depsMap = targetMap.get(target)
        // 首次 depsMap 不存在，则需要创建
        if(!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }

        // 获取depsMap中的key对应的Set
        let deps = depsMap.get(key)
        // 首次deps是不存在的，需要创建
        if(!deps) {
            depsMap.set(key, (deps = new Set()))
        }

        // 添加当前激活的副作用
        deps.add(activeEffect)

    }
}

function trigger(target, key) {
    const depsMap = targetMap.get(target)
    if(depsMap) {
        const deps = depsMap.get(key)
        if(deps) {
            deps.forEach(dep => dep());
        }
    }
}