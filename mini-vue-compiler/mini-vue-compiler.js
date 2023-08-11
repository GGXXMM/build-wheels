const fs = require('fs')
const { 
  // baseCompile:compiler
  baseParse,
  transform,
  generate,
  getBaseTransformPreset
} = require('@vue/compiler-core')

const {extend} = require('@vue/shared')

function compiler(template, options) {
  // 1. parse 生成ast
  const ast = baseParse(template);
  
  // 2. transform，转换ast
  const prefixIdentifier = false
  const [nodeTransforms, directiveTransforms] = getBaseTransformPreset(prefixIdentifier)
  // node节点、directive指令处理
  transform(
    ast,
    extend({}, options, {
      prefixIdentifier,
      nodeTransforms: [
        ...nodeTransforms,
        ...(options.nodeTransforms || [])
      ],
      directiveTransforms: extend(
        {},
        directiveTransforms,
        options.directiveTransforms || {}
      )
    })
  )

  // 3. generate，生成目标代码
  return generate(
    ast,
    extend({}, options, {
      prefixIdentifier
    })
  )
}

const {code} = compiler('<div>Hello World</div>', {
  filename: 'foo.vue',
  sourceMap: true
})
fs.writeFileSync('./dist/vue.js', code)