import request from '@/utils/request';  

// 查询所有绘图记录  
export const listAllDrawRecords = () => {  
    return request.get('/system/draw/record/list');  
};  

// 根据点赞数量排序绘图记录  
export const listDrawRecordsSortedByLikes = () => {  
    return request.get('/system/draw/record/list/sorted');  
};  

// 根据创建时间排序绘图记录  
export const listDrawRecordsSortedByLatest = () => {  
    return request.get('/system/draw/record/list/latest');  
};  

// 更新绘图记录可见性  
export const updateDrawRecordVisibility = (id, isPublic) => {  
    return request.put(`/system/draw/record/visibility/${id}`, null, { params: { isPublic } });  
};  

// 删除绘图记录  
export const removeDrawRecord = (id) => {  
    return request.delete(`/system/draw/record/${id}`);  
};

// 根据用户ID查询所有绘图记录  
export const listDrawRecordsByUserId = (userId) => {  
    return request.get(`/system/draw/record/list/user/${userId}`);  
};  