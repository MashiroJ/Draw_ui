import request from '@/utils/request';

/**
 * 文生图提交任务
 * @param {Object} drawDto - 绘图参数对象
 * @returns {Promise} - 返回一个包含请求结果的 Promise 对象
 */
export const text2img = (drawDto) => {
    return request.post('/system/draw/text2img', drawDto);
};

/**
 * 图生图提交任务
 * @param {Object} drawDto - 绘图参数对象
 * @param {File} uploadImage - 可选的上传图片文件
 * @returns {Promise} - 返回一个包含请求结果的 Promise 对象
 */
export const img2img = (drawDto, uploadImage) => {
    const formData = new FormData();
    formData.append('drawDto', JSON.stringify(drawDto));
    if (uploadImage) {
        formData.append('uploadImage', uploadImage);
    }
    return request.post('/system/draw/img2img', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
