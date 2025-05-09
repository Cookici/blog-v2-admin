<template>
  <div class="tag-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>标签列表</span>
          <el-button type="primary" @click="$router.push('/tag/create')">添加标签</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-container">
        <el-input
          v-model="keyword"
          placeholder="搜索标签名称"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <!-- 标签列表 -->
      <el-table :data="tagList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="labelId" label="ID" width="80" />
        <el-table-column prop="labelName" label="标签名称" />
        <el-table-column prop="labelAlias" label="别名" />
        <el-table-column prop="labelDescription" label="描述" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isDeleted === 1 ? 'danger' : 'success'">
              {{ scope.row.isDeleted === 1 ? '已删除' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)" :disabled="scope.row.isDeleted === 1">编辑</el-button>
            <el-button 
              v-if="scope.row.isDeleted === 0" 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
            <el-button 
              v-else 
              type="success" 
              size="small" 
              @click="handleRestore(scope.row)"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @current-change="fetchTagList"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useLabelApi } from '@/services/modules/label';
import type { LabelDTO } from '@/types/article';
import { LabelDeleteCommand, LabelPageQuery } from '@/types/label';

const router = useRouter();
const tagList = ref<LabelDTO[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref('');

// 获取标签列表
const fetchTagList = async () => {
  try {
    loading.value = true;
    const params: LabelPageQuery = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined
    };
    
    const response = await useLabelApi.page(params);
    tagList.value = response.data;
    total.value = response.total;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    ElMessage.error('获取标签列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchTagList();
};

// 重置搜索
const resetSearch = () => {
  keyword.value = '';
  currentPage.value = 1;
  fetchTagList();
};

// 分页大小变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  fetchTagList();
};

// 编辑标签
const handleEdit = (row: LabelDTO) => {
  if (row.isDeleted === 1) {
    ElMessage.warning('已删除的标签不能编辑');
    return;
  }
  router.push(`/tag/edit/${row.labelId}`);
};

// 删除标签
const handleDelete = async (row: LabelDTO) => {
  // 检查标签是否已删除
  if (row.isDeleted === 1) {
    ElMessage.warning('该标签已经被删除');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要删除这个标签吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    const params: LabelDeleteCommand = {
      labelId: row.labelId
    };
    
    await useLabelApi.delete(params);
    ElMessage.success('标签删除成功');
    fetchTagList(); // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除标签失败');
    }
  } finally {
    loading.value = false;
  }
};

// 恢复标签
const handleRestore = async (row: LabelDTO) => {
  if (row.isDeleted === 0) {
    ElMessage.warning('该标签未被删除，无需恢复');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要恢复这个标签吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    loading.value = true;
    // 假设后端提供了恢复标签的接口
    await useLabelApi.restore({ labelId: row.labelId });
    ElMessage.success('标签恢复成功');
    fetchTagList(); // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('恢复标签失败');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTagList();
});
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

.search-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>