import DefaultTheme from 'vitepress/theme'
import BenchmarkBars from './components/BenchmarkBars.vue'
import BenchmarkHighlights from './components/BenchmarkHighlights.vue'
import CompiledCodeComparison from './components/CompiledCodeComparison.vue'
import './home.css'
import './docs.css'
import './benchmarks.css'
import './links.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BenchmarkBars', BenchmarkBars)
    app.component('BenchmarkHighlights', BenchmarkHighlights)
    app.component('CompiledCodeComparison', CompiledCodeComparison)
  },
}
