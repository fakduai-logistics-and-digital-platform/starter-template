<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useProductStore } from '@/stores/use-product-store'
import { useSEO } from '@/composables/useSEO'

// Configure SEO for this page
useSEO({
  title: 'Products Management - Admin Dashboard',
  description: 'Browse and manage product catalog in your admin dashboard. View, edit, and organize products with comprehensive inventory management tools.',
  keywords: ['products', 'management', 'admin', 'catalog', 'inventory', 'dashboard', 'e-commerce'],
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Image', key: 'thumbnail' },
  { title: 'Title', key: 'title' },
  { title: 'Category', key: 'category' },
  { title: 'Price', key: 'price' },
  { title: 'Stock', key: 'stock' },
  { title: 'Rating', key: 'rating' },
  { title: 'Action', key: 'action' },
]

const limit = ref(30)
const page = ref(1)
const totalRows = ref(0)
const searchQuery = ref('')
const productStore = useProductStore()
const isProcessing = ref(false)

async function updateOptions(options: any) {
  page.value = options.page
  limit.value = options.itemsPerPage
  await loadData()
}

const { products } = storeToRefs(productStore)

async function loadData() {
  isProcessing.value = true

  const skip = (page.value - 1) * limit.value
  await productStore.fetchProducts({
    limit: limit.value,
    skip,
    search: searchQuery.value || undefined,
  })

  totalRows.value = products.value?.total ?? 0
  isProcessing.value = false
}

async function onSearch() {
  page.value = 1
  await loadData()
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div>
    <VCard
      class="mb-6"
      title="Products Management"
    >
      <VCardText>
        <VRow class="mb-4">
          <VCol cols="12" md="6">
            <VTextField
              v-model="searchQuery"
              placeholder="Search products..."
              prepend-inner-icon="ri-search-line"
              clearable
              @keyup.enter="onSearch"
              @click:clear="searchQuery = ''; onSearch()"
            />
          </VCol>
          <VCol cols="12" md="6" class="d-flex align-center">
            <VBtn color="primary" @click="onSearch">
              <VIcon icon="ri-search-line" class="me-2" />
              Search
            </VBtn>
          </VCol>
        </VRow>

        <BaseTable
          :headers="headers"
          :items="products?.products ?? []"
          :total-items="totalRows"
          :items-per-page="limit"
          :page="page"
          :is-loading="isProcessing"
          @update:options="updateOptions"
        >
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.thumbnail="{ item }">
            <VAvatar :image="item.thumbnail" size="60" rounded />
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.title="{ item }">
            <div class="text-body-1 font-weight-medium">
              {{ item.title }}
            </div>
            <div class="text-caption text-disabled">
              {{ item.brand }}
            </div>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.category="{ item }">
            <VChip size="small" color="info">
              {{ item.category }}
            </VChip>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.price="{ item }">
            <div class="text-body-1 font-weight-bold text-success">
              ${{ item.price.toFixed(2) }}
            </div>
            <div v-if="item.discountPercentage > 0" class="text-caption text-error">
              -{{ item.discountPercentage.toFixed(1) }}%
            </div>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.stock="{ item }">
            <VChip
              :color="item.stock > 50 ? 'success' : item.stock > 0 ? 'warning' : 'error'"
              size="small"
            >
              {{ item.stock }}
            </VChip>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.rating="{ item }">
            <div class="d-flex align-center">
              <VIcon icon="ri-star-fill" color="warning" size="small" class="me-1" />
              <span class="text-body-2">{{ item.rating.toFixed(1) }}</span>
            </div>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.action>
            <IconBtn size="small">
              <VTooltip activator="parent" location="top">
                Edit Product
              </VTooltip>
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
          </template>
        </BaseTable>
      </VCardText>
    </VCard>
  </div>
</template>
