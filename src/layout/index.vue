<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
      <div class="logo-container">
        <h1 class="logo-title" v-show="!isCollapse">博客管理系统</h1>
        <h1 class="logo-title-collapsed" v-show="isCollapse">博</h1>
      </div>
      
      <!-- 菜单 -->
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse-transition="false"
          router
        >
          <sidebar-item 
            v-for="route in routes" 
            :key="route.path" 
            :item="route" 
            :base-path="route.path"
            :is-collapse="isCollapse"
          />
        </el-menu>
      </el-scrollbar>
    </div>
    
    <!-- 主要内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="left-area">
          <!-- 折叠按钮 -->
          <el-icon class="fold-btn" @click="toggleSidebar">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              {{ item.meta?.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="right-area">
          <!-- 用户信息下拉菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-container">
              <el-avatar :size="32" :src="userInfo?.userPhoto || '/avatar.png'" />
              <span class="username">{{ userInfo?.userName || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="app-main">
        <router-view v-slot="{ Component, route: currentRoute }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="currentRoute.fullPath" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'; // 'watch' 可能在移除下方代码块后不再需要，可以酌情删除
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { Fold, Expand, UserFilled, CaretBottom } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useUserApi } from '@/services/modules/user';
import SidebarItem from './components/SidebarItem.vue';

// 获取路由信息
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 用户信息
const userInfo = computed(() => userStore.userInfo);

// 侧边栏折叠状态
const isCollapse = ref(false);

// 获取路由表中需要显示在侧边栏的路由
const routes = computed(() => {
  return router.options.routes.filter(route => {
    return !route.meta?.hidden;
  });
});

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route;
  if (meta?.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title);
  return matched.filter(item => item.meta?.title && !item.meta?.hidden);
});

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

// 下拉菜单命令处理
const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      // 调用登出接口
      await useUserApi.logout();
      
      // 清除本地存储的token和用户信息
      localStorage.removeItem('token');
      userStore.clearUser();
      
      // 跳转到登录页
      router.push('/login');
    } catch {
      // 用户取消操作
    }
  }
};

</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.logo-title-collapsed {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  transition: width 0.28s;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;
}

.sidebar-container.is-collapsed {
  width: 64px;
  .el-menu--collapse {
    width: 64px;
  }
  .logo-container {
    padding: 0;
  }
}

/* 添加悬停提示样式 */
:deep(.el-menu--popup) {
  min-width: 160px;
  padding: 5px 0;
  border-radius: 4px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  &:hover {
    background-color: #263445 !important;
  }
}

:deep(.el-menu--collapse) .el-sub-menu__title {
  padding: 0 16px !important;
}

/* 优化图标样式 */
:deep(.el-menu-item) .el-icon,
:deep(.el-sub-menu__title) .el-icon {
  margin-right: 12px;
  font-size: 18px;
  vertical-align: middle;
}

.sidebar-container.is-collapsed {
  :deep(.el-menu-item) .el-icon,
  :deep(.el-sub-menu__title) .el-icon {
    margin: 0;
    font-size: 20px;
  }
}
.logo-container {
  height: 50px; /* 减小高度 */
  padding: 0 10px; /* 减小内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3649;
}

.logo-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f0f2f5;
  margin-left: 210px; /* 添加左边距，与侧边栏宽度相同 */
  transition: margin-left 0.28s;
}

/* 侧边栏折叠时调整主容器边距 */
.sidebar-container.is-collapsed + .main-container {
  margin-left: 64px;
}

.navbar {
  height: 50px; /* 减小导航栏高度 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px; /* 减小内边距 */
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 1000;
}

.left-area {
  display: flex;
  align-items: center;
}

.fold-btn {
  font-size: 18px; /* 稍微减小图标大小 */
  cursor: pointer;
  margin-right: 15px; /* 减小右边距 */
  padding: 0 8px;
  height: 100%;
  display: flex;
  align-items: center;
}

.right-area {
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
}

.username {
  margin: 0 6px;
  color: #606266;
}

.app-main {
  flex: 1;
  padding: 15px; /* 减小内边距 */
  overflow-y: auto;
  position: relative;
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>