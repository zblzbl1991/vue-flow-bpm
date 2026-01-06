<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1>BPMN Workflow Editor</h1>
        <p class="subtitle">Create and export BPMN 2.0 workflows</p>
      </div>
      <nav class="header-nav">
        <router-link to="/editor" class="nav-link" active-class="active">
          Editor
        </router-link>
        <router-link to="/testing" class="nav-link" active-class="active">
          Testing
        </router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Router is configured in src/router/index.ts
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  color: #495057;
  background: #f8f9fa;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  background: white;
  border-bottom: 1px solid #dee2e6;
  padding: 16px 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #6c757d;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #495057;
}

.nav-link.active {
  background: #e7f5ff;
  color: #1971c2;
  border-color: #1971c2;
}

.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 13px;
  color: #6c757d;
}

.app-main {
  flex: 1;
  overflow: hidden;
}
</style>
