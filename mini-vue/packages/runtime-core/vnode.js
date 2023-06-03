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

