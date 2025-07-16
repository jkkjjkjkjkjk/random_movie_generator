const API_KEY = '29000fd4bc84d644110b86ca5b66e75d';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const ORIGINAL_IMAGE_URL = 'https://image.tmdb.org/t/p/original';
const MAX_PAGE = 300;
const MAX_ATTEMPTS = 20;

const titleElement = document.getElementById('title');
const overviewElement = document.getElementById('overview');
const posterElement = document.getElementById('poster');
const button = document.getElementById('generate-btn');

const genreSelect = document.getElementById('genre-select');
const ratingSelect = document.getElementById('rating-select');

async function fetchMovies(page, genre, rating) {
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&sort_by=popularity.desc&page=${page}&include_adult=false`;
    if (genre) url += `&with_genres=${genre}`;
    if (rating) url += `&vote_average.gte=${rating}`;

    const response = await fetch(url);
    const data = await response.json();
    return data.results.filter(movie => movie.poster_path && movie.overview);
}

async function fetchBackdropUrl(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}`);
        const data = await response.json();
        const backdrops = data.backdrops;
        if (backdrops && backdrops.length > 0) {
            const randomBackdrop = backdrops[Math.floor(Math.random() * backdrops.length)];
            return ORIGINAL_IMAGE_URL + randomBackdrop.file_path;
        }
    } catch (error) {
        console.error('Ошибка загрузки backdrop:', error);
    }
    return null;
}

function updateBackgroundImage(imageUrl) {
    document.body.style.setProperty('--bg-url', `url(${imageUrl})`);
    document.body.style.backgroundImage = `url(${imageUrl})`;
}

async function getRandomMovieWithRetry() {
    const genre = genreSelect.value;
    const rating = ratingSelect.value;

    let attempt = 0;
    while (attempt < MAX_ATTEMPTS) {
        const randomPage = Math.floor(Math.random() * MAX_PAGE) + 1;

        try {
            const movies = await fetchMovies(randomPage, genre, rating);
            if (movies.length > 0) {
                const randomMovie = movies[Math.floor(Math.random() * movies.length)];
                const posterUrl = IMAGE_URL + randomMovie.poster_path;

                titleElement.textContent = randomMovie.title || 'Без названия';
                overviewElement.textContent = randomMovie.overview || 'Нет описания';
                posterElement.src = posterUrl;
                posterElement.alt = randomMovie.title;

                const backdropUrl = await fetchBackdropUrl(randomMovie.id);
                updateBackgroundImage(backdropUrl || posterUrl);

                return;
            }
        } catch (error) {
            console.error(`Ошибка на попытке ${attempt + 1}:`, error);
        }

        attempt++;
    }

    titleElement.textContent = 'Не найдено';
    overviewElement.textContent = 'Не удалось найти фильм с заданными параметрами.';
    posterElement.src = '';
    posterElement.alt = '';
    updateBackgroundImage('');
}

button.addEventListener('click', getRandomMovieWithRetry);
