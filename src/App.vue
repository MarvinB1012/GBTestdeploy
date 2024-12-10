<script>
import Navbar from './components/Navbar.vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    return { route, router };
  }
}
</script>

<template>
  <navbar v-if="!route.meta.hideNavbar"/>
  <RouterView />
</template>

<style>
#app {
  padding-top: 100px;
  max-height: 100vh;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
}

#app:has(.login-view){
  padding-top: 0;
}
</style>