(function(graph) {
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

    require('./src/index.js')
  })({"./src/index.js":{"deps":{"./print":"./src/print"},"code":"\"use strict\";\n\nvar _print = _interopRequireDefault(require(\"./print\"));\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\nfunction compent() {\n  var element = document.createElement('div');\n  var btn = document.createElement('button');\n  btn.innerHTML = 'Click me';\n  btn.onclick = _print[\"default\"];\n  element.appendChild(btn);\n  return element;\n}\ndocument.body.appendChild(compent());"},"undefined":{}})