/* ===================================
   TS ART INTERIOR - JavaScript
   Features: Navigation, Scroll Reveal,
   Lazy Loading, Counter Animation
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========== HEADER SCROLL EFFECT ==========
    const header = document.getElementById('header');
    let lastScroll = 0;

    const handleHeaderScroll = () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    // ========== MOBILE NAVIGATION ==========
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Mobile dropdown toggle
        const dropdownParent = document.querySelector('.nav__item--dropdown');
        if (dropdownParent && window.innerWidth <= 768) {
            dropdownParent.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    dropdownParent.classList.toggle('open');
                }
            });
        }
    }

    // ========== ACTIVE NAV LINK ON SCROLL ==========
    const navLinksAll = document.querySelectorAll('.nav__link[data-section]');
    const trackedSections = [
        { id: 'hero', name: 'hero' },
        { id: 'about', name: 'about' },
        { id: 'projects', name: 'projects' },
        { id: 'connect', name: 'connect' }
    ];

    const highlightNav = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        );

        // When scrolled near or to the bottom of the page, always activate Connect
        if (scrollY + windowHeight >= documentHeight - 120) {
            navLinksAll.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-section') === 'connect');
            });
            return;
        }

        let activeId = 'hero';
        trackedSections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                // When section enters the upper 45% of viewport and is still visible
                if (rect.top <= windowHeight * 0.45 && rect.bottom > 100) {
                    activeId = id;
                }
            }
        });

        navLinksAll.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === activeId);
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });
    window.addEventListener('resize', highlightNav, { passive: true });
    highlightNav();

    // ========== SCROLL REVEAL ANIMATION ==========
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ========== LAZY LOADING IMAGES ==========
    const lazyImages = document.querySelectorAll('.lazy');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });

                    // In case the image is cached and 'load' already fired
                    if (img.complete) {
                        img.classList.add('loaded');
                    }
                }
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '200px 0px'
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // ========== COUNTER ANIMATION ==========
    const counters = document.querySelectorAll('.stats__number[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };

                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, {
        threshold: 0.5
    });

    counters.forEach(counter => counterObserver.observe(counter));

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== FORM SUBMIT HANDLER ==========
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Show simple success feedback
            const btn = contactForm.querySelector('.connect__btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Đã gửi thành công!</span>';
            btn.style.backgroundColor = '#4caf50';
            btn.style.borderColor = '#4caf50';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                contactForm.reset();
            }, 3000);
        });
    }

    // ========== PARALLAX EFFECT ON HERO ==========
    const heroBg = document.querySelector('.hero__bg-img');

    if (heroBg) {
        const handleParallax = () => {
            const scrollY = window.pageYOffset;
            const heroHeight = document.querySelector('.hero').offsetHeight;

            if (scrollY < heroHeight) {
                heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.3}px)`;
            }
        };

        window.addEventListener('scroll', handleParallax, { passive: true });
    }

    // ========== IMAGE HOVER MAGNETIC EFFECT ==========
    const hoverImages = document.querySelectorAll('.img-hover');

    hoverImages.forEach(container => {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const deltaX = (x - centerX) / centerX * 5;
            const deltaY = (y - centerY) / centerY * 5;

            const img = container.querySelector('img');
            if (img) {
                img.style.transform = `scale(1.08) translate(${deltaX}px, ${deltaY}px)`;
            }
        });

        container.addEventListener('mouseleave', () => {
            const img = container.querySelector('img');
            if (img) {
                img.style.transform = '';
            }
        });
    });

});
