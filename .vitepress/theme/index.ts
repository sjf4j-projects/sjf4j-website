import DefaultTheme from 'vitepress/theme'
import BenchmarkBars from './components/BenchmarkBars.vue'
import './home.css'
import './benchmarks.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BenchmarkBars', BenchmarkBars)
  },
}
