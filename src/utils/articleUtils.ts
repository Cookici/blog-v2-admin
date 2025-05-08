// src/utils/articleUtils.ts

/**
 * 获取文章状态对应的标签类型
 * @param status 状态字符串 (e.g., 'under_audit', 'published', 'deleted')
 * @returns Element Plus 标签的 type 字符串
 */
export const getStatusTagType = (status: string): string => {
    if (status === 'deleted') return ''; // 'deleted' 状态使用默认标签样式
    switch (status) {
        case 'under_audit': return 'info';
        case 'failed_audit': return 'danger';
        case 'published': return 'success';
        default: return 'info'; // 未知状态也使用 'info'
    }
};

/**
 * 获取文章状态的文本描述
 * @param statusValue 文章状态值
 * @param isDeleted 是否已删除 (0: 未删除, 1: 已删除)
 * @returns 状态的文本描述
 */
export const getStatusText = (statusValue: string, isDeleted: number): string => {
    if (isDeleted === 1) return '已删除';
    switch (statusValue) {
        case 'under_audit': return '待审核';
        case 'failed_audit': return '审核未通过';
        case 'published': return '已发布';
        default: return '未知状态';
    }
};