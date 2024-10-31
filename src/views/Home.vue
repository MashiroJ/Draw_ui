<template>
    <div class="home">
      <h1>欢迎, {{ user.name }}</h1>
      <div class="user-profile">
        <img :src="user.avatar" alt="User Avatar" class="avatar" />
        <input type="file" @change="updateAvatar" />
        <button @click="changePassword">更改密码</button>
      </div>
      <p>{{ message }}</p>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  
  export default {
    name: "Home",
    setup() {
      // 静态用户数据
      const user = ref({
        name: "张三",
        avatar: "https://via.placeholder.com/150", // 默认头像
        password: "123456",
      });
  
      // 提示信息
      const message = ref("");
  
      // 更新头像
      const updateAvatar = (event) => {
        const file = event.target.files[0];
        if (file) {
          user.value.avatar = URL.createObjectURL(file);
          message.value = "头像更新成功！";
        }
      };
  
      // 更改密码（这里只是一个示例）
      const changePassword = () => {
        // 模拟密码更改操作
        const newPassword = prompt("请输入新密码：", "");
        if (newPassword) {
          user.value.password = newPassword;
          message.value = "密码更改成功！";
        }
      };
  
      return {
        user,
        message,
        updateAvatar,
        changePassword,
      };
    },
  };
  </script>
  
  <style scoped>
  .home {
    text-align: center;
  }
  
  .user-profile {
    margin-top: 20px;
  }
  
  .avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
  }
  </style>
  