<script setup>
import { ref, computed, watch } from 'vue';
import { onMounted } from 'vue';
import { useMovieStore } from '../stores/movieStore.js';

const store = useMovieStore();

// 현재 선택된 정렬 기준을 저장하는 상태 (기본값: 정렬 안 함 = 스토어 원본 순서)
const sortBy = ref('default');

// store.movies는 절대 직접 건드리지 않고, slice()로 복사본을 만들어서 그 위에 sort() 적용
const sortedMovies = computed(() => {
    const moviesCopy = store.movies.slice();

    if (sortBy.value === 'title') {
        // 제목 가나다순 (한글 비교는 localeCompare로)
        return moviesCopy.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }

    if (sortBy.value === 'release_date') {
        // 개봉일 최신순 (날짜 문자열을 Date로 바꿔서 비교, 최근 날짜가 앞으로)
        return moviesCopy.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    }

    if (sortBy.value === 'rating') {
        // 평점 높은순
        return moviesCopy.sort((a, b) => b.vote_average - a.vote_average);
    }

    // 기본값: 정렬 안 함 (스토어가 내려준 인기순 그대로)
    return moviesCopy;
});

onMounted(() => {
    store.fetchMovies();
    document.title = '🍿 국내 극장 화제작 (인기순)';
});

const itemsPerPage = 5; // 한 페이지당 보여줄 영화 개수
const currentPage = ref(1);

const totalPages = computed(() => {
    const total = sortedMovies.value.length;
    const remainder = total % itemsPerPage;
    const wholePages = (total - remainder) / itemsPerPage;
    return remainder > 0 ? wholePages + 1 : wholePages;
});

const pageNumbers = computed(() => {
    const numbers = [];
    for (let i = 1; i <= totalPages.value; i++) {
        numbers.push(i);
    }
    return numbers;
});

const paginatedMovies = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedMovies.value.slice(startIndex, endIndex);
});

const goToPage = (pageNumber) => {
    currentPage.value = pageNumber;
};

// 정렬 기준이 바뀌면 순서가 바뀌니까 1페이지로 되돌림
watch(sortBy, () => {
    currentPage.value = 1;
});
</script>

<template>
    <main class="page">
        <div class="header-section">
            <h1>🍿 국내 극장 화제작 (인기순)</h1>
            <p class="sub-title">2025년 이후 국내 정식 개봉한 실시간 인기 상영작</p>
        </div>

        <div class="sort-bar">
            <button
                @click="sortBy = 'default'"
                :class="{ active: sortBy === 'default' }"
                class="sort-btn"
            >인기순</button>
            <button
                @click="sortBy = 'title'"
                :class="{ active: sortBy === 'title' }"
                class="sort-btn"
            >제목순</button>
            <button
                @click="sortBy = 'release_date'"
                :class="{ active: sortBy === 'release_date' }"
                class="sort-btn"
            >개봉일순</button>
            <button
                @click="sortBy = 'rating'"
                :class="{ active: sortBy === 'rating' }"
                class="sort-btn"
            >평점순</button>
        </div>

        <div v-if="store.isLoading" class="status-message loading">
            ⏳ 실시간 국내 개봉작 데이터를 싣고 오는 중입니다...
        </div>

        <div v-else-if="store.errorMessage" class="status-message error">
            🚨 {{ store.errorMessage }}
        </div>

        <div v-else>
            <div class="movie-list">
                <div v-for="movie in paginatedMovies" :key="movie.id" class="movie-card">
                    <img
                        v-if="movie.poster_path"
                        :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                        :alt="movie.title"
                        class="poster"
                    />
                    <div v-else class="poster-placeholder">이미지 준비 중</div>
                    <div class="card-content">
                        <h3 class="title">{{ movie.title }}</h3>
                        <p class="release-date" v-if="movie.release_date">📆 개봉일: {{ movie.release_date }}</p>
                        <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }} / 10</p>
                        <p class="overview">
                            {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '국내에 등록된 줄거리 요약 정보가 없습니다.'}}
                        </p>
                        <button
                            @click="store.toggleFavorite(movie.id)"
                            :class="{ active: movie.isFavorite }"
                            class="fav-btn"
                        >
                            {{  movie.isFavorite ? '💔 찜 해제' : '🤍 찜하기' }}
                        </button>
                    </div>
                    <RouterLink
                        :to="`/movies/${movie.id}`"
                        class="stretched-link"
                        :aria-label="`${movie.title} 상세 정보 보기`"
                    ></RouterLink>
                </div>
            </div>

            <div class="pagination-bar" v-if="totalPages > 1">
                <button
                    v-for="page in pageNumbers"
                    :key="page"
                    @click="goToPage(page)"
                    :class="{ active: currentPage === page }"
                    class="page-btn"
                >{{ page }}</button>
            </div>
        </div>
    </main>
</template>

<style scoped>
.page {
    padding: 40px;
    background-color: #f8f9fa;
    min-height: 100vh;
}
.header-section {
    text-align: center;
    margin-bottom: 30px;
    color: #2c3e50;
}
.sub-title { 
    color: #7f8c8d;
    font-size: 14px;
    margin-top: 5px;
}
.sort-bar {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
}
.sort-btn {
    padding: 8px 18px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    color: #555;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
}
.sort-btn:hover {
    background: #f1f2f6;
}
.sort-btn.active {
    background: #2c3e50;
    color: white;
    border-color: #2c3e50;
}
.status-message {
    text-align: center;
    border-radius: 23px;
    font-size: 20px;
    font-weight: bold;
    padding: 50px;
}
.loading {
    color: #3498db;
    background-color: #e3f2fd;
}
.error {
    color: #e74c3c;
    background-color: #fdeaea;
}
.movie-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 30px;
}
.movie-card {
    position: relative;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease;
    text-align: left;
}
.movie-card:hover {
    transform: translateY(-5px);
}
.poster {
    width: 100%;
    height: 380px;
    object-fit: cover;
}
.poster-placeholder {
    width: 100%;
    height: 380px;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    font-weight: bold;
}
.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.title {
    font-size: 18px;
    margin: 0 0 6px 0;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
}
.release-date {
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 10px;
    font-size: 16px;
}
.overview {
    font-size: 13px;
    color: #555;
    flex-grow: 1;
    margin-bottom: 20px;
    line-height: 1.4;
}
.fav-btn {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 12px;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    background: #ecf0f1;
    color: #333;
    font-weight: bold;
    font-size: 14px;
    transition: 0.3s;
    margin-top: auto;
}
.fav-btn.active {
    background: #ff4757;
    color: white;
}
.stretched-link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}
.pagination-bar {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 40px;
}
.page-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    border-radius: 50%;
    background: white;
    color: #555;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
}
.page-btn:hover {
    background: #f1f2f6;
}
.page-btn.active {
    background: #2c3e50;
    color: white;
    border-color: #2c3e50;
}
</style>