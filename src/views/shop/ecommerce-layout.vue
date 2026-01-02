<template>
  <div class="main-wrapper">
    <!-- Header -->
    <layouts-header></layouts-header>

    <!-- Sidebar -->
    <layouts-sidebar></layouts-sidebar>

    <!-- Page Wrapper -->
    <div class="page-wrapper">
      <div class="content">
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>{{ pageTitle }}</h4>
              <h6>{{ pageSubtitle }}</h6>
            </div>
          </div>
        </div>

        <!-- Contenido de la página -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EcommerceLayout',
  props: {
    pageTitle: {
      type: String,
      default: 'Tienda en Línea'
    },
    pageSubtitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.page-wrapper {
  margin-left: 260px;
  padding-top: 60px;
}

.content {
  padding: 20px;
}
</style>
