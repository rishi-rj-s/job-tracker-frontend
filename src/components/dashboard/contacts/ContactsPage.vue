<template>
  <div class="space-y-6">
    <ComingSoonCard 
      icon="users"
      title="Contacts Coming Soon"
      description="Keep track of recruiters, hiring managers, and important contacts throughout your job search journey."
    />

    <FeatureGrid :features="contactsFeatures" />
  </div>
</template>

<script setup lang="ts">
import ComingSoonCard from '@components/common/ComingSoonCard.vue'
import FeatureGrid from '@components/common/FeatureGrid.vue'

const contactsFeatures = [
  {
    icon: 'user-circle',
    color: 'blue',
    title: 'Contact Directory',
    description: 'Store recruiter and hiring manager information'
  },
  {
    icon: 'message-square',
    color: 'green',
    title: 'Communication Log',
    description: 'Track all interactions and conversations'
  },
  {
    icon: 'mail',
    color: 'purple',
    title: 'Follow-up Notes',
    description: 'Add notes and reminders for each contact'
  }
]
</script>