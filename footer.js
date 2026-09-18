/**
 * =========================================================================
 * TS ART INTERIOR - REUSABLE FOOTER COMPONENT
 * =========================================================================
 * File này quản lý nội dung chân trang (Footer) cho toàn bộ website.
 * Mọi chỉnh sửa về thông tin liên hệ, hotline, email, địa chỉ, bản quyền,
 * mạng xã hội... chỉ cần sửa tại file này, toàn bộ các trang sẽ tự động đồng bộ.
 * =========================================================================
 */

(function () {
    // 1. Tự động nhận diện đường dẫn tương đối (ở thư mục gốc hay thư mục con projects/)
    let basePath = '';
    const placeholder = document.getElementById('footer-placeholder');

    if (placeholder && placeholder.dataset.basePath !== undefined) {
        basePath = placeholder.dataset.basePath;
    } else {
        const currentScript = document.currentScript;
        if (currentScript && currentScript.getAttribute('src') && currentScript.getAttribute('src').startsWith('../')) {
            basePath = '../';
        } else if (window.location.pathname.includes('/projects/')) {
            basePath = '../';
        }
    }

    // 2. Thiết lập đường dẫn các tài nguyên & liên kết
    const logoSrc = basePath + 'TS ART INTERIOR.png';
    const homeHref = basePath ? basePath + 'index.html' : 'index.html';
    const connectHref = basePath ? basePath + 'index.html#connect' : '#connect';

    // 3. Nội dung HTML chuẩn của Footer (lấy từ index.html)
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <!-- Top Row: Logo & Contact quick info -->
            <div class="footer__top">
                <div class="footer__brand">
                    <a href="${homeHref}" aria-label="Trang chủ TS Art Interior">
                        <img src="${logoSrc}" alt="TS Art Interior Turnkey Service" class="footer__logo-img">
                    </a>
                </div>
                <div class="footer__contact-quick">
                    <h3 class="footer__contact-title">Liên hệ với TS Art Interior thật dễ dàng!</h3>
                    <div class="footer__contact-items">
                        <a href="tel:+84934008585" class="footer__contact-item">
                            <span class="footer__icon-circle">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z"/>
                                </svg>
                            </span>
                            <span class="footer__contact-text">(+84) 934 00 85 85</span>
                        </a>
                        <a href="mailto:sales@tsart.com.vn" class="footer__contact-item">
                            <span class="footer__icon-circle">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                                    <polyline points="3 7 12 13 21 7"/>
                                </svg>
                            </span>
                            <span class="footer__contact-text">sales@tsart.com.vn</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Divider line -->
            <div class="footer__divider"></div>

            <!-- Bottom Row: Socials/Links & Company Info -->
            <div class="footer__bottom">
                <div class="footer__col-left">
                    <div class="footer__socials">
                        <a href="https://www.facebook.com/TSArtInterior/" target="_blank" rel="noopener noreferrer" class="footer__social-btn" aria-label="Facebook">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/tsart.interior/" target="_blank" rel="noopener noreferrer" class="footer__social-btn" aria-label="Instagram">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" class="footer__social-btn" aria-label="LinkedIn">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                                <circle cx="4" cy="4" r="2"/>
                            </svg>
                        </a>
                    </div>
                    <ul class="footer__nav-links">
                        <li><a href="${connectHref}">Quy trình hợp tác</a></li>
                        <li><a href="#">Điều khoản và điều kiện</a></li>
                        <li><a href="#">Cơ hội nghề nghiệp</a></li>
                    </ul>
                </div>

                <div class="footer__col-right">
                    <p class="footer__copy-year">TS Art Interior 2022 ©</p>
                    <p class="footer__company-name">CÔNG TY CỔ PHẦN DỊCH VỤ TS ART INTERIOR</p>
                    <p class="footer__tax">MST: 0316836947</p>
                    <p class="footer__address">Địa chỉ: 28 Tạ Hiện, phường Cát Lái, Thành phố Hồ Chí Minh, Việt Nam</p>
                    <p class="footer__map-link">
                        <a href="https://maps.google.com/?q=28+Tạ+Hiện+Cát+Lái+Thành+phố+Hồ+Chí+Minh" target="_blank" rel="noopener noreferrer">
                            Xem bản đồ <em>(Google Map)</em>
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </footer>
    `;

    // 4. Chèn Footer vào vị trí thích hợp trên trang
    function renderFooter() {
        const target = document.getElementById('footer-placeholder') || document.querySelector('footer.footer');
        if (target) {
            target.outerHTML = footerHTML;
        } else if (document.body) {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }

    if (document.readyState === 'loading') {
        // Nếu trang đang tải, kiểm tra xem placeholder đã xuất hiện chưa
        const target = document.getElementById('footer-placeholder') || document.querySelector('footer.footer');
        if (target) {
            target.outerHTML = footerHTML;
        } else {
            document.addEventListener('DOMContentLoaded', renderFooter);
        }
    } else {
        renderFooter();
    }
})();
