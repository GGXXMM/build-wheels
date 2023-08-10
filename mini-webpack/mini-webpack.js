const fs = require('fs');
const path = require('path')
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

/**
 * 1. 分析依赖
 * @param {*} filePath
 * @returns {object} depsGraph 依赖图
 */
function parseModules(filePath) {
  const entry = getModuleInfo(filePath);
  const temps = [entry];
  // 依赖图
  const depsGraph = {};
  
  getDeps(temps, entry);
  
  temps.forEach((moduleInfo) => {
    depsGraph[moduleInfo.filePath] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code
    }
  })
  return depsGraph;
}

function getDeps(temps, { deps }) {
  if(!deps) return;
  Object.keys(deps).forEach((key) => {
    const child = deps[key];
    temps.push(child);
    getDeps(temps, child)
  });
}

/**
 *
 * @param {string} filePath
 * @returns {object} 模块信息（文件、依赖路径、转换后代码）
 */
function getModuleInfo(filePath) {
  // 读取文件
  const body = fs.readFileSync(filePath, 'utf-8');
  // 生成 ast
  const ast = parser.parse(body, { sourceType: 'module' });
  // 存储依赖路径
  const deps = {};
  
  // 收集模块
  traverse(ast, {
    // 获取 import 导入的模块
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filePath);
      // 获取标准化路径
      const absPath = './' + path.join(dirname, node.source.value);
      // 如何收集嵌套依赖的??? 
      deps[node.source.value] = absPath;
    },
  });

  // 模块转换（比如：es6转es5）
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });

  return {
    filePath,
    deps,
    code,
  };
}

// 2. 实现bundle
function bundle(filePath) {
  const depsGraph = JSON.stringify(parseModules(filePath))
  // 返回浏览器可执行的代码（字符串格式）
  return `(function(graph) {
    function require(filePath){
      function absRequire(realPath) {
        return require(graph[filePath].deps[realPath])
      }
      var exports = {}

      (function(require, exports, code){
        eval(code)
      })(absRequire, exports, graph[filePath].code);
      return exports;
    }

    require('${filePath}')
  })(${depsGraph})`
}

const content = bundle('./src/index.js');
fs.writeFileSync('./dist/bundle.js', content);
