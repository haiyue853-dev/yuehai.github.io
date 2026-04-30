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

    function openMenu() {
        navLinks.classList.add('active');
        menuToggle.classList.add('active');
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    }

    menuToggle.addEventListener('click', function () {
        if (navLinks.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
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
            grid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">暂无随笔</p>';
            return;
        }

        const pageSize = 6;
        let currentPage = 1;
        const totalPages = Math.ceil(articles.length / pageSize);

        let pagination = document.getElementById('articlesPagination');
        if (!pagination) {
            pagination = document.createElement('div');
            pagination.id = 'articlesPagination';
            pagination.className = 'pagination';
            grid.parentElement.appendChild(pagination);
        }

        function renderPage(page, shouldScroll = false) {
            currentPage = page;
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const currentArticles = articles.slice(start, end);

            grid.innerHTML = currentArticles.map(article => `
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

            renderPagination();

            if (shouldScroll) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const sectionTop = document.getElementById('articles').offsetTop - headerHeight - 8;
                window.scrollTo({
                    top: Math.max(sectionTop, 0),
                    behavior: 'smooth'
                });
            }
        }

        function renderPagination() {
            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }

            const prevDisabled = currentPage === 1 ? 'disabled' : '';
            const nextDisabled = currentPage === totalPages ? 'disabled' : '';

            function getPageItems(total, current) {
                if (total <= 7) {
                    return Array.from({ length: total }, (_, i) => i + 1);
                }

                const items = [1];
                const start = Math.max(2, current - 1);
                const end = Math.min(total - 1, current + 1);

                if (start > 2) {
                    items.push('ellipsis-left');
                }

                for (let i = start; i <= end; i++) {
                    items.push(i);
                }

                if (end < total - 1) {
                    items.push('ellipsis-right');
                }

                items.push(total);
                return items;
            }

            const pageItems = getPageItems(totalPages, currentPage);
            const pageButtons = pageItems.map(item => {
                if (typeof item === 'string') {
                    return '<span class="page-ellipsis">...</span>';
                }
                return `<button class="page-btn ${item === currentPage ? 'active' : ''}" data-page="${item}">${item}</button>`;
            }).join('');

            pagination.innerHTML = `
                <button class="page-btn nav-btn" data-action="prev" ${prevDisabled}>上一页</button>
                ${pageButtons}
                <button class="page-btn nav-btn" data-action="next" ${nextDisabled}>下一页</button>
            `;

            pagination.querySelectorAll('.page-btn[data-page]').forEach(btn => {
                btn.addEventListener('click', function () {
                    const page = Number(this.dataset.page);
                    renderPage(page, true);
                });
            });

            const prevBtn = pagination.querySelector('[data-action="prev"]');
            const nextBtn = pagination.querySelector('[data-action="next"]');

            if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    if (currentPage > 1) {
                        renderPage(currentPage - 1, true);
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    if (currentPage < totalPages) {
                        renderPage(currentPage + 1, true);
                    }
                });
            }
        }

        renderPage(1);
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
        const title = doc.querySelector('title') ? doc.querySelector('title').textContent : '随笔';
        const articleContent = doc.querySelector('article') ? doc.querySelector('article').innerHTML : html;

        const card = document.querySelector(`.article-card[data-file="${file}"]`);
        const image = card ? card.querySelector('.article-image').src : '';
        const date = card ? card.querySelector('.article-date').textContent.trim() : '';
        const tag = card ? card.querySelector('.article-tag').textContent : '';

        modal.querySelector('.modal-content').innerHTML = `
            <div class="modal-image-wrap">
                <img src="${image}" alt="${title}" class="modal-image"
                     onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.style.height='300px'">
            </div>
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
