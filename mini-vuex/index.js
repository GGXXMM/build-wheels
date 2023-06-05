import { reactive, computed } from 'vue'

export function createStore(options) {
    return new Store(options)
}

// 定义 Store 类
class Store{
    constructor(options = {}) {
        const store = this
        store._state = reactive(options.state)
        store._mutations = options.mutations
        store._actions = options.actions
        store.commit = this.commit
        store.dispatch = this.dispatch

        // 定义state属性
        Object.defineProperty(store, 'state', {
            get: ()=> {
                return store._state
            },
            set: ()=> {
                console.error('use store.replaceState() to explicit replace store state.')
            }
        })

        // 定义getters属性
        Object.defineProperty(store, 'getters', {
            get: ()=> this._makeLocalGetters(options)
        })

        return store
    }

    _makeLocalGetters(options) {
        const store = this
        const result = {}
        
        Object.keys(options.getters).forEach(key => {
            // 借用computed做getters的缓存
            result = computed(()=> {
                const getter = options.getters[key]
                if(getter) {
                    return getter.call(store, store.state)
                }else{
                    console.error(`unknown getter type: ${key}`)
                    return ''
                }
            })
        })
        return result
    }
    
    // 插件注册install
    install(app) {
        // 创建全局变量$store
        app.config.globalProperties.$store = this
    }
    /**
     * commit
     * @param {string} type 函数名
     * @param {object} payload 数据的载荷
     */
    commit(type, payload) {
        // 获取 type 对应的 mutations
        const entry = this._mutations[type]
        if(!entry) {
            console.error(`unknown mutation type: ${type}`)
            return
        }
        entry.call(this, this.state, payload)
    }
    /**
     * 
     * @param {string} type 函数名
     * @param {object} payload 数据的载荷
     * @returns 
     */
    dispatch(type, payload) {
        // 获取 type 对应的 actions
        const entry = this._actions[type]
        if(!entry) {
            console.error(`[vuex] unknown actions type: ${type}`)
            return
        }
        entry.call(this, this, payload)
    }
}