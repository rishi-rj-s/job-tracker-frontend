<template>
  <div class="space-y-6">
    <ComingSoonCard 
      icon="bar-chart"
      title="Analytics Coming Soon"
      description="Get detailed insights into your job search performance with charts, trends, and success metrics."
    />

    <FeatureGrid :features="analyticsFeatures" />
  </div>
</template>

<script setup lang="ts">
import ComingSoonCard from '@components/common/ComingSoonCard.vue'
import FeatureGrid from '@components/common/FeatureGrid.vue'

const analyticsFeatures = [
  {
    icon: 'trending-up',
    color: 'blue',
    title: 'Application Trends',
    description: 'Track your application volume over time'
  },
  {
    icon: 'pie-chart',
    color: 'green',
    title: 'Success Rates',
    description: 'See your interview and offer conversion rates'
  },
  {
    icon: 'target',
    color: 'purple',
    title: 'Response Times',
    description: 'Average time to hear back from companies'
  }
]
</script>