/**
 * 词法分析（生成词法单元token）
 * @param {string} input 
 * @returns tokens
 */
function tokenizer(input) {
  const tokens = [];
  let current = 0;
  while(current < input.length) {
    let char = input[current];

    // 左右括号
    if(char === '(') {
      tokens.push({
        type: 'paren',
        value: '('
      })
      current++;
      continue;
    }
    if(char === ')') {
      tokens.push({
        type: 'paren',
        value: ')'
      })
      current++;
      continue;
    }
    // 空白符
    let whitespace = /\s/;
    if(whitespace.test(char)){
      current++;
      continue;
    }
    // 数字
    let number = /[0-9]/;
    if(number.test(char)) {
      let value = '';
      while(number.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'number',
        value: value
      })
      continue;
    }
    // 字母
    let letter = /[a-zA-Z]/;
    if(letter.test(char)) {
      let value = '';
      while(letter.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'name',
        value: value
      })
      continue;
    }
  }
  return tokens;
}

/**
 * 语法分析（生成ast）
 * @param {*} tokens 
 * @returns ast
 */
function parser(tokens) {
  const ast = {
    type: 'Program',
    body: []
  }

  let current = 0;

  // 将token转换成node对象
  function walk() {
    let token = tokens[current]

    // 数字
    if(token.type === 'number') {
      current++;
      return {
        type: 'Literal',
        value: token.value
      }
    }

    // 括号
    if(token.type === 'paren' && token.value === '(') {
      token = tokens[++current]
      let node = {
        type: 'CallExpression',// 表达式
        name: token.value,
        params: []
      }
      // 移动到下一个token
      token = tokens[++current]
      while(token.type !== 'number' && token.type === 'paren' && token.value !== ')'){
        node.params.push(walk())
        token = tokens[++current]
      }

      current++;
      return node;
    }
  }
  while(current < tokens.length) {
    ast.body.push(walk());
  }
  return ast;
}

// 采用了访问者模式
function traverser(ast, visitor){
  function traverseArray(array, parent) {
    array.forEach((child)=> {
      traverseNode(child, parent)
    })
  }

  function traverseNode(node, parent) {
    let methods = visitor[node.type]
    if(methods && methods.enter) {
      methods.enter(node, parent)
    }
    switch(node.type) {
      case 'Program':
        traverseArray(node.body, node)
        break;
      case 'CallExpression':
        traverseArray(node.params, node)
        break;
      case 'Literal':
        break;
      default:
        throw new TypeError('error '+node.type)
    }
  }

  traverseNode(ast, null)
}

/**
 * 转换生成更完整的 newAst
 * @param {object} ast
 * @returns newAst
 */
function transformer(ast) {
  const newAst = {
    type: 'Program',
    body: []
  }

  ast._context = newAst.body;

  traverser(ast, {
    // 表达式
    CallExpression: {
      enter(node, parent){
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name
          },
          params: []
        }
        node._context = expression.params
        if(parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression
          }
        }
        parent._context.push(expression)
      }
    },
    // 数字
    Literal: {
      enter(node, parent) {
        parent._context.push({
          type: 'Literal',
          value: node.value
        })
      }
    }
  })
  return newAst
}

/**
 * 生成目标代码（根据newAst）
 * @param {object} node 
 * @returns
 */
function codeGenerator(node) {
  switch(node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n');
    case 'ExpressionStatement':
      return codeGenerator(node.expression) + ';';
    case 'CallExpression':
      return codeGenerator(node.callee) + '(' + node.params.map(codeGenerator).join(', ') + ')'
    case 'Identifier':
      return node.name
    case 'Literal':
      return node.value
    default:
      throw new TypeError(node.type)
  }
}

// 编译器
function compiler(input) {
  // 1.词法分析
  let tokens = tokenizer(input)
  // 2.语法分析
  let ast = parser(tokens)
  // 3.转换
  let newAst = transformer(ast)
  // 4.生成目标
  let output = codeGenerator(newAst)
  return output;
}