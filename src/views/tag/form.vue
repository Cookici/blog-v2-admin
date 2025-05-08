<template>
  <div class="tag-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑标签' : '添加标签' }}</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <!-- 标签表单内容将在这里实现 -->
      
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const tagId = computed(() => route.params.id as string);
const isEdit = computed(() => !!tagId.value);

// 标签表单逻辑将在这里实现
</script>

<style scoped>
.tag-form-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>