import { effect, reactive } from '../reactivity'
import { createVNode } from './vnode'
// ---runtime-core----
// custom render api
export function createRender(options) {
    const {
        createElement: hostCreateElement,
        setElementText: hostSetElementText,
        insert: hostInsert,
        remove: hostRemove
    } = options

    const render = (vnode, container)=> {
        // // 1. 获取宿主
        // const container = options.querySelector(selector)
        // // 2. 渲染视图
        // const observed = reactive(rootComponent.data())
        // // 3. 为组件定义一个更新函数
        // const componentUpdateFn = () => {
        //     const el = rootComponent.render.call(observed)
        //     // 4. 追加到宿主
        //     options.insert(el, container)
        // }
        // // 设置激活副作用
        // effect(componentUpdateFn)
        // // 初始化执行一次
        // componentUpdateFn()

        // // 挂载钩子
        // if(rootComponent.mounted) {
        //     rootComponent.mounted.call(observed)
        // }

        // 如果存在vnode，则执行mount或patch，否则为unmount
        if(vnode) {
            patch(container._vnode || null, vnode, container)
        }
        container._vnode = vnode
    }
    /**
     * patch比对
     * @param {*} n1 旧节点
     * @param {*} n2 新节点
     * @param {*} container 
     */
    const patch = (n1, n2, container)=> {
        // 判断 n2 的类型
        const { type, shapeFlag } = n2
        switch(type) {
            // 文本节点
            case Text:
                break;
            // 注释节点
            case Comment:
                break;
            // 静态节点
            case Static:
                if(n1 == null) {
                    mountStaticNode(n2, container)
                }else{
                    patchStaticNode(n1, n2, container)
                }
                break;
            case Fragment:
                break;
            default:
                if(shapeFlag & ShapeFlags.ELEMENT) {
                    // 普通dom节点处理
                    processElement(n1, n2, container)
                }else if(shapeFlag & ShapeFlags.COMPONENT) {
                    // component处理
                    processComponent(n1, n2, container)
                }
        }
    }

    const processElement = (n1, n2, container) => {
        if(n1 == null) {
            mountElement(n2, container)
        }else{
            // patch
            patchElement(n1, n2, container)
        }
    }

    const processComponent = (n1, n2, container) => {
        if(n1 == null) {
            mountComponent(n2, container)
        }else{
            updateComponent(n1, n2, container)
        }
    }
    const mountElement = (vnode, container) => {
        const el = (vnode.el = hostCreateElement(vnode.type));

        // children为文本
        if(typeof vnode.children === 'string') {
            el.textContent = vnode.children
        }else{
            // 数组需要递归创建
            vnode.children.forEach(child => patch(null, child, el))
        }
        // 插入元素
        hostInsert(el, container)
    }

    const patchElement = (n1, n2, container) => {
        // 获取要更新的元素节点
        const el = n2.el = n1.el

        // 更新type相同的节点，实际还需要考虑key
        if(n1.type === n2.type) {
            const oldCh = n1.children
            const newCh = n2.children

            // 根据双方子元素情况做不同处理
            // 新节点是文本
            if(typeof newCh === 'string') {
                // 旧节点是文本/数组
                if(oldCh !== newCh) {
                    // 替换文本
                    hostSetElementText(el, newCh)
                }
            }else{
                // 新节点是数组
                // 旧节点是文本
                if(typeof oldCh === 'string') {
                    // 先清空
                    hostCreateElement(el, '')
                    newCh.forEach(child => patch(null, child, el))
                }else{
                    // 旧节点是数组
                    updateChildren(oldCh, newCh, el)
                }
            }
        }
    }

    const updateChildren = (oldCh, newCh, parentElm) => {

    }
    /**
     * 初始化挂载
     * @param {object} initialVNode 
     * @param {object} container 
     */
    const mountComponent = (initialVNode, container) => {
        // 1. 创建组件实例
        const instance = {
            data: {},
            vnode: initialVNode,
            isMounted: false
        }
        // 2. 初始化组件状态
        const { data: dataOptions } = instance.data.type;
        instance.data = reactive(dataOptions())

        // 3. 安装带副作用的渲染函数
        setupRenderEffect(instance, container)
    }

    const setupRenderEffect = (instance, container) => {
        // 声明组件更新函数
        const componentUpdateFn = () => {
            if(!instance.isMounted) {
                // 创建阶段
                // 保存最新的虚拟DOM，下次更新作为旧的vnode进行patch对比
                const vnode = (instance.subtree = render.call(instance.data))
                // 递归patch嵌套节点
                patch(null, vnode, container)
                // 生命周期挂载钩子
                if(instance.vnode.type.mounted) {
                    instance.vnode.type.mounted.call(instance.data)
                }
                instance.isMounted = true
            }else{
                // 更新阶段
                const prevVnode = instance.subtree
                // 获取最新的vnode
                const nextVnode = render.call(instance.data)
                // 保存下次更新
                instance.subtree = nextVnode
                patch(prevVnode, nextVnode)
            }
        }
        // 建立更新机制
        effect(componentUpdateFn)

        // 首次执行组件更新函数
        componentUpdateFn()
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
                const vnode = createVNode(rootComponent)
                // 将虚拟dom转换为dom，并追加至宿主
                render(vnode, selector)
            }
        }
        return app
    }
}