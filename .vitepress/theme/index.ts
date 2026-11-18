import DefaultTheme from 'vitepress/theme'
import BenchmarkBars from './components/BenchmarkBars.vue'
import BenchmarkHighlights from './components/BenchmarkHighlights.vue'
import CompiledCodeComparison from './components/CompiledCodeComparison.vue'
import GeneratorPlayground from './components/GeneratorPlayground.vue'
import './home.css'
import './docs.css'
import './benchmarks.css'
import './links.css'
import './generator.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BenchmarkBars', BenchmarkBars)
    app.component('BenchmarkHighlights', BenchmarkHighlights)
    app.component('CompiledCodeComparison', CompiledCodeComparison)
    app.component('GeneratorPlayground', GeneratorPlayground)
  },
}
