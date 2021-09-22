<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" /> -->
    <div class="flex flex-column justify-content-center align-items-center">
      <MeasureNeccesaryTime class="card" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import MeasureNeccesaryTime from "@/components/MeasureNecessaryTime.vue";

export default defineComponent({
  name: "Home",
  components: {
    // HelloWorld,
    MeasureNeccesaryTime,
  },
});
</script>

<style scoped>
.card {
  width: 70%;
}
</style>