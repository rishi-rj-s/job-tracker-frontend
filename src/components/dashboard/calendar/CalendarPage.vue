<template>
  <div class="space-y-6">
    <ComingSoonCard 
      icon="calendar"
      title="Calendar Coming Soon"
      description="Track your interview dates, follow-up reminders, and application deadlines all in one place."
    />

    <FeatureGrid :features="calendarFeatures" />
  </div>
</template>

<script setup lang="ts">
import ComingSoonCard from '@components/common/ComingSoonCard.vue'
import FeatureGrid from '@components/common/FeatureGrid.vue'

const calendarFeatures = [
  {
    icon: 'calendar-check',
    color: 'blue',
    title: 'Interview Scheduler',
    description: 'Schedule and track all your upcoming interviews'
  },
  {
    icon: 'bell',
    color: 'green',
    title: 'Follow-up Reminders',
    description: 'Never miss a follow-up with automated reminders'
  },
  {
    icon: 'clock',
    color: 'purple',
    title: 'Deadline Tracking',
    description: 'Keep track of application and offer deadlines'
  }
]
</script>