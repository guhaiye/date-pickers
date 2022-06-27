<template>
  <div>
    <DatePickers
          name="declareDate"
          type="monthrange"
          placeholder="请选择期间"
          style="width: 100%"
          format="yyyy-MM"
          :clearable = "false"
      />
  </div>
</template>

<script>
import DatePickers from './components'

export default {
  name: 'App',
  components: {
    DatePickers
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
