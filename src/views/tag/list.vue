<template>
  <div class="tag-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>标签列表</span>
          <el-button type="primary" @click="$router.push('/tag/create')">添加标签</el-button>
        </div>
      </template>
      
      <!-- 标签列表内容将在这里实现 -->
      
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 标签列表逻辑将在这里实现
</script>

<style scoped>
.tag-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>