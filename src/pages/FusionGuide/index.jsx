import React from 'react';
import Header from '../../../../src/components/Header.jsx';
import Footer from '../../../../src/components/Footer.jsx';
import './styles.css';

export default function FusionGuide() {
    return (
        <>
        <Header />
        <main className="fusion">
            <section className="fusion__hero">
                <div className="fusion__content">
                    <h1 className="fusion__title">Card Fusion Guide</h1>
                    <p className="fusion__subtitle">Cách ghép các card nhân vật để tiến hóa.</p>
                </div>
            </section>

            <section className="fusion__body">
                <div className="fusion__image" role="img" aria-label="Fusion how-to" />
                <ol className="fusion__steps">
                    <li>Chọn 2-3 thẻ cùng bộ hoặc thuộc tính tương thích.</li>
                    <li>Đảm bảo tổng điểm hiếm/level đạt yêu cầu.</li>
                    <li>Dùng vật phẩm "Catalyst" để tăng tỉ lệ thành công.</li>
                    <li>Xác nhận ghép để tạo thẻ tiến hóa mạnh hơn.</li>
                </ol>
            </section>
        </main>
        <Footer />
        </>
    );
}


