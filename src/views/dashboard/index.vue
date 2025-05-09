<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-header">
            <h2>欢迎使用博客管理系统</h2>
            <p>今天是 {{ currentDate }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-item">
            <el-icon class="icon"><User /></el-icon>
            <div class="data-info">
              <div class="data-title">用户总数</div>
              <div class="data-value">{{ userCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-item">
            <el-icon class="icon"><Document /></el-icon>
            <div class="data-info">
              <div class="data-title">文章总数</div>
              <div class="data-value">{{ articleCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-item">
            <el-icon class="icon"><ChatDotRound /></el-icon>
            <div class="data-info">
              <div class="data-title">评论总数</div>
              <div class="data-value">{{ commentCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-item">
            <el-icon class="icon"><Collection /></el-icon>
            <div class="data-info">
              <div class="data-title">标签总数</div>
              <div class="data-value">{{ tagCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 文章统计图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-header">
            <div class="chart-title">文章发布统计</div>
            <div class="chart-actions">
              <el-radio-group v-model="articleTimeRange" size="small" @change="fetchArticleDailyCount">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content">
            <div ref="articleChartRef" class="chart-container"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-header">
            <div class="chart-title">评论统计</div>
            <div class="chart-actions">
              <el-radio-group v-model="commentTimeRange" size="small" @change="fetchCommentDailyCount">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content">
            <div ref="commentChartRef" class="chart-container"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { User, Document, ChatDotRound, Collection } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useDashboardApi } from '@/services/modules/dashboard'

// 数据统计
const userCount = ref(0);
const articleCount = ref(0);
const commentCount = ref(0);
const tagCount = ref(0);

// 图表相关
const articleChartRef = ref<HTMLElement | null>(null)
const commentChartRef = ref<HTMLElement | null>(null)
let articleChart: echarts.ECharts | null = null
let commentChart: echarts.ECharts | null = null
const articleTimeRange = ref('week')
const commentTimeRange = ref('week')

// 获取当前日期
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}));

// 获取统计数据
const fetchCounts = async () => {
  try {
    // 获取用户总数
    userCount.value = await useDashboardApi.getUserCount()

    // 获取文章总数
    articleCount.value = await useDashboardApi.getArticleCount()

    // 获取评论总数
    commentCount.value = await useDashboardApi.getCommentCount()

    // 获取标签总数
    tagCount.value = await useDashboardApi.getLabelCount()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取日期范围
const getDateRange = (timeRange: string) => {
  const endDate = new Date()
  let startDate = new Date()
  
  if (timeRange === 'week') {
    const day = endDate.getDay() || 7
    startDate.setDate(endDate.getDate() - day + 1)
  } else {
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  }
  
  // 修改日期格式化方法，确保输出格式为后端可接受的LocalDateTime格式
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return date === startDate 
      ? `${year}-${month}-${day} 00:00:00` 
      : `${year}-${month}-${day} 23:59:59`
  }
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  }
}

// 获取文章每日统计数据
const fetchArticleDailyCount = async () => {
  try {
    const params = getDateRange(articleTimeRange.value)
    const data = await useDashboardApi.getArticleDailyCount(params)
    renderChart(articleChartRef.value, articleChart, data, '文章数量')
  } catch (error) {
    console.error('获取文章每日统计失败:', error)
  }
}

// 获取评论每日统计数据
const fetchCommentDailyCount = async () => {
  try {
    const params = getDateRange(commentTimeRange.value)
    const data = await useDashboardApi.getCommentDailyCount(params)
    renderChart(commentChartRef.value, commentChart, data, '评论数量')
  } catch (error) {
    console.error('获取评论每日统计失败:', error)
  }
}

// 渲染图表
const renderChart = (
  chartRef: HTMLElement | null,
  chart: echarts.ECharts | null,
  data: Array<{ date: string; count: number }>,
  name: string
) => {
  if (!chartRef) return
  
  if (chart) {
    chart.dispose()
  }
  
  chart = echarts.init(chartRef)
  
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name,
        type: 'bar',
        barWidth: '60%',
        data: counts,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart?.resize()
  })
}

// 监听时间范围变化
watch(articleTimeRange, () => {
  fetchArticleDailyCount()
})

watch(commentTimeRange, () => {
  fetchCommentDailyCount()
})

// 初始化
onMounted(async () => {
  await fetchCounts()
  await fetchArticleDailyCount()
  await fetchCommentDailyCount()
})

// 组件卸载时清理资源
onUnmounted(() => {
  if (articleChart) {
    articleChart.dispose()
    articleChart = null
  }
  if (commentChart) {
    commentChart.dispose()
    commentChart = null
  }
  window.removeEventListener('resize', () => {
    articleChart?.resize()
    commentChart?.resize()
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
  background-color: #f0f9ff;
}

.welcome-header {
  text-align: center;
  padding: 10px 0;
}

.welcome-header h2 {
  margin-bottom: 10px;
  color: #409EFF;
}

.data-overview {
  margin-bottom: 20px;
}

.data-card {
  height: 120px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.data-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.icon {
  font-size: 48px;
  margin-right: 20px;
  color: #409EFF;
}

.data-info {
  display: flex;
  flex-direction: column;
}

.data-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.data-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
}

.chart-card {
  height: 100%;
  min-height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.chart-container {
  height: 350px;
  width: 100%;
}
</style>