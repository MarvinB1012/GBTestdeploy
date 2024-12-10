<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMsal } from '../services/useMsal';

const props = defineProps({
  requireAuth: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const { isInitialized, account, checkAccount, login } = useMsal();

const checkAuthentication = async () => {
  if (props.requireAuth && !(await checkAccount())) {
    await login();
  }
};

onMounted(async () => {
  await checkAuthentication();
});

watch(isInitialized, async (newValue) => {
  if (newValue) {
    await checkAuthentication();
  }
});
</script>

<template>
  <slot v-if="!props.requireAuth || account"></slot>
</template>
