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

    // ========== ACTIVE NAV LINK ON SCROLL & SLIDING INDICATOR ==========
    let navList = document.querySelector('.nav__list');
    let navLinksAll = document.querySelectorAll('.nav__link[data-section]');
    let indicator = null;

    const initNavIndicator = () => {
        if (!navList) navList = document.querySelector('.nav__list');
        if (!navList) return;

        indicator = navList.querySelector('.nav__indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'nav__indicator';
            navList.appendChild(indicator);
        }
        navList.classList.add('has-indicator');

        navLinksAll = document.querySelectorAll('.nav__link[data-section]');
        if (navLinksAll.length > 0) {
            navLinksAll.forEach(link => {
                if (link._hasIndicatorHover) return;
                link._hasIndicatorHover = true;
                link.addEventListener('mouseenter', () => {
                    moveIndicator(link);
                });
            });

            if (!navList._hasIndicatorLeave) {
                navList._hasIndicatorLeave = true;
                navList.addEventListener('mouseleave', () => {
                    const currentActive = document.querySelector('.nav__link.active');
                    if (currentActive) {
                        moveIndicator(currentActive);
                    }
                });
            }
        }
    };

    const moveIndicator = (targetLink) => {
        if (!targetLink || !indicator || window.innerWidth <= 768) {
            if (indicator) indicator.style.opacity = '0';
            return;
        }
        const listRect = navList.getBoundingClientRect();
        const linkRect = targetLink.getBoundingClientRect();

        // Calculate offset and width relative to navList
        const paddingOffset = 10;
        const left = (linkRect.left - listRect.left) + paddingOffset;
        const width = Math.max(0, linkRect.width - (paddingOffset * 2));

        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.width = `${width}px`;
        indicator.style.opacity = '1';
    };

    // Initialize indicator on DOM ready
    initNavIndicator();

    // Map section IDs to header navigation items (both 'about' and 'values' map to 'about')
    const sectionNavMap = [
        { id: 'hero', navTarget: 'hero' },
        { id: 'intro', navTarget: 'hero' },
        { id: 'about', navTarget: 'about' },
        { id: 'values', navTarget: 'about' },
        { id: 'projects', navTarget: 'projects' },
        { id: 'connect', navTarget: 'connect' }
    ];

    let currentActiveNav = '';

    const updateActiveLink = (targetNav) => {
        if (!navList || !indicator || !navLinksAll || navLinksAll.length === 0) {
            initNavIndicator();
        }

        let activeLink = null;
        if (navLinksAll) {
            navLinksAll.forEach(link => {
                const matches = link.getAttribute('data-section') === targetNav;
                link.classList.toggle('active', matches);
                if (matches) activeLink = link;
            });
        }

        if (targetNav !== currentActiveNav || !indicator || indicator.style.opacity !== '1') {
            currentActiveNav = targetNav;
            if (activeLink) {
                moveIndicator(activeLink);
            }
        }
    };

    const isProjectPage = document.body.classList.contains('project-page') || window.location.pathname.includes('/projects/');

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
            updateActiveLink('connect');
            return;
        }

        // Branch for Project Pages: default tab is 'projects', slides to 'connect' on reaching footer
        if (isProjectPage) {
            const footerEl = document.getElementById('connect') ||
                             document.querySelector('.connect-footer') ||
                             document.getElementById('footer-placeholder');
            if (footerEl) {
                const rect = footerEl.getBoundingClientRect();
                // When top of footer enters upper 55% of the viewport
                if (rect.top <= windowHeight * 0.55) {
                    updateActiveLink('connect');
                    return;
                }
            }
            updateActiveLink('projects');
            return;
        }

        // Home page: Check sections sequentially from top to bottom
        let activeTarget = 'hero';
        sectionNavMap.forEach(({ id, navTarget }) => {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                // When section enters upper 45% of viewport and is still partially visible
                if (rect.top <= windowHeight * 0.45 && rect.bottom > 80) {
                    activeTarget = navTarget;
                }
            }
        });

        updateActiveLink(activeTarget);
    };

    window.addEventListener('scroll', highlightNav, { passive: true });
    window.addEventListener('resize', () => {
        highlightNav();
        const currentActive = document.querySelector('.nav__link.active');
        if (currentActive) moveIndicator(currentActive);
    }, { passive: true });

    // Initial positioning
    setTimeout(() => {
        highlightNav();
        const currentActive = document.querySelector('.nav__link.active');
        if (currentActive) moveIndicator(currentActive);
    }, 150);
    setTimeout(() => {
        highlightNav();
        const currentActive = document.querySelector('.nav__link.active');
        if (currentActive) moveIndicator(currentActive);
    }, 400);

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

    // ========== HERO SLIDER (4 IMAGES) ==========
    const heroSlides = document.querySelectorAll('.hero__slide');
    const heroPagItems = document.querySelectorAll('.hero__pag-item');
    const heroPrevBtn = document.querySelector('.hero__nav-btn--prev, .hero__control-arrow--prev');
    const heroNextBtn = document.querySelector('.hero__nav-btn--next, .hero__control-arrow--next');

    if (heroSlides.length > 0) {
        let currentSlide = 0;
        let slideTimer = null;
        const SLIDE_DURATION = 5000; // 5.0s per slide

        const updatePagination = (index) => {
            if (!heroPagItems || heroPagItems.length === 0) return;
            heroPagItems.forEach((item, i) => {
                const progress = item.querySelector('.hero__pag-progress');
                if (i === index) {
                    item.classList.add('active');
                    if (progress) {
                        progress.style.animation = 'none';
                        void progress.offsetWidth; // Force reflow to reliably restart fill animation
                        progress.style.animation = `heroSlideProgress ${SLIDE_DURATION}ms linear forwards`;
                    }
                } else {
                    item.classList.remove('active');
                    if (progress) {
                        progress.style.animation = 'none';
                    }
                }
            });
        };

        const goToSlide = (newIndex) => {
            let target = newIndex;
            if (target < 0) target = heroSlides.length - 1;
            if (target >= heroSlides.length) target = 0;

            if (target === currentSlide && heroSlides[target].classList.contains('active')) {
                return;
            }

            const prevIndex = currentSlide;
            currentSlide = target;

            heroSlides.forEach((slide, i) => {
                slide.classList.remove('prev');
                if (i === currentSlide) {
                    slide.classList.add('active');
                } else if (i === prevIndex) {
                    slide.classList.add('prev');
                    slide.classList.remove('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Synchronize WebGL water ripple render loops with slide visibility
            if (window.jQuery) {
                heroSlides.forEach((slide, i) => {
                    const r = window.jQuery(slide).data('ripples');
                    if (r && typeof r.setVisible === 'function') {
                        if (i === currentSlide || i === prevIndex) {
                            r.setVisible(true);
                        } else {
                            r.setVisible(false);
                        }
                    }
                });

                setTimeout(() => {
                    heroSlides.forEach((slide, i) => {
                        if (i !== currentSlide) {
                            const r = window.jQuery(slide).data('ripples');
                            if (r && typeof r.setVisible === 'function') {
                                r.setVisible(false);
                            }
                        }
                    });
                }, 1500);
            }

            updatePagination(currentSlide);
            restartAutoPlay();
        };

        const restartAutoPlay = () => {
            if (slideTimer) {
                clearInterval(slideTimer);
            }
            slideTimer = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, SLIDE_DURATION);
        };

        // Arrow controls
        if (heroPrevBtn) {
            heroPrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentSlide - 1);
            });
        }

        if (heroNextBtn) {
            heroNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentSlide + 1);
            });
        }

        // Direct dot clicks
        heroPagItems.forEach((item, idx) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (idx !== currentSlide) {
                    goToSlide(idx);
                }
            });
        });

        // Touch swipe support for mobile
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            let touchStartX = 0;
            heroSection.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].clientX;
            }, { passive: true });

            heroSection.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diffX = touchStartX - touchEndX;
                if (Math.abs(diffX) > 40) {
                    if (diffX > 0) {
                        goToSlide(currentSlide + 1);
                    } else {
                        goToSlide(currentSlide - 1);
                    }
                }
            }, { passive: true });
        }

        // Tab visibility check (pause when inactive, restart when visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (slideTimer) {
                    clearInterval(slideTimer);
                    slideTimer = null;
                }
            } else {
                goToSlide(currentSlide);
            }
        });

        // Initialize first slide progress and start auto-play
        updatePagination(0);
        restartAutoPlay();

        // Forward hero-level mousemove & mousedown directly to the active slide's WebGL ripple
        if (window.jQuery) {
            const $hero = window.jQuery('.hero');
            $hero.on('mousemove.heroRipples', function (e) {
                const $activeSlide = $hero.find('.hero__slide.active.hover-imge-ripple');
                const r = $activeSlide.data('ripples');
                if (r && !r._destroyed && typeof r.mousemove === 'function') {
                    r.mousemove(e);
                }
            });

            $hero.on('mousedown.heroRipples', function (e) {
                if (window.jQuery(e.target).closest('a, button, .hero__nav-btn, .hero__control-arrow, .hero__pag-item').length) return;
                const $activeSlide = $hero.find('.hero__slide.active.hover-imge-ripple');
                const r = $activeSlide.data('ripples');
                if (r && !r._destroyed && typeof r.mousedown === 'function') {
                    r.mousedown(e);
                }
            });
        }
    }

    // ========== PROJECT DETAIL HERO WATER RIPPLES ==========
    if (window.jQuery) {
        const $pHero = window.jQuery('.p-hero');
        if ($pHero.length) {
            $pHero.on('mousemove.pHeroRipples', function (e) {
                const $bg = window.jQuery(this).find('.p-hero__bg.hover-imge-ripple');
                const r = $bg.data('ripples');
                if (r && !r._destroyed && typeof r.mousemove === 'function') {
                    r.mousemove(e);
                }
            });

            $pHero.on('mousedown.pHeroRipples', function (e) {
                if (window.jQuery(e.target).closest('a, button').length) return;
                const $bg = window.jQuery(this).find('.p-hero__bg.hover-imge-ripple');
                const r = $bg.data('ripples');
                if (r && !r._destroyed && typeof r.mousedown === 'function') {
                    r.mousedown(e);
                }
            });
        }
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
