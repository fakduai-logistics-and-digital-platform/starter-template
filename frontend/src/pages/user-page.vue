<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/use-user-store'
import { useSEO } from '@/composables/useSEO'

// Configure SEO for this page
useSEO({
  title: 'Users Management - Admin Dashboard',
  description: 'Manage user accounts, roles, and permissions in your admin dashboard. View, edit, and control user access with comprehensive user management tools.',
  keywords: ['users', 'management', 'admin', 'accounts', 'roles', 'permissions', 'dashboard'],
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Image', key: 'image' },
  { title: 'Name', key: 'firstName' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Action', key: 'action' },
]

const limit = ref(50)
const page = ref(1)
const totalRows = ref(0)
const userStore = useUserStore()
const isProcessing = ref(false)

async function updateOptions(options: any) {
  page.value = options.page
  limit.value = options.itemsPerPage
  await loadData()
}

const { dummyUsers } = storeToRefs(userStore)

async function loadData() {
  isProcessing.value = true

  const skip = (page.value - 1) * limit.value
  await userStore.fetchDummyUsers({ limit: limit.value, skip })

  totalRows.value = dummyUsers.value?.total ?? 0
  isProcessing.value = false
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div>
    <VCard
      class="mb-6"
      title="Users Management"
    >
      <VCardtext>
        <BaseTable
          :headers="headers" :items="dummyUsers?.users ?? []" :total-items="totalRows"
          :items-per-page="limit" :page="page" :is-loading="isProcessing" @update:options="updateOptions"
        >
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.image="{ item }">
            <VAvatar :image="item.image" size="40" />
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.firstName="{ item }">
            <div class="text-body-1">
              {{ item.firstName }} {{ item.lastName }}
            </div>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.role="{ item }">
            <VChip :color="item.role === 'admin' ? 'error' : 'success'" size="small">
              {{ item.role }}
            </VChip>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.action>
            <IconBtn size="small">
              <VTooltip activator="parent" location="top">
                Edit User
              </VTooltip>
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
          </template>
        </BaseTable>
      </VCardtext>
    </VCard>
  </div>
</template>
