<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import companyLogo from '../assets/systecs-logo.png';
import companyVideo from '../assets/companyVideo.mp4';

const router = useRouter();
const isHovered = ref(false);

const handleEnter = () => {
  router.push('/room');  
};
</script>

<template>
  <div id="app" class="login-view">
    <video autoplay muted loop class="background-video">
      <source :src="companyVideo" type="video/mp4" />
      Ihr Browser unterstützt keine Videos.
    </video>
    <div :class="{ 'dark-overlay': isHovered }"></div>
   
    <div class="overlay-content">
      <header class="app-header">
        <img :src="companyLogo" class="header-logo" alt="Company Logo" />
        <p class="slogan">Ihr gesundes Büro</p>
        <link rel="stylesheet" href="https://use.typekit.net/fea8sbd.css">
       
        <button
          class="login-button"
          @mouseover="isHovered = true"
          @mouseleave="isHovered = false"
          @click="handleEnter"
        >
          Anmelden
        </button>
      </header>
    </div>
  </div>
</template>

<style scoped>
body {
  overflow: hidden;
}
.dark-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 0;
  pointer-events: none;
  transition: 0.7s;
}
.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.app-header {
  text-align: center;
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.55);
  border-radius: 45px;
  height: auto;
  min-height: 350px;
  max-height: 350px;
  padding: 3%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.header-logo {
  padding: 0;
  width: 400px;
  height: auto;
}
.slogan {
  font-family: "bruno-ace", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 30px;
  color: #000000;
  margin-top: 10px;
}
.login-button {
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
  height: 70px;
  width: 190px;
  border: none;
  padding: 15px 30px;
  font-size: 24px;
  background-color: #0083bc;
  color: #ffffff;
  border-radius: 45px;
  cursor: pointer;
  transition: background-color 0.5s ease;
}
.login-button:hover {
  background-color: #002b56;
}
</style>