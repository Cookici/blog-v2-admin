<template>
  <div v-if="!item.meta?.hidden">
    <!-- 没有子路由的菜单项或者是仪表盘 -->
    <template v-if="!hasChildren(item) || isDashboard(item)">
      <el-menu-item :index="resolvePath(item.path)" @click="handleClick(resolvePath(item.path))">
        <el-icon v-if="item.meta?.icon || isTopLevel">
          <component :is="item.meta?.icon || 'Menu'" />
        </el-icon>
        <template #title>
          <span>{{ item.meta?.title }}</span>
        </template>
      </el-menu-item>
    </template>

    <!-- 有子路由的菜单项 -->
    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon || isTopLevel">
          <component :is="item.meta?.icon || 'Menu'" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
        :is-collapse="isCollapse"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// @ts-ignore 忽略类型检查警告
import path from 'path-browserify';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  },
  isCollapse: {
    type: Boolean,
    default: false
  }
});

// 判断是否为顶层路由
const isTopLevel = computed(() => {
  return !props.item.meta?.hidden && (!props.item.parent || props.item.path === '/');
});

// 判断是否为仪表盘路由
const isDashboard = (route: any) => {
  return route.path === '/dashboard';
};

// 判断是否有子路由
const hasChildren = (route: any) => {
  return route.children && route.children.length > 0 && !route.meta?.hideChildrenInMenu;
};

// 解析路由路径
const resolvePath = (routePath: string) => {
  if (routePath.startsWith('/')) {
    return routePath;
  }
  // 检查是否已经包含了路径部分，避免重复添加
  if (props.basePath.includes(routePath)) {
    return props.basePath;
  }
  return path.resolve(props.basePath, routePath);
};

// 添加点击处理函数
const handleClick = (path: string) => {
  console.log('点击菜单项，跳转路径:', path);
  console.log('当前基础路径:', props.basePath);
  console.log('当前项路径:', props.item.path);
};
</script>