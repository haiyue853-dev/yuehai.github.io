document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileMenu();
    loadArticles();
    initScrollTop();
    initSmoothScroll();
});

function initHeader() {
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', function () {
        navLinks.classList.toggle('active');

        const spans = menuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

async function loadArticles() {
    const grid = document.getElementById('articlesGrid');
    grid.innerHTML = '<div class="loading"></div>';

    try {
        const response = await fetch('articles/articles.json');
        const articles = await response.json();

        if (!articles || articles.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">暂无文章</p>';
            return;
        }

        grid.innerHTML = articles.map(article => `
            <article class="article-card" data-file="${article.file}">
                <div class="article-image-container">
                    <img src="${article.image}" alt="${article.title}" class="article-image" 
                         onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.style.height='200px'; this.style.width='100%'">
                </div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span class="article-date">
                            <i class="fas fa-calendar"></i>
                            ${article.date}
                        </span>
                        <span class="article-tag">${article.tag}</span>
                    </div>
                </div>
            </article>
        `).join('');

        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', function () {
                const file = this.dataset.file;
                openArticle(file);
            });
        });
    } catch (error) {
        console.error('加载文章失败:', error);
        grid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">加载文章失败</p>';
    }
}

async function openArticle(file) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <button class="modal-close">&times;</button>
        <div class="modal-content">
            <div class="modal-body">
                <div class="loading"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(`articles/${file}`);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const title = doc.querySelector('title') ? doc.querySelector('title').textContent : '文章';
        const articleContent = doc.querySelector('article') ? doc.querySelector('article').innerHTML : html;

        const card = document.querySelector(`.article-card[data-file="${file}"]`);
        const image = card ? card.querySelector('.article-image').src : '';
        const date = card ? card.querySelector('.article-date').textContent.trim() : '';
        const tag = card ? card.querySelector('.article-tag').textContent : '';

        modal.querySelector('.modal-content').innerHTML = `
            <img src="${image}" alt="${title}" class="modal-image"
                 onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.style.height='300px'">
            <div class="modal-body">
                <h2 class="modal-title">${title}</h2>
                <div class="modal-meta">
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span class="article-tag">${tag}</span>
                </div>
                <div class="modal-text">${articleContent}</div>
            </div>
        `;
    } catch (error) {
        modal.querySelector('.modal-body').innerHTML = '<p>加载文章失败</p>';
    }

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function initScrollTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
