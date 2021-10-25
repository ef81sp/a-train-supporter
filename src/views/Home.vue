<template>
  <div class="home">
    <div
      class="flex flex-column justify-content-center align-items-center"
      v-if="false"
    >
      <MeasureNeccesaryTime class="card" />
    </div>
    <div class="card">
      <Diagram />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import Diagram from "@/components/Diagram.vue";

export default defineComponent({
  name: "Home",
  components: {
    // HelloWorld,
    Diagram,
  },
});
</script>

<style scoped>
.card {
  min-width: 70%;
}
</style>
