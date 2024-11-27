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

// 更新菜单状态
export const updateMenuStatus = (id, status) => {
	return request.put('/system/menu/updateStatus', { id, status });
};

// 更新菜单可见性
export const updateMenuVisible = (id, isVisible) => {
	return request.put('/system/menu/updateVisible', { id, isVisible });
};