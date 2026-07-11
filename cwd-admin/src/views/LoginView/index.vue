<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-icon"></div>
        <div class="login-subtitle">
          <h1 class="login-title">CWD</h1>
          - 简洁的自托管评论系统管理面板
        </div>
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-item">
            <label class="form-label">管理员账号</label>
            <input
              v-model="name"
              class="form-input"
              type="text"
              autocomplete="username"
            />
          </div>
          <div class="form-item">
            <label class="form-label">密码</label>
            <div class="form-input-wrapper">
              <input
                v-model="password"
                class="form-input"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <PhEye v-if="!showPassword" :size="16" />
                <PhEyeSlash v-else :size="16" />
              </button>
            </div>
          </div>
          <div v-if="error" class="form-error">{{ error }}</div>
          <button class="form-button" type="submit" :disabled="submitting">
            <span v-if="submitting">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>
      </div>
    </div>
    <div class="login-bg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginAdmin } from "../../api/admin";

const router = useRouter();
const defaultAdminName = (import.meta.env.VITE_ADMIN_NAME || "").trim();
const defaultAdminPassword = (import.meta.env.VITE_ADMIN_PASSWORD || "").trim();
const name = ref(defaultAdminName);
const password = ref(defaultAdminPassword);
const showPassword = ref(false);
const submitting = ref(false);
const error = ref("");

async function handleSubmit() {
  if (!name.value || !password.value) {
    error.value = "请输入账号和密码";
    return;
  }
  error.value = "";
  submitting.value = true;
  try {
    await loginAdmin(name.value, password.value);
    router.push({ name: "comments" });
  } catch (e: any) {
    error.value = e.message || "登录失败";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="less">
@import "../../styles/components/login.less";
</style>
