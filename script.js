// Add at the top of the file
const GOOGLE_API_KEY = 'AIzaSyCxDFR6PdQyDZGD7OH9rIasG6uqYJX3a6o';
const SEARCH_ENGINE_ID = '9759d47768c8646c5';

// Translations object
const translations = {
    'ru': {
        search: 'Поиск...',
        settings: 'Настройки',
        language: 'Язык',
        theme: 'Тема',
        light: 'Светлая',
        dark: 'Тёмная',
        browser: 'SakBrowser',
        result: 'Результат',
        noResults: 'Результатов не найдено',
        searchError: 'Произошла ошибка при поиске',
        languages: {
            ru: 'Русский',
            en: 'Английский',
            ko: 'Корейский'
        }
    },
    'en': {
        search: 'Search...',
        settings: 'Settings',
        language: 'Language',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        browser: 'SakBrowser',
        result: 'Result',
        noResults: 'No results found',
        searchError: 'An error occurred during search',
        languages: {
            ru: 'Russian',
            en: 'English',
            ko: 'Korean'
        }
    },
    'ko': {
        search: '검색...',
        settings: '설정',
        language: '언어',
        theme: '테마',
        light: '라이트',
        dark: '다크',
        browser: '삭브라우저',
        result: '결과',
        noResults: '검색 결과가 없습니다',
        searchError: '검색 중 오류가 발생했습니다',
        languages: {
            ru: '러시아어',
            en: '영어',
            ko: '한국어'
        }
    }
};

// DOM Elements
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const themeSelect = document.getElementById('themeSelect');
const languageSelect = document.getElementById('languageSelect');
const searchInput = document.getElementById('searchInput');
const searchButton = document.querySelector('.search-button');
const browserName = document.querySelector('.logo, .logo-small');

// Event Listeners
settingsButton.addEventListener('click', toggleSettings);
themeSelect.addEventListener('change', toggleTheme);
languageSelect.addEventListener('change', changeLanguage);
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Pagination event listeners
document.addEventListener('DOMContentLoaded', () => {
    const pageButtons = document.querySelectorAll('.page-btn');
    if (pageButtons.length > 0) {
        pageButtons.forEach(btn => {
            btn.addEventListener('click', () => handlePageChange(btn));
        });
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Functions
function toggleSettings() {
    if (settingsModal.style.display === 'flex') {
        settingsModal.style.display = 'none';
    } else {
        settingsModal.style.display = 'flex';
    }
}

function toggleTheme() {
    document.body.setAttribute('data-theme', themeSelect.value);
    saveSettings();
}

function changeLanguage() {
    const lang = languageSelect.value;
    document.documentElement.lang = lang;
    
    // Обновляем все тексты на странице
    const t = translations[lang];
    
    // Обновляем заголовок настроек
    const settingsTitle = document.querySelector('.settings-title');
    if (settingsTitle) settingsTitle.textContent = t.settings;
    
    // Обновляем лейблы настроек
    const languageLabel = document.querySelector('.language-label');
    const themeLabel = document.querySelector('.theme-label');
    if (languageLabel) languageLabel.textContent = t.language + ':';
    if (themeLabel) themeLabel.textContent = t.theme + ':';
    
    // Обновляем плейсхолдер поиска
    if (searchInput) searchInput.placeholder = t.search;
    
    // Обновляем опции языка
    const languageOptions = languageSelect.options;
    languageOptions[0].text = t.languages.ru;
    languageOptions[1].text = t.languages.en;
    languageOptions[2].text = t.languages.ko;
    
    // Обновляем опции темы
    const themeOptions = themeSelect.options;
    themeOptions[0].text = t.light;
    themeOptions[1].text = t.dark;
    
    // Обновляем название браузера
    const logoElements = document.querySelectorAll('.logo, .logo-small');
    logoElements.forEach(logo => {
        if (lang === 'ko') {
            logo.innerHTML = `<span class="pink">삭</span>브라우저`;
        } else {
            logo.innerHTML = `<span class="pink">Sak</span>Browser`;
        }
    });
    
    // Обновляем результаты поиска, если они есть
    const resultItems = document.querySelectorAll('.result-item');
    if (resultItems.length > 0) {
        resultItems.forEach((item, index) => {
            item.textContent = `${t.result} ${index + 1}`;
        });
    }
    
    // Проверяем наличие сообщения об отсутствии результатов
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        noResults.textContent = t.noResults;
    }
    
    // Проверяем наличие сообщения об ошибке
    const error = document.querySelector('.error');
    if (error) {
        error.textContent = t.searchError;
    }
    
    // Сохраняем настройки
    saveSettings();
}

function handlePageChange(clickedButton) {
    // Remove active class from all buttons
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    clickedButton.classList.add('active');
    
    // Get the page number
    const page = parseInt(clickedButton.textContent);
    
    // Update results based on page
    const resultItems = document.querySelectorAll('.result-item');
    const lang = languageSelect.value;
    const t = translations[lang];
    
    resultItems.forEach((item, index) => {
        const resultNumber = (page - 1) * 4 + (index + 1);
        item.textContent = `${t.result} ${resultNumber}`;
    });
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    if (window.location.pathname.includes('search.html')) {
        // Если мы уже на странице поиска, выполняем поиск
        await fetchSearchResults(query);
    } else {
        // Если мы на главной, переходим на страницу поиска
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

async function fetchSearchResults(query, startIndex = 1) {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&start=${startIndex}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            displaySearchResults(data.items);
            updatePagination(data.queries);
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error('Search error:', error);
        displayError();
    }
}

function displaySearchResults(items) {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    
    items.forEach(item => {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <a href="${item.link}" target="_self" class="result-title">${item.title}</a>
            <div class="result-url">${item.displayLink}</div>
            <div class="result-snippet">${item.snippet}</div>
        `;
        resultsContainer.appendChild(resultElement);
    });
}

function updatePagination(queries) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    const currentPage = Math.floor(queries.request[0].startIndex / 10) + 1;
    const totalResults = Math.min(queries.request[0].totalResults, 100); // Google ограничивает до 100 результатов
    const totalPages = Math.ceil(totalResults / 10);

    paginationContainer.innerHTML = '';
    
    // Отображаем страницы в диапазоне от 1 до totalPages
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `page-btn${i === currentPage ? ' active' : ''}`;
        button.textContent = i;
        button.addEventListener('click', () => {
            const startIndex = (i - 1) * 10 + 1;
            const urlParams = new URLSearchParams(window.location.search);
            fetchSearchResults(urlParams.get('q'), startIndex);
        });
        paginationContainer.appendChild(button);
    }
}

function displayNoResults() {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;

    const lang = languageSelect.value;
    const t = translations[lang];
    resultsContainer.innerHTML = `<div class="no-results">${t.noResults}</div>`;
}

function displayError() {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) return;

    const lang = languageSelect.value;
    const t = translations[lang];
    resultsContainer.innerHTML = `<div class="error">${t.searchError}</div>`;
}

// Initialize settings and search on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    // Check if we're on search page and have a query
    if (window.location.pathname.includes('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            searchInput.value = query;
            fetchSearchResults(query);
        }
    }
});

function saveSettings() {
    const settings = {
        theme: themeSelect.value,
        language: languageSelect.value
    };
    localStorage.setItem('browser_settings', JSON.stringify(settings));
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('browser_settings') || '{}');
    
    if (settings.theme) {
        themeSelect.value = settings.theme;
        document.body.setAttribute('data-theme', settings.theme);
    }
    if (settings.language) {
        languageSelect.value = settings.language;
        changeLanguage(); // Call to update text with saved language
    }
}
