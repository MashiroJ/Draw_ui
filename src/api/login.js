import request from '@/utils/request';

// 获取验证码服务
export const getCaptchaService = () => {
	return request.get('/system/login/captcha')
		.then(data => data) // 由于拦截器已经处理了response.data，这里直接返回data
		.catch(error => {
			console.error('获取验证码失败:', error);
			throw error;
		});
};

// 注册服务
export const userRegisterService = (registerData) => {
	return request.post('/system/login/register', registerData);
};

// 登录服务
export const userLoginService = (loginData) => {
	return request.post('/system/login', loginData);
};