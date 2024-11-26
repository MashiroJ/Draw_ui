import request from '@/utils/request';  

// 添加评论  
export const addComment = (commentData) => {  
    return request.post('/system/comment/add', commentData);  
};  

// 删除评论  
export const deleteComment = (commentId) => {  
    return request.delete(`/system/comment/${commentId}`);  
};  

// 点赞评论  
export const likeComment = (commentId) => {  
    return request.post(`/system/comment/like/${commentId}`);  
};  

// 取消点赞  
export const unlikeComment = (commentId) => {  
    return request.delete(`/system/comment/unlike/${commentId}`);  
};  

// 分页获取评论列表  
export const getCommentPage = (drawId, pageNum = 1, pageSize = 10) => {  
    return request.get(`/system/comment/page/${drawId}`, { params: { pageNum, pageSize } });  
};