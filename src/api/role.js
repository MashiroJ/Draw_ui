import request from '@/utils/request';

/** 
 * 获取角色列表
 * @returns
 */
export const getRoleList = () => {
    return request.get(`/system/role/list`);
}