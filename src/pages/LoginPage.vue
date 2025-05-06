<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg shadow-2" style="min-width: 300px; max-width: 400px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input filled v-model="username" label="Email" type="email" class="q-mb-md" />
        <q-input filled v-model="password" label="Password" type="password" class="q-mb-md" />

        <q-btn label="Login" color="primary" @click="login" :loading="loading" class="full-width" />
      </q-card-section>

      <q-card-section v-if="errorMessage" class="text-negative">
        {{ errorMessage }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from 'src/utils/api';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);

const router = useRouter();

const login = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const res = await api.post('auth/login', {
      username: username.value,
      password: password.value,
    });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);

      await router.push('/orders');
    } else {
      errorMessage.value = 'Login failed: No token received.';
    }
  } catch (err) {
    console.log('err', err);
    errorMessage.value = 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>
