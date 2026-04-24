<template>
  <section class="manager-page-card">
    <header class="page-card-header">
      <h1>用户管理</h1>
    </header>

    <main class="page-card-body">
      <p class="page-ready">用户管理页面</p>
    </main>
  </section>
</template>

<style scoped lang="scss">
.manager-page-card {
  display: grid;
  grid-template-rows: 70px minmax(0, 1fr);
  height: 100%;
  overflow: hidden;
  color: #001b44;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 18px 50px rgba(0, 15, 42, 0.18);
}

.page-card-header {
  display: flex;
  align-items: center;
  padding: 0 30px;
  border-bottom: 1px solid #e8eef7;

  h1 {
    margin: 0;
    font-size: 25px;
    font-weight: 800;
  }
}

.page-card-body {
  min-height: 0;
  padding: 24px 30px;
  overflow: auto;
}

.page-ready {
  margin: 0;
  color: #6b7280;
}
</style>
