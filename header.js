/**
 * =========================================================================
 * TS ART INTERIOR - REUSABLE HEADER COMPONENT
 * =========================================================================
 * File này quản lý thanh điều hướng (Header / Navigation) cho toàn bộ website.
 * Mọi chỉnh sửa về logo, menu, danh sách dự án Signature Projects...
 * chỉ cần cập nhật tại file này, toàn bộ các trang sẽ tự động đồng bộ.
 * =========================================================================
 */

(function () {
    // 1. Tự động nhận diện ngữ cảnh (thư mục gốc index.html hay thư mục con projects/)
    let basePath = '';
    let isProject = false;
    const placeholder = document.getElementById('header-placeholder');

    if (placeholder && placeholder.dataset.basePath !== undefined) {
        basePath = placeholder.dataset.basePath;
        isProject = basePath.startsWith('../');
    } else {
        const currentScript = document.currentScript;
        if (currentScript && currentScript.getAttribute('src') && currentScript.getAttribute('src').startsWith('../')) {
            basePath = '../';
            isProject = true;
        } else if (window.location.pathname.includes('/projects/')) {
            basePath = '../';
            isProject = true;
        }
    }

    // Tên file HTML hiện tại (ví dụ: 'sales-gallery-nho.html' hoặc 'index.html')
    const currentFilename = window.location.pathname.split('/').pop() || 'index.html';

    // 2. Danh sách 8 dự án trong Signature Projects (thêm hoặc sửa dự án tại đây)
    const projectsList = [
        { slug: 'sales-gallery-nho', title: '01 — Sales Gallery N.H.O' },
        { slug: 'hsc-office', title: '02 — HSC Office' },
        { slug: 'ton-duc-thang-university', title: '03 — Ton Duc Thang University' },
        { slug: 'viinriic-perfume', title: '04 — ViinRiic Pefum Thiso Mall' },
        { slug: 'zeit-river', title: '05 — Zeit River' },
        { slug: 'hue-tam-restaurant', title: '06 — Hue Tam Restaurant' },
        { slug: 'grand-marina', title: '07 — Grand Marina Saigon' },
        { slug: 'the-river-thu-thiem', title: '08 — The River Thủ Thiêm' }
    ];

    // 3. Đường dẫn menu
    const logoHref = isProject ? basePath + 'index.html' : '#hero';
    const heroHref = isProject ? basePath + 'index.html' : '#hero';
    const aboutHref = isProject ? basePath + 'index.html#about' : '#about';
    const projectsHref = isProject ? basePath + 'index.html#projects' : '#projects';
    const connectHref = isProject ? basePath + 'index.html#connect' : '#connect';

    // Xây dựng danh sách dropdown items
    const dropdownHTML = projectsList.map(item => {
        const itemHref = isProject ? `${item.slug}.html` : `projects/${item.slug}.html`;
        const isActive = isProject && currentFilename === `${item.slug}.html`;
        return `                            <a href="${itemHref}" class="dropdown__link${isActive ? ' active' : ''}">${item.title}</a>`;
    }).join('\n');

    // Class và data-section cho link điều hướng
    const heroClass = isProject ? 'nav__link' : 'nav__link active';
    const heroData = isProject ? '' : ' data-section="hero"';

    const aboutClass = 'nav__link';
    const aboutData = isProject ? '' : ' data-section="about"';

    const projectsClass = isProject ? 'nav__link active' : 'nav__link';
    const projectsData = isProject ? '' : ' data-section="projects"';

    const connectClass = 'nav__link';
    const connectData = isProject ? '' : ' data-section="connect"';

    // 4. Nội dung HTML chuẩn của Header (lấy từ index.html)
    const headerHTML = `
    <header class="header" id="header">
        <nav class="nav">
            <a href="${logoHref}" class="nav__logo">TS ART INTERIOR</a>
            <div class="nav__menu" id="navMenu">
                <ul class="nav__list">
                    <li class="nav__item">
                        <a href="${heroHref}" class="${heroClass}"${heroData}>TS Art Interior</a>
                    </li>
                    <li class="nav__separator">|</li>
                    <li class="nav__item">
                        <a href="${aboutHref}" class="${aboutClass}"${aboutData}>About us</a>
                    </li>
                    <li class="nav__separator">|</li>
                    <li class="nav__item nav__item--dropdown">
                        <a href="${projectsHref}" class="${projectsClass}"${projectsData}>Signature projects</a>
                        <div class="dropdown">
${dropdownHTML}
                        </div>
                    </li>
                    <li class="nav__separator">|</li>
                    <li class="nav__item">
                        <a href="${connectHref}" class="${connectClass}"${connectData}>Connect</a>
                    </li>
                </ul>
            </div>
            <button class="nav__toggle" id="navToggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    </header>
    `;

    // 5. Chèn Header vào vị trí thích hợp trên trang
    function renderHeader() {
        const target = document.getElementById('header-placeholder') || document.querySelector('header.header');
        if (target) {
            target.outerHTML = headerHTML;
        } else if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }

    if (document.readyState === 'loading') {
        const target = document.getElementById('header-placeholder') || document.querySelector('header.header');
        if (target) {
            target.outerHTML = headerHTML;
        } else {
            document.addEventListener('DOMContentLoaded', renderHeader);
        }
    } else {
        renderHeader();
    }
})();
