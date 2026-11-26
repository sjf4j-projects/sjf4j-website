import { defineAsyncComponent } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import BenchmarkBars from './components/BenchmarkBars.vue'
import BenchmarkHighlights from './components/BenchmarkHighlights.vue'
import CompiledCodeComparison from './components/CompiledCodeComparison.vue'
import './home.css'
import './docs.css'
import './benchmarks.css'
import './links.css'
import './locale.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('BenchmarkBars', BenchmarkBars)
    app.component('BenchmarkHighlights', BenchmarkHighlights)
    app.component('CompiledCodeComparison', CompiledCodeComparison)
    app.component('MermaidDiagram', defineAsyncComponent(() => import('./components/MermaidDiagram.vue')))
  },
}
