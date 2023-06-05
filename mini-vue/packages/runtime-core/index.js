import { effect, reactive } from '../reactivity'
import { createVNode, sameVnode } from './vnode'
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
    const patch = (n1, n2, container, anchor = null)=> {
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
                    processElement(n1, n2, container, anchor)
                }else if(shapeFlag & ShapeFlags.COMPONENT) {
                    // component处理
                    processComponent(n1, n2, container)
                }
        }
    }

    const processElement = (n1, n2, container, anchor = null) => {
        if(n1 == null) {
            mountElement(n2, container, anchor)
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
    const mountElement = (vnode, container, anchor = null) => {
        const el = (vnode.el = hostCreateElement(vnode.type));

        // children为文本
        if(typeof vnode.children === 'string') {
            el.textContent = vnode.children
        }else{
            // 数组需要递归创建
            vnode.children.forEach(child => patch(null, child, el))
        }
        // 插入元素
        hostInsert(el, container, anchor)
    }
    // patch element节点
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
    /**
     * diff算法
     * @param {*} oldCh 旧子节点
     * @param {*} newCh 新子节点
     * @param {*} container 父节点
     */
    const updateChildren = (oldCh, newCh, container) => {
        let i = 0
        let e1 = oldCh.length - 1 // 旧节点的终止位置
        let e2 = newCh.length - 1 // 新节点的终止位置

        // 1.从头开始比对
        // (a b) c
        // (a b) d e
        while(i <= e1 && i<= e2) {
            const n1 = oldCh[i]
            const n2 = newCh[i]
            if(sameVnode(n1, n2)) {
                patch(n1, n2, container)
            }else{
                break
            }
            i++
        }

        // 2.从尾开始比对
        // a (b c)
        // d e (b c)
        while(i <= e1 && i<= e2) {
            const n1 = oldCh[e1]
            const n2 = newCh[e2]
            if(sameVnode(n1, n2)) {
                patch(n1, n2, container)
            }else{
                break
            }
            e1--
            e2--
        }

        // 3.如果新节点多余，新增
        if(i > e1) {
            if(i < e2) {
                while(i <= e2) {
                    // 挂载新增节点
                    patch(null, newCh[i], container)
                    i++
                }
            }
        }

        // 4.如果旧节点多余，删除
        else if(i > e2) {
            while(i <= e1) {
                hostRemove(oldCh[i])
                i++
            }
        }

        // 5.未知序列（移动、新增、删除）
        // [i ... e1 + 1]: a b [c d e] f g
        // [i ... e2 + 1]: a b [e d c h] f g
        else {
            let lastIndex = 0
            for(let i = 0;i < newCh.length;i++) {
                const newVnode = newCh[i]
                // 设置节点是否相同标识
                let hasSameVnode = false
                for (let j = 0; j < oldCh.length; j++) {
                    const oldVnode = oldCh[j]
                    if(sameVnode(newVnode, oldVnode)) {
                        hasSameVnode = true
                        // 更新节点
                        patch(oldVnode, newVnode, container)
                        if(j < lastIndex) {
                            // 需要移动
                            const prevVnode = newCh[i-1]
                            if(prevVnode) {
                                // 移动
                                const anchor = prevVnode.nextSibling
                                hostInsert(oldVnode.el, container, anchor)
                            }
                        }else{
                            lastIndex = j
                        }
                        break
                    } 
                }
                // 如果未找到相同节点，则需要新增
                if(!hasSameVnode) {
                    const prevVnode = newCh[i - 1]
                    let anchor = null
                    if(!prevVnode) {
                        anchor = container.firstChild
                    }else{
                        anchor = prevVnode.nextSibling
                    }
                    // 新增节点
                    patch(null, newVnode, container, anchor)
                }
            }

            // 查找oldCh中存在，newCh不存在的节点，做删除
            for (let i = 0; i < oldCh.length; i++) {
                const oldVnode = oldCh[i]
                const sameVnode = newCh.find(v => v.key === oldVnode.key)
                if(!sameVnode) {
                    hostRemove(oldVnode)
                }
            }
        }
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
                // 创建vnode虚拟dom
                const vnode = createVNode(rootComponent)
                // 将虚拟dom转换为dom，并追加至宿主
                render(vnode, selector)
            }
        }
        return app
    }
}