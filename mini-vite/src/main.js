import {createApp, h} from 'vue'

const App = {
    render() {
        return h('div', null, [h('h2', null, String('Hello vite'))])
    }
}
createApp(App).mount('#app')