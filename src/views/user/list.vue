<template>
  <div class="user-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/手机号"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <!-- 添加用户状态筛选 -->
        <el-select v-model="searchStatus" placeholder="用户状态" clearable>
          <el-option label="正常" :value="0" />
          <el-option label="禁用" :value="1" />
        </el-select>
        
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <!-- 用户列表表格 -->
      <el-table
        :data="userList"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <!-- 表格内容保持不变 -->
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="userPhone" label="手机号" />
        <el-table-column prop="userEmail" label="邮箱" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="scope">
            {{ scope.row.createTime.replace('T', ' ') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 0"
              type="danger" 
              size="small" 
              @click="handleBan(scope.row)"
            >
              禁用
            </el-button>
            <el-button 
              v-else
              type="success" 
              size="small" 
              @click="handleUnban(scope.row)"
            >
              解禁
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页部分保持不变 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 禁用用户对话框保持不变 -->
    <el-dialog
      v-model="banDialogVisible"
      title="禁用用户"
      width="500px"
    >
      <el-form :model="banForm" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="banForm.userId" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="selectedUser.userName" disabled />
        </el-form-item>
        <el-form-item label="禁用原因">
          <el-input 
            v-model="banForm.reason" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入禁用原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="banDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBan" :loading="banLoading">
            确认禁用
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserApi } from '@/services/modules/user';
import type { UserInfo, UserOperatorReq } from '@/types/user';

const router = useRouter();

// 搜索关键词 - 默认为空字符串
const searchKeyword = ref('');
// 添加用户状态筛选，默认为空（全部）
const searchStatus = ref<number | null>(null);

// 用户列表数据
const userList = ref<UserInfo[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索用户
const handleSearch = async () => {
  currentPage.value = 1;
  await fetchUserList();
};

// 重置搜索
const resetSearch = async () => {
  searchKeyword.value = '';
  searchStatus.value = null;
  currentPage.value = 1;
  await fetchUserList();
};

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true;
    const params: UserAdminSearchReq = {
      keyword: searchKeyword.value || '', // 确保 keyword 至少是空字符串
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };
    
    // 只有当 status 为 0 或 1 时才添加到请求参数
    if (searchStatus.value === 0 || searchStatus.value === 1) {
      params.status = searchStatus.value;
    }
    
    const response = await useUserApi.search(params);
    userList.value = response.data;
    total.value = response.total;
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 禁用用户
const handleBan = async (user: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用用户 ${user.userName} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    const params: UserOperatorReq = {
      userId: user.userId,
      status: 1
    };
    await useUserApi.operator(params);
    ElMessage.success('用户禁用成功');
    fetchUserList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '禁用用户失败');
    }
  } finally {
    loading.value = false;
  }
};


// 解禁用户
const handleUnban = async (user: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除对用户 ${user.userName} 的禁用状态吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    // 使用operator API解禁用户
    const params: UserOperatorReq = {
      userId: user.userId,
      status: 0
    };
    await useUserApi.operator(params);
    ElMessage.success('用户解禁成功');
    fetchUserList(); // 刷新列表
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '解禁用户失败');
    }
  } finally {
    loading.value = false;
  }
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUserList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUserList();
};

// 初始加载
fetchUserList();
</script>

<style scoped>
.user-list-container {
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
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>