/**
 * =========================================================================
 * TS ART INTERIOR - REUSABLE FOOTER COMPONENT
 * =========================================================================
 * File này quản lý toàn bộ nội dung chân trang (Footer) cho website TS Art.
 * Áp dụng thống nhất cho cả Trang chủ (index.html) và các Trang dự án (projects/).
 * 
 * BẠN CÓ THỂ DỄ DÀNG CHỈNH SỬA CÁC THÔNG TIN TẠI KHỐI 'FOOTER_CONFIG' DƯỚI ĐÂY:
 * =========================================================================
 */

(function () {
    // 1. CẤU HÌNH THÔNG TIN CHÂN TRANG (Dễ dàng thay đổi tại đây)
    const FOOTER_CONFIG = {
        hotline: '(+84) 934 00 85 85',
        hotlineTel: '+84934008585',
        email: 'sales@tsart.com.vn',
        address: '28 Tạ Hiện, phường Cát Lái, Thành phố Hồ Chí Minh, Việt Nam',
        googleMapsUrl: 'https://maps.google.com/?q=28+Tạ+Hiện+Cát+Lái+Thành+phố+Hồ+Chí+Minh',
        companyName: 'CÔNG TY CỔ PHẦN DỊCH VỤ TS ART INTERIOR',
        taxId: 'MST: 0316836947',
        copyright: 'TS Art Interior 2022 © • All rights reserved.',
        mediaImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=85',
        socials: {
            facebook: 'https://www.facebook.com/TSArtInterior/',
            instagram: 'https://www.instagram.com/tsart.interior/',
            linkedin: 'https://www.linkedin.com/'
        }
    };

    // 2. Tự động nhận diện ngữ cảnh (thư mục gốc hay thư mục con projects/)
    let basePath = '';
    let isProject = false;
    const placeholder = document.getElementById('footer-placeholder');

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

    // 3. Thiết lập đường dẫn các tài nguyên & liên kết tương đối
    const logoSrc = basePath + 'TS ART INTERIOR.png';
    const homeHref = isProject ? basePath + 'index.html' : '#hero';
    const processHref = isProject ? basePath + 'index.html#connect' : '#connect';

    // 4. Mã HTML của Connect Footer
    const footerHTML = `
    <footer class="contacts-section connect-footer"${isProject ? ' id="connect"' : ''}>
        <div class="contacts-container">
            <!-- Left: Luxury Architectural Media Showcase -->
            <div class="contacts-media img-hover reveal reveal--left">
                <img src="${FOOTER_CONFIG.mediaImage}" alt="TS Art Luxury Kitchen Interior" loading="lazy">
                <div class="contacts-media__overlay">
                    <div class="contacts-media__badge">
                        <span class="contacts-media__badge-dot"></span>
                        <span>TS ART STUDIO • TURNKEY SERVICE</span>
                    </div>
                </div>
            </div>

            <!-- Right: Editorial Contacts Info & Identity -->
            <div class="contacts-content reveal reveal--right">
                <!-- Header: Brand Logo & Social Networks -->
                <div class="contacts-header-badge">
                    <a href="${homeHref}" class="contacts-brand" aria-label="Trang chủ TS Art Interior">
                        <img src="${logoSrc}" alt="TS Art Interior Logo" class="contacts-brand__logo-img">
                    </a>

                    <div class="contacts-socials">
                        <a href="${FOOTER_CONFIG.socials.facebook}" target="_blank" rel="noopener noreferrer" class="contacts-social-btn" aria-label="Facebook">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                            </svg>
                        </a>
                        <a href="${FOOTER_CONFIG.socials.instagram}" target="_blank" rel="noopener noreferrer" class="contacts-social-btn" aria-label="Instagram">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                        </a>
                        <a href="${FOOTER_CONFIG.socials.linkedin}" target="_blank" rel="noopener noreferrer" class="contacts-social-btn" aria-label="LinkedIn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                                <circle cx="4" cy="4" r="2"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Body: Title & Detailed Contact Matrix -->
                <div class="contacts-body">
                    <div class="contacts-title-wrap">
                        <span class="contacts-eyebrow">LIÊN HỆ VỚI TS ART INTERIOR</span>
                        <h2 class="contacts-title">CONTACTS</h2>
                    </div>

                    <div class="contacts-table">
                        <!-- Hotline -->
                        <div class="contacts-row">
                            <span class="contacts-row__label">HOTLINE</span>
                            <div class="contacts-row__value">
                                <a href="tel:${FOOTER_CONFIG.hotlineTel}" class="contacts-link contacts-link--tel">
                                    ${FOOTER_CONFIG.hotline}
                                </a>
                            </div>
                        </div>

                        <!-- Email -->
                        <div class="contacts-row">
                            <span class="contacts-row__label">EMAIL</span>
                            <div class="contacts-row__value">
                                <a href="mailto:${FOOTER_CONFIG.email}" class="contacts-link">
                                    ${FOOTER_CONFIG.email}
                                </a>
                            </div>
                        </div>

                        <!-- Address + Google Maps Link -->
                        <div class="contacts-row">
                            <span class="contacts-row__label">ĐỊA CHỈ</span>
                            <div class="contacts-row__value">
                                <p class="contacts-address-text">${FOOTER_CONFIG.address}</p>
                                <a href="${FOOTER_CONFIG.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="contacts-map-link">
                                    <span>Xem trên Google Maps</span>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="7" y1="17" x2="17" y2="7"></line>
                                        <polyline points="7 7 17 7 17 17"></polyline>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <!-- Company Legal & Tax Info -->
                        <div class="contacts-row">
                            <span class="contacts-row__label">DOANH NGHIỆP</span>
                            <div class="contacts-row__value contacts-corp">
                                <p class="contacts-corp__name">${FOOTER_CONFIG.companyName}</p>
                                <p class="contacts-corp__tax">${FOOTER_CONFIG.taxId}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Action Button -->
                <div class="contacts-action">
                    <a href="tel:${FOOTER_CONFIG.hotlineTel}" class="contacts-btn">
                        <span>Liên hệ tư vấn ngay</span>
                        <span class="contacts-btn__arrow">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Full-Width Bottom Subfooter Bar -->
        <div class="connect-footer__bar">
            <div class="connect-footer__bar-inner">
                <p class="connect-footer__copy">${FOOTER_CONFIG.copyright}</p>
                <ul class="connect-footer__links">
                    <li><a href="${processHref}">Quy trình hợp tác</a></li>
                    <li><span class="sep">•</span></li>
                    <li><a href="#">Điều khoản &amp; Điều kiện</a></li>
                    <li><span class="sep">•</span></li>
                    <li><a href="#">Cơ hội nghề nghiệp</a></li>
                </ul>
            </div>
        </div>
    </footer>
    `;

    // 5. Chèn Footer vào vị trí thích hợp trên trang
    function renderFooter() {
        const target = document.getElementById('footer-placeholder');
        if (target) {
            target.outerHTML = footerHTML;

            // Kích hoạt animation reveal cho các phần tử vừa chèn
            const insertedFooter = document.querySelector('.connect-footer');
            if (insertedFooter) {
                const reveals = insertedFooter.querySelectorAll('.reveal');
                if ('IntersectionObserver' in window) {
                    const obs = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('revealed');
                                obs.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.1 });
                    reveals.forEach(el => obs.observe(el));
                } else {
                    reveals.forEach(el => el.classList.add('revealed'));
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderFooter);
    } else {
        renderFooter();
    }
})();
