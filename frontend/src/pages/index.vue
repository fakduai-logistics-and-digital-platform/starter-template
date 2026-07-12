<script setup lang="ts">
import { onMounted } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useHealthLogStore } from '@/stores/use-health-log-store'
import { useGoalStore } from '@/stores/use-goal-store'

useSEO({
  title: 'Dashboard - Wellness',
  description: 'Your wellness overview: health logs, goals, and daily stats at a glance.',
  keywords: ['dashboard', 'wellness', 'health', 'goals', 'stats'],
})

const healthLogStore = useHealthLogStore()
const goalStore = useGoalStore()

const moodLabels: Record<number, string> = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' }
const goalTypeIcons: Record<string, string> = {
  steps: 'ri-footprint-line',
  calories: 'ri-fire-line',
  water: 'ri-drop-line',
  sleep: 'ri-moon-line',
  weight: 'ri-scales-3-line',
}

onMounted(async () => {
  await Promise.all([
    healthLogStore.fetchByUser('demo-user'),
    goalStore.fetchByUser('demo-user'),
  ])
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Wellness Dashboard</h1>

    <!-- Key stats -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="48">
              <VIcon icon="ri-footprint-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Steps Logged</div>
              <div class="text-h5 font-weight-bold">{{ healthLogStore.totalSteps.toLocaleString() }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-moon-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Avg Sleep</div>
              <div class="text-h5 font-weight-bold">{{ healthLogStore.avgSleepHours.toFixed(1) }} hr</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="warning" variant="tonal" size="48">
              <VIcon icon="ri-emotion-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Avg Mood</div>
              <div class="text-h5 font-weight-bold">{{ healthLogStore.avgMood.toFixed(1) }} / 5</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="info" variant="tonal" size="48">
              <VIcon icon="ri-flag-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Active Goals</div>
              <div class="text-h5 font-weight-bold">{{ goalStore.activeGoals.length }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <!-- Recent Logs -->
      <VCol cols="12" md="6">
        <VCard title="Recent Health Logs">
          <VList lines="two">
            <VListItem
              v-for="log in healthLogStore.logs.slice(0, 5)"
              :key="log.id"
            >
              <template #prepend>
                <VAvatar color="primary" variant="tonal" size="36">
                  <VIcon icon="ri-heart-pulse-line" size="18" />
                </VAvatar>
              </template>
              <VListItemTitle>{{ log.date }}</VListItemTitle>
              <VListItemSubtitle>
                {{ log.steps.toLocaleString() }} steps · {{ log.sleepHours }}hr sleep · Mood: {{ moodLabels[log.mood] }}
              </VListItemSubtitle>
            </VListItem>
            <VListItem v-if="healthLogStore.logs.length === 0" class="text-center text-medium-emphasis py-4">
              No logs yet. Start tracking today!
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'health-log-page' }">
              <VBtn variant="text" size="small">View all logs</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>

      <!-- Active Goals -->
      <VCol cols="12" md="6">
        <VCard title="Active Goals">
          <VList>
            <VListItem
              v-for="goal in goalStore.activeGoals.slice(0, 5)"
              :key="goal.id"
            >
              <template #prepend>
                <VAvatar color="success" variant="tonal" size="36">
                  <VIcon :icon="goalTypeIcons[goal.type] ?? 'ri-flag-line'" size="18" />
                </VAvatar>
              </template>
              <VListItemTitle>{{ goal.title }}</VListItemTitle>
              <VListItemSubtitle>
                <VProgressLinear
                  :model-value="goalStore.goalProgress(goal.id)"
                  color="success"
                  height="6"
                  rounded
                  class="my-1"
                />
                {{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }} · {{ goalStore.goalProgress(goal.id) }}%
              </VListItemSubtitle>
            </VListItem>
            <VListItem v-if="goalStore.activeGoals.length === 0" class="text-center text-medium-emphasis py-4">
              No active goals. Set your first goal!
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'goal-page' }">
              <VBtn variant="text" size="small">View all goals</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
