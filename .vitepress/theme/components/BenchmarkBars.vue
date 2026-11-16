<script setup lang="ts">
import { computed } from 'vue'

interface BenchmarkItem {
  label: string
  speedup: number
}

const props = defineProps<{
  comparison: string
  items: BenchmarkItem[]
}>()

const scaleMax = computed(() =>
  Math.max(1, ...props.items.map((item) => item.speedup)) * 1.08
)

const referencePosition = computed(() => `${100 / scaleMax.value}%`)

function barWidth(speedup: number): string {
  return `${(speedup / scaleMax.value) * 100}%`
}

function formatRatio(value: number): string {
  return `${Number(value.toFixed(2))}×`
}
</script>

<template>
  <figure class="benchmark-bars">
    <figcaption>
      <span>{{ comparison }}</span>
      <span class="benchmark-bars-help">Baseline / SJF4J · greater than 1× favors SJF4J</span>
    </figcaption>

    <div class="benchmark-bars-rows" role="list">
      <div v-for="item in items" :key="item.label" class="benchmark-bars-row" role="listitem">
        <span class="benchmark-bars-label">{{ item.label }}</span>
        <div
          class="benchmark-bars-track"
          role="img"
          :aria-label="`${item.label}: ${formatRatio(item.speedup)} relative performance`"
        >
          <span class="benchmark-bars-reference" :style="{ left: referencePosition }"></span>
          <span
            class="benchmark-bars-fill"
            :class="{ 'is-slower': item.speedup < 1 }"
            :style="{ width: barWidth(item.speedup) }"
          ></span>
        </div>
        <strong class="benchmark-bars-value">{{ formatRatio(item.speedup) }}</strong>
      </div>
    </div>

    <div class="benchmark-bars-axis" aria-hidden="true">
      <span>0×</span>
      <span>1× = parity</span>
      <span>{{ formatRatio(scaleMax) }}</span>
    </div>
  </figure>
</template>

<style scoped>
.benchmark-bars {
  margin: 22px 0 12px;
  padding: 18px 22px 15px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.benchmark-bars figcaption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin-bottom: 18px;
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
}

.benchmark-bars-help {
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 400;
}

.benchmark-bars-rows {
  display: grid;
  gap: 12px;
}

.benchmark-bars-row {
  display: grid;
  grid-template-columns: minmax(130px, 195px) minmax(0, 1fr) 65px;
  align-items: center;
  gap: 14px;
}

.benchmark-bars-label {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.35;
}

.benchmark-bars-track {
  position: relative;
  height: 17px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--vp-c-default-soft);
}

.benchmark-bars-reference {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 1px;
  background: var(--vp-c-text-3);
  opacity: 0.8;
}

.benchmark-bars-fill {
  position: relative;
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--vp-c-brand-1);
}

.benchmark-bars-fill.is-slower {
  background: var(--vp-c-text-3);
}

.benchmark-bars-value {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.benchmark-bars-axis {
  display: flex;
  justify-content: space-between;
  margin: 12px 65px 0 209px;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .benchmark-bars {
    padding: 16px 12px;
  }

  .benchmark-bars-row {
    grid-template-columns: minmax(92px, 116px) minmax(0, 1fr) 48px;
    gap: 8px;
  }

  .benchmark-bars-label {
    font-size: 12px;
  }

  .benchmark-bars-value {
    font-size: 12px;
  }

  .benchmark-bars-axis {
    margin-left: 124px;
    margin-right: 48px;
  }
}
</style>
