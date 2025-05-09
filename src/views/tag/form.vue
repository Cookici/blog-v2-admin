<template>
  <div class="tag-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑标签' : '添加标签' }}</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        v-loading="loading"
      >
        <el-form-item label="标签名称" prop="labelName">
          <el-input v-model="formData.labelName" placeholder="请输入标签名称" />
        </el-form-item>
        
        <el-form-item label="标签别名" prop="labelAlias">
          <el-input v-model="formData.labelAlias" placeholder="请输入标签别名" />
        </el-form-item>
        
        <el-form-item label="标签描述" prop="labelDescription">
          <el-input 
            v-model="formData.labelDescription" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入标签描述"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useLabelApi } from '@/services/modules/label';
import { LabelUpdateCommand } from '@/types/label';

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);

const labelId = computed(() => route.params.id as string);
const isEdit = computed(() => !!labelId.value);

// 表单数据
const formData = reactive<LabelUpdateCommand>({
  labelId: '',
  labelName: '',
  labelAlias: '',
  labelDescription: ''
});

// 表单验证规则
const rules = reactive<FormRules>({
  labelName: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  labelAlias: [
    { required: true, message: '请输入标签别名', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  labelDescription: [
    { required: true, message: '请输入标签描述', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
  ]
});

// 获取标签详情
const fetchTagDetail = async () => {
  if (!labelId.value) return;
  
  try {
    loading.value = true;
    // 这里需要后端提供获取单个标签详情的接口
    // 由于没有提供，这里使用分页接口模拟获取
    const response = await useLabelApi.page({
      page: 1,
      pageSize: 100,
      keyword: ''
    });
    
    const tag = response.data.find(item => item.labelId === labelId.value);
    if (tag) {
      // 检查标签是否已删除
      if (tag.isDeleted === 1) {
        ElMessage.error('已删除的标签不能编辑');
        router.back();
        return;
      }
      
      formData.labelId = tag.labelId;
      formData.labelName = tag.labelName;
      formData.labelAlias = tag.labelAlias || '';
      formData.labelDescription = tag.labelDescription || '';
    } else {
      ElMessage.error('标签不存在');
      router.back();
    }
  } catch (error) {
    ElMessage.error('获取标签详情失败');
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      loading.value = true;
      
      if (isEdit.value) {
        // 编辑模式
        formData.labelId = labelId.value;
        await useLabelApi.update(formData);
      } else {
        // 新增模式 - 使用插入接口
        const insertData = {
          labelName: formData.labelName,
          labelAlias: formData.labelAlias,
          labelDescription: formData.labelDescription
        };
        await useLabelApi.insert(insertData);
      }
      
      ElMessage.success(isEdit.value ? '标签更新成功' : '标签添加成功');
      router.back();
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新标签失败' : '添加标签失败');
    } finally {
      loading.value = false;
    }
  });
};

onMounted(() => {
  if (isEdit.value) {
    fetchTagDetail();
  }
});
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