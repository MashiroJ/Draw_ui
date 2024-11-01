import request from '@/utils/request';

// 获取角色列表
export const getRoleList = () => {
    return request.get('/system/role/list');
};

// 保存或更新角色并关联菜单
export const saveOrUpdateRole = (roleData) => {
    return request.post('/system/role/saveOrUpdate', roleData);
};

// 删除角色
export const deleteRole = (id) => {
    return request.delete('/system/role/removeById', { params: { id } });
};

// 查询当前角色所拥有的菜单
export const getMenuIdsByRoleId = (roleId) => {
    return request.get('/system/role/getMenuIdsByRoleId', { params: { roleId } });
};

// 更新角色状态
export const updateRoleStatus = (id, status) => {
    return request.post('/system/role/updateStatus', null, { params: { id, status } });
};
