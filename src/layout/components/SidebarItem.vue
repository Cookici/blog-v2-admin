<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- 没有子路由或者只有一个子路由且没有设置alwaysShow -->
    <template v-if="!hasOneShowingChild(item.children, item) || onlyOneChild.meta?.hidden">
      <el-menu-item v-if="!item.children" :index="resolvePath(item.path)">
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>
      
      <el-sub-menu v-else :index="resolvePath(item.path)">
        <template #title>
          <el-icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <span>{{ item.meta?.title }}</span>
        </template>
        
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :base-path="resolvePath(child.path)"
        />
      </el-sub-menu>
    </template>
    
    <!-- 有一个子路由且没有设置alwaysShow -->
    <template v-else>
      <el-menu-item :index="resolvePath(onlyOneChild.path)">
        <el-icon v-if="onlyOneChild.meta?.icon">
          <component :is="onlyOneChild.meta.icon" />
        </el-icon>
        <template #title>{{ onlyOneChild.meta?.title }}</template>
      </el-menu-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import path from 'path-browserify';

const props = defineProps({
  item: {
    type: Object as () => RouteRecordRaw,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  }
});

// 唯一子路由
const onlyOneChild = ref<RouteRecordRaw | null>(null);

// 判断是否只有一个显示的子路由
const hasOneShowingChild = (children: RouteRecordRaw[] = [], parent: RouteRecordRaw) => {
  if (!children) {
    return false;
  }
  
  const showingChildren = children.filter(item => {
    if (item.meta && item.meta.hidden) {
      return false;
    }
    return true;
  });
  
  // 如果只有一个子路由需要显示
  if (showingChildren.length === 1) {
    onlyOneChild.value = showingChildren[0];
    return true;
  }
  
  // 如果没有子路由需要显示，且父路由设置了redirect，则显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '' };
    return true;
  }
  
  return false;
};

// 解析路径
const resolvePath = (routePath: string) => {
  if (routePath.startsWith('/')) {
    return routePath;
  }
  return path.resolve(props.basePath, routePath);
};
</script>