import { computed, reactive, toRefs, getCurrentInstance } from 'vue';
import { piniaSymbol } from './createPinia';

/**
 * 定义Store
 * @param {*} options 
 */
export function defineStore(id, options) {
    const {state: stateFn, actions, getters} = options
    const state = reactive(stateFn())

    function useStore() {
        // 获取当前组件实例
        const currentInstance = getCurrentInstance()
        const pinia = currentInstance && currentInstance.inject(piniaSymbol)
        // 判断store id是否存在
        if(!pinia._s.has(id)) {
            pinia._s.set(id, reactive({
                ...toRefs(state),
                // 借用 computed 实现 getter 缓存性
                ...Object.keys(getters || {}).reduce((computedGetters, name)=> {
                    computedGetters[name] = computed(()=> {
                        return getters[name].call(store, store.state)
                    })
                    return computedGetters
                }, {}),
                ...Object.keys(actions || {}).reduce((wrapperActions, actionName)=> {
                    wrapperActions[actionName] = () => actions[actionName].call(store)
                    return wrapperActions
                }, {}),
                $patch: (partialStateOrMutator)=> {
                    if(typeof partialStateOrMutator === 'object') {
                        Object.keys(partialStateOrMutator).forEach(key => {
                            state[key] = partialStateOrMutator[key]
                        })
                    }else{
                        partialStateOrMutator(state)
                    }
                }
            }))
        }
        const store = pinia._s.get(id)
        return store
    }
    return useStore
}