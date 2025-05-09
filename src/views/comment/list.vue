<template>
  <div class="comment-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论列表</span>
        </div>
      </template>
      
      <el-table :data="commentList" v-loading="loading">
        <el-table-column prop="commentContent" label="评论内容" width="300" />
        <el-table-column prop="userInfo.userName" label="评论人" width="120" />
        <el-table-column label="评论类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.parentCommentId && scope.row.parentCommentId !== '0' ? 'info' : 'success'">
              {{ scope.row.parentCommentId && scope.row.parentCommentId !== '0' ? '子评论' : '顶层评论' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isDeleted === 1 ? 'danger' : 'success'">
              {{ scope.row.isDeleted === 1 ? '已删除' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="180">
          <template #default="scope">
            {{ scope.row.createTime.replace('T', ' ') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              v-if="(scope.row.parentCommentId && scope.row.parentCommentId !== '0') && scope.row.isDeleted === 0" 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @current-change="fetchCommentList"
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
import { useCommentApi } from '@/services/modules/comment';
import type { CommentDTO, CommentPageQuery, CommentDeleteCommand } from '@/types/comment';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const commentList = ref<CommentDTO[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const fetchCommentList = async () => {
  try {
    loading.value = true;
    const params: CommentPageQuery = {
      page: currentPage.value,
      pageSize: pageSize.value
    };
    const response = await useCommentApi.page(params);
    commentList.value = response.data;
    total.value = response.total;
  } catch (error: any) {
    console.error('获取评论列表失败:', error);
    ElMessage.error('获取评论列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  fetchCommentList();
};

const handleView = (row: CommentDTO) => {
  // 跳转到评论详情页
  router.push(`/comment/detail/${row.commentId}`);
};

const handleDelete = async (row: CommentDTO) => {
  // 只有子评论可以直接删除
  if (!row.parentCommentId || row.parentCommentId === '0') {
    ElMessage.warning('顶层评论需要在详情页中删除');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    const params: CommentDeleteCommand = {
      commentId: row.commentId,
      parentCommentId: row.parentCommentId
    };
    
    await useCommentApi.delete(params);
    ElMessage.success('评论删除成功');
    fetchCommentList(); // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除评论失败');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCommentList();
});
</script>

<style scoped>
.comment-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>