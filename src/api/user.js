import request from '@/utils/request';

// 获取当前登录用户的信息  
export const getUserInfo = () => {
    return request.get('/system/user/userInfo');
};
// 根据Id获取用户的信息  
export const getUserInfoById = (id) => {
    return request.get('/system/user/userInfoById', { params: { id } });
};

// 分页查询用户信息  
export const getUserList = (params) => {
    return request.get('/system/user/page', { params });
};

// 新增用户信息  
export const addUser = (userData) => {
    return request.post('/system/user/save', userData);
};

// 更新用户信息  
export const updateUser = (userData) => {
    return request.patch('/system/user/updateUser', userData);
};

// 根据用户ID删除用户  
export const deleteUser = (id) => {  // 修改参数名为 id  
    return request.delete('/system/user/deleteById', { params: { id } });
};

// 更新当前登录用户的头像  
export const updateAvatar = (avatarUrl) => {
    return request.patch('/system/user/updateAvatar', null, { params: { avatarUrl } });
};

// 更新用户状态  
export const updateUserStatus = (id, status) => {  // 修改参数名为 id  
    return request.post(`/system/user/updateStatus`, null, { params: { id, status } });
};

// 为用户分配角色  
export const grantUserRole = (id, roleId) => {  // 修改参数名为 id  
    return request.post('/system/user/grantRole', null, { params: { userId: id, roleId } });
};

// 删除用户的指定角色  
export const deleteUserRole = (id, roleId) => {  // 修改参数名为 id  
    return request.delete('/system/user/deleteRole', { params: { userId: id, roleId } });
};

// 查询用户拥有的角色  
export const getUserRoles = (id) => {  // 修改参数名为 id  
    return request.get('/system/user/getRoleIdsByUserId', { params: { userId: id } });
};

// 查询用户拥有的菜单  
export const getUserMenus = (id) => {  // 修改参数名为 id  
    return request.get('/system/user/getMenuIdsByUserId', { params: { userId: id } });
};

// 查询用户拥有的权限  
export const getUserPermissions = (id) => {  // 修改参数名为 id  
    return request.get('/system/user/getPermissions', { params: { userId: id } });
};

/**
 * 修改当前用户的密码
 * @param {Object} updatePasswordDto - 包含旧密码、新密码和确认密码的对象
 * @param {string} updatePasswordDto.oldPassword - 用户的原始密码
 * @param {string} updatePasswordDto.newPassword - 用户的新密码
 * @param {string} updatePasswordDto.confirmPassword - 用户确认的新密码
 * @returns {Promise} - 返回一个 Promise 对象，包含请求的响应
 */
export const updatePassword = (updatePasswordDto) => {
    return request.post('/system/user/updatePassword', updatePasswordDto);
};