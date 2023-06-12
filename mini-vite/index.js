const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const app = new Koa()

app.use(async (ctx) => {
    const { url, query } = ctx.request
    // / => src/index.html
    if(url == '/') {
        ctx.type = "text/html";
        let content = fs.readFileSync("./src/index.html", "utf-8");
        
        // 入口文件 加入环境变量
        content = content.replace(
        "<script",
        `
        <script>
            window.process = {env: { NODE_ENV: 'dev' }}
        </script>
        <script
        `
        );
        ctx.body = content;
    }
    // *.js => src/*.js
    else if(url.endsWith('.js')) {
        const p = path.resolve(__dirname, 'src/'+url.slice(1))
        const content = fs.readFileSync(p, 'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(content)
    }
    // 第三方库的支持
    else if(url.startsWith('/@modules')) {
        // /@modules/vue => 代码的位置路径/node_modules/vue
        const prefix = path.resolve(
            __dirname,
            url.replace('/@modules', 'node_modules')
        )
        // 读取package.json的module属性：获取依赖运行入口
        const module = require(prefix+'/package.json').module
        const moduleP = path.resolve(prefix, module)
        const ret = fs.readFileSync(moduleP, 'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(ret)
    }
})


// 改写函数
function rewriteImport(content) {
    return content.replace(/ from ['|"]([^'"]+)['|"]/g, function(s0, s1){
        // s0：表示匹配的整体；s1：表示正则匹配到的字符串
        if(s1[0] !== '.' && s1[1] !== '/') {
            // 不是绝对/相对路径
            return ` from '/@modules/${s1}'`
        } else {
            return s0
        }
    })
}

app.listen(3000, () => {
    console.log('start port at 3000')
})