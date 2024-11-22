import request from '@/utils/request';

/**
 * 点赞/取消点赞
 * @param {number} drawId - 绘画的 ID
 * @returns {Promise} - 返回一个包含请求结果的 Promise 对象
 */
export const toggleLike = (drawId) => {
    return request.post(`/system/draw/like/${drawId}/like-toggle`);
};

/**
 * 获取点赞数
 * @param {number} drawId - 绘画的 ID
 * @returns {Promise} - 返回一个包含点赞数的 Promise 对象
 */
export const getLikeCount = (drawId) => {
    return request.get('/system/draw/like/count', { params: { drawId } });
};
