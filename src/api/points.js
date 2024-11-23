import request from '@/utils/request';

// 签到获取积分
export const signIn = () => {
    return request.post('/system/points/signIn');
};

// 查询当前用户积分
export const getPoints = () => {
    return request.get('/system/points/getPoints');
};
