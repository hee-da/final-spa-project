import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MovieDetailView from '@/views/MovieDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/movies',
      name: 'movies',
      component: () => import('@/views/MoviesView.vue'),
    },
    {
      path: '/movies/:id',
      name: 'movie-detail',
      component: MovieDetailView,
    },
  ],
});

export default router;