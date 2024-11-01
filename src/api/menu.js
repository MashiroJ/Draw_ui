import request from '@/utils/request';
// 获取菜单列表
export const useMenuListService = (registerData) => {
	return request.get('/system/menu/list', registerData);
};

// 保存或更新菜单
export const saveOrUpdateMenu = (menuData) => {
	return request.post('/system/menu/saveOrUpdate', menuData);
};

// 删除菜单
export const deleteMenu = (id) => {
	return request.delete('/system/menu/removeById', { params: { id } });
};