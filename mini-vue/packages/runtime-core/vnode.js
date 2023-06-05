/**
 * 创建虚拟dom
 * @param {string/object} type 
 * @param {object} props 
 * @param {object} children 
 * @returns 
 */
export function createVNode(type, props, children) {
    // 返回虚拟dom
    return {type, props, children}
}

export function sameVnode(n1, n2) {
    return n1.tag === n2.tag && n1.key === n2.key
}
