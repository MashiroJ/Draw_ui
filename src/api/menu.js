import request from '@/utils/request';
// 获取菜单列表
export const useMenuListService = (registerData) => {
	return request.get('/system/menu/list', registerData);
};