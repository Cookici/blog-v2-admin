<template>
  <div class="comment-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <!-- 评论详情内容将在这里实现 -->
      
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const commentId = computed(() => route.params.id as string);

// 评论详情逻辑将在这里实现
</script>

<style scoped>
.comment-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>