<script setup>
import { ref, computed, watch } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useRouter, useRoute } from 'vue-router';
import { useMovieStore } from './stores/movieStore.js';

const store = useMovieStore();
const router = useRouter();
const route = useRoute();

const searchKeyword = ref('');
const showSearchWarning = ref(false);

const handleSearch = () => {
    if (searchKeyword.value.trim() === '') {
        showSearchWarning.value = true;
        return;
    }
    showSearchWarning.value = false;
    router.push({ name: 'search', query: { q: searchKeyword.value } });
};

watch(searchKeyword, () => {
    showSearchWarning.value = false;
});

watch(() => route.path, (newPath) => {
    if (newPath === '/') {
        searchKeyword.value = '';
    }
});

const totalFavoritesCount = computed(() => {
  return store.favorites.length;
});

const averageFavoritesRating = computed(() => {
  if (store.favorites.length === 0) {
    return '0.0';
  }
  const totalRatingSum = store.favorites.reduce((accumulator, movie) => {
    return accumulator + movie.vote_average;
  }, 0);
  const calculatedAverage = totalRatingSum / store.favorites.length;
  return calculatedAverage.toFixed(1);
});
</script>

<template>
  <div class="app-container">
    <header class="main-header">
      <div class="header-content">
        <RouterLink to="/" class="logo-zone">
          <span class="logo-icon">🍿</span>
          <h1 class="logo-text">NETVUE</h1>
        </RouterLink>
        <nav class="nav-menu">
          <RouterLink to="/" class="nav-item">홈</RouterLink>
          <RouterLink to="/movies" class="nav-item">영화 목록</RouterLink>
        </nav>
        <div class="search-wrapper">
            <div class="search-box">
                <input
                    v-model="searchKeyword"
                    @keyup.enter="handleSearch"
                    type="text"
                    placeholder="영화 제목 검색"
                    class="search-input"
                />
                <button @click="handleSearch" class="search-btn">🔍</button>
            </div>
            <p v-if="showSearchWarning" class="search-warning">검색어를 입력해주세요</p>
        </div>
        <div class="header-dashboard">
          <RouterLink to="/favorites" class="dashboard-badge favorite-count">
            <span class="badge-label">❤️ 찜한 작품</span>
            <span class="badge-value">{{ totalFavoritesCount }}개</span>
          </RouterLink>
          <div class="dashboard-badge average-rating">
            <span class="badge-label">⭐ 평균 평점</span>
            <span class="badge-value">{{ averageFavoritesRating }} / 10</span>
          </div>
        </div>
      </div>
    </header>
    <main class="main-content">
     <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  font-family: "Noto Sans KR", sans-serif;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-header {
  background-color: #1e272e;
  color: #ffffff;
  padding: 0 40px;
  position: sticky;
  top: 0 ;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}
.logo-zone {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #ffffff;
}
.logo-icon {
  font-size: 28px;
}
.logo-text {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(45deg, #ff4757, #ff6b81);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav-menu {
  display: flex;
  gap: 30px;
}
.nav-item {
  color: #ced5e0;
  text-decoration: none;
  font-size: 16px;
  font-weight: 700;
  transition: color 0.2s ease;
  padding: 8px 12px;
  border-radius: 6px;
}
.nav-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}
.router-link-active.nav-item {
  color: #ff4757;
  background-color: rgba(255, 87, 87, 0.1);
}
.header-dashboard {
  display: flex;
  gap: 15px;
}
.dashboard-badge {
  background-color: #2f3542;
  padding: 10px 16px;
  border-radius: 30px;
  display: flex;
  gap: 8px;
  border: 1px solid #3f4656;
  align-items: center;
  text-decoration: none;
  cursor: default;
}
.favorite-count {
  cursor: pointer;
}
.badge-label {
  font-size: 13px;
  color: #a4b0be;
  font-weight: 500;
}
.badge-value {
  font-size: 14px;
  color: #ffffff;
  font-weight: 800;
}
.average-rating .badge-value {
  color: #e1b12c;
}
.main-content {
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
}
.search-box {
  display: flex;
  align-items: center;
  background: #2f3542;
  border-radius: 20px;
  border: 1px solid #3f4656;
  padding: 4px 4px 4px 14px;
}
.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 14px;
  width: 160px;
}
.search-input::placeholder {
  color: #747d8c;
}
.search-btn {
  background: #ff4757;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: white;
  cursor: pointer;
  font-size: 13px;
}
.search-wrapper {
  position: relative;
}
.search-warning {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: #ff4757;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  animation: fadeInDown 0.2s ease;
}
.search-warning::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #ff4757;
}
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate(-50%, -5px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>