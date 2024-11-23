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

/**  
 * 超级文生图提交任务  
 * @param {Object} drawDto - 绘图参数对象  
 * @param {number} imageSize - 图片尺寸参数（整数代码）  
 * @param {number} checkpoint - 检查点参数（整数代码）  
 * @param {number} sampler - 采样器参数（整数代码）  
 * @param {number} scheduler - 调度器参数（整数代码）  
 * @returns {Promise} - 返回一个包含请求结果的 Promise 对象  
 */
export const superText2img = (drawDto, imageSize, checkpoint, sampler, scheduler) => {
    const requestData = {
        drawDto: {
            prompt: String(drawDto.prompt || ''),
            negativePrompt: String(drawDto.negativePrompt || ''),
            steps: parseInt(drawDto.steps) || 20,
            cfg: parseFloat(drawDto.cfg) || 7,
            denoise: parseFloat(drawDto.denoise) || 0.7,
            isPublic: drawDto.isPublic ?? 1
        },
        imageSize: parseInt(imageSize),
        checkpoint: parseInt(checkpoint),
        sampler: parseInt(sampler),
        scheduler: parseInt(scheduler)
    };
    return request.post('/system/super/draw/text2img', requestData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const superImg2img = (drawDto, imageSize, checkpoint, sampler, scheduler, uploadImage) => {
    const formData = new FormData();
    // 将 drawDto 的属性逐一添加到 FormData 中
    formData.append('prompt', String(drawDto.prompt || ''));
    formData.append('negativePrompt', String(drawDto.negativePrompt || ''));
    formData.append('steps', parseInt(drawDto.steps) || 20);
    formData.append('cfg', parseFloat(drawDto.cfg) || 7);
    formData.append('denoise', parseFloat(drawDto.denoise) || 0.7);
    formData.append('isPublic', drawDto.isPublic ?? 1);
    // 添加其他参数
    formData.append('imageSize', parseInt(imageSize));
    formData.append('checkpoint', parseInt(checkpoint));
    formData.append('sampler', parseInt(sampler));
    formData.append('scheduler', parseInt(scheduler));
    if (uploadImage) {
        formData.append('uploadImage', uploadImage);
    } else {
        // 如果没有上传图片，提示错误  
        return Promise.reject(new Error('请上传一张图片'));
    }
    return request.post('/system/super/draw/img2img', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};



