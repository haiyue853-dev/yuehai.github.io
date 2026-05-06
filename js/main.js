document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileMenu();
    initBlindsGallery();
    initPageGallery();
    initImageModal();
    initScrollTop();
    initSmoothScroll();
    initScrollReveal();
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
    });

    const closeBtn = document.querySelector('.nav-links .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            navLinks.classList.remove('active');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function () {
            navLinks.classList.remove('active');
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initBlindsGallery() {
    const gallery = document.getElementById('blindsGallery');
    if (!gallery) return;

    const items = gallery.querySelectorAll('.blinds-item');
    const dotsContainer = document.getElementById('blindsDots');
    const prevBtn = document.querySelector('.blinds-btn[data-dir="prev"]');
    const nextBtn = document.querySelector('.blinds-btn[data-dir="next"]');
    let currentIndex = 0;
    let autoPlayTimer = null;
    let isAnimating = false;

    for (let i = 0; i < items.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.dot');

    function createTransition(toIndex, direction) {
        if (isAnimating || toIndex === currentIndex) return;
        isAnimating = true;

        const fromItem = items[currentIndex];
        const toItem = items[toIndex];

        toItem.style.opacity = '0';
        toItem.style.transform = 'scale(1.1)';
        toItem.classList.add('active');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fromItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                fromItem.style.transform = 'scale(0.95)';
                fromItem.style.opacity = '0';

                toItem.style.transition = 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s';
                toItem.style.transform = 'scale(1)';
                toItem.style.opacity = '1';
            });
        });

        setTimeout(() => {
            fromItem.classList.remove('active');
            fromItem.style.transition = '';
            fromItem.style.transform = '';
            fromItem.style.opacity = '';

            dots.forEach(d => d.classList.remove('active'));
            dots[toIndex].classList.add('active');
            currentIndex = toIndex;
            isAnimating = false;
        }, 600);
    }

    function goTo(index, direction) {
        if (isAnimating || index === currentIndex) return;
        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;
        const dir = direction || (index > currentIndex ? 'next' : 'prev');
        createTransition(index, dir);
    }

    function nextSlide() { goTo(currentIndex + 1, 'next'); }
    function prevSlide() { goTo(currentIndex - 1, 'prev'); }

    if (prevBtn) prevBtn.addEventListener('click', () => { resetAutoPlay(); prevSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { resetAutoPlay(); nextSlide(); });

    dots.forEach(dot => {
        dot.addEventListener('click', function () {
            const index = parseInt(this.dataset.index);
            if (index !== currentIndex) {
                resetAutoPlay();
                goTo(index);
            }
        });
    });

    gallery.addEventListener('click', function () {
        const activeItem = items[currentIndex];
        const img = activeItem.querySelector('img');
        if (img && img.src && !img.src.startsWith('data:')) {
            openImageModal(img.src);
        }
    });

    function startAutoPlay() { autoPlayTimer = setInterval(nextSlide, 4000); }
    function resetAutoPlay() { clearInterval(autoPlayTimer); startAutoPlay(); }

    startAutoPlay();
    gallery.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    gallery.addEventListener('mouseleave', startAutoPlay);
}

function initPageGallery() {
    const book = document.querySelector('.page-book');
    if (!book) return;

    const items = book.querySelectorAll('.page-item');
    const dotsContainer = document.getElementById('pageDots');
    const prevBtn = document.querySelector('.page-btn[data-dir="prev"]');
    const nextBtn = document.querySelector('.page-btn[data-dir="next"]');
    let currentIndex = 0;
    let isAnimating = false;
    let autoPlayTimer = null;

    for (let i = 0; i < items.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.dot');

    function flipTo(toIndex, direction) {
        if (isAnimating || toIndex === currentIndex) return;
        isAnimating = true;

        const fromItem = items[currentIndex];
        const toItem = items[toIndex];

        fromItem.classList.remove('active');
        toItem.classList.remove('flip-out');
        toItem.classList.remove('slide-out');
        toItem.classList.remove('slide-out-reverse');
        fromItem.classList.remove('flip-in');
        fromItem.classList.remove('slide-in');
        fromItem.classList.remove('slide-in-reverse');

        void fromItem.offsetWidth;

        if (direction === 'next') {
            fromItem.classList.add('slide-out');
            toItem.classList.add('slide-in');
        } else {
            fromItem.classList.add('slide-out-reverse');
            toItem.classList.add('slide-in-reverse');
        }

        const onSlideOutEnd = () => {
            fromItem.classList.remove('slide-out', 'slide-out-reverse');
            fromItem.style.opacity = '0';
            fromItem.style.pointerEvents = 'none';
        };

        const onSlideInEnd = () => {
            toItem.classList.remove('slide-in', 'slide-in-reverse');
            toItem.classList.add('active');
            toItem.style.opacity = '1';
            toItem.style.pointerEvents = 'auto';

            dots.forEach(d => d.classList.remove('active'));
            dots[toIndex].classList.add('active');
            currentIndex = toIndex;
            isAnimating = false;
        };

        fromItem.addEventListener('animationend', onSlideOutEnd, { once: true });
        toItem.addEventListener('animationend', onSlideInEnd, { once: true });
    }

    function nextSlide() { flipTo((currentIndex + 1) % items.length, 'next'); }
    function prevSlide() { flipTo((currentIndex - 1 + items.length) % items.length, 'prev'); }

    if (prevBtn) prevBtn.addEventListener('click', () => { resetAutoPlay(); prevSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { resetAutoPlay(); nextSlide(); });

    dots.forEach(dot => {
        dot.addEventListener('click', function () {
            const index = parseInt(this.dataset.index);
            if (index !== currentIndex) {
                resetAutoPlay();
                flipTo(index);
            }
        });
    });

    book.addEventListener('click', function () {
        const activeItem = items[currentIndex];
        const img = activeItem.querySelector('img');
        if (img && img.src && !img.src.startsWith('data:')) {
            openImageModal(img.src);
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;

    book.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    book.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            resetAutoPlay();
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });

    function startAutoPlay() { autoPlayTimer = setInterval(nextSlide, 5000); }
    function resetAutoPlay() { clearInterval(autoPlayTimer); startAutoPlay(); }

    startAutoPlay();
    book.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    book.addEventListener('mouseleave', startAutoPlay);
}

function initImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = modal.querySelector('.image-modal-close');

    window.openImageModal = function (src) {
        modalImg.src = src;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

function initScrollReveal() {
    const sections = document.querySelectorAll('.douyin-section, .group-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => observer.observe(section));
}
