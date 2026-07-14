/* ==========================================
   SHAPEMAP - INTERACTIVE LOGIC (JS)
   Features: Testimonial Carousel, Feature Deck,
   Scroll-Triggered Animate, FAQ Accordion, Smooth Scroll
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SMOOTH SCROLLING
    // ==========================================
    const scrollTriggers = document.querySelectorAll('.scroll-trigger');
    scrollTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const elementTopAbsolute = elementPosition + window.pageYOffset;
                    const elementHeight = targetElement.offsetHeight;
                    const viewportHeight = window.innerHeight;

                    let offsetPosition = elementTopAbsolute;
                    if (elementHeight < viewportHeight) {
                        // Center the card vertically in the screen
                        offsetPosition = elementTopAbsolute - (viewportHeight - elementHeight) / 2;
                    } else {
                        // If it's too tall, align to the top with a comfortable 40px margin
                        offsetPosition = elementTopAbsolute - 40;
                    }

                    // Prevent scrolling past the top of the page
                    if (offsetPosition < 0) offsetPosition = 0;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ==========================================
    // 2. AUTO-SCROLL TESTIMONIALS (TICKER)
    // ==========================================
    const testimonialsSlider = document.getElementById('testimonialsSlider');
    if (testimonialsSlider) {
        // Duplicate testimonial cards to create infinite loop
        const originalCards = Array.from(testimonialsSlider.children);
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            testimonialsSlider.appendChild(clone);
        });

        let scrollSpeed = 0.6; // Auto-scroll speed
        let isPaused = false;
        let resumeTimeout;

        function autoScroll() {
            if (!isPaused) {
                testimonialsSlider.scrollLeft += scrollSpeed;
                
                const maxScroll = testimonialsSlider.scrollWidth / 2;
                if (testimonialsSlider.scrollLeft >= maxScroll) {
                    testimonialsSlider.scrollLeft -= maxScroll;
                }
            }
            requestAnimationFrame(autoScroll);
        }

        requestAnimationFrame(autoScroll);

        testimonialsSlider.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        testimonialsSlider.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        testimonialsSlider.addEventListener('touchstart', () => {
            isPaused = true;
            clearTimeout(resumeTimeout);
        }, { passive: true });

        const resumeAutoScroll = () => {
            clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(() => {
                isPaused = false;
            }, 2000);
        };

        testimonialsSlider.addEventListener('touchend', resumeAutoScroll, { passive: true });
        testimonialsSlider.addEventListener('touchcancel', resumeAutoScroll, { passive: true });
    }

    // ==========================================
    // 3. SCROLL-TRIGGERED BENEFITS ANIMATION
    // ==========================================
    const benefitItems = document.querySelectorAll('.scroll-animate');
    
    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
    });

    benefitItems.forEach(item => {
        animateOnScroll.observe(item);
    });

    // ==========================================
    // 4. FEATURES HORIZONTAL SLIDER WITH EXPANDABLE CARDS
    // ==========================================
    const featureCards = document.querySelectorAll('.feature-slide-card');
    const featPrevBtn = document.querySelector('.feat-prev');
    const featNextBtn = document.querySelector('.feat-next');
    const featuresIndicators = document.getElementById('featuresIndicators');
    const featuresSlider = document.getElementById('featuresSlider');

    let currentFeatureIndex = 0;
    const totalFeatures = featureCards.length;

    function updateSliderHeight() {
        if (!featuresSlider || featureCards.length === 0) return;
        const activeCard = featureCards[currentFeatureIndex];
        if (activeCard) {
            const height = activeCard.scrollHeight;
            featuresSlider.style.height = `${height}px`;
        }
    }

    function createFeatureIndicators() {
        if (!featuresIndicators) return;
        featuresIndicators.innerHTML = '';
        for (let i = 0; i < totalFeatures; i++) {
            const indicator = document.createElement('span');
            indicator.classList.add('feat-dot');
            if (i === currentFeatureIndex) indicator.classList.add('active');
            indicator.addEventListener('click', () => {
                showFeature(i);
            });
            featuresIndicators.appendChild(indicator);
        }
    }

    function showFeature(index) {
        if (index === currentFeatureIndex) return;

        const oldCard = featureCards[currentFeatureIndex];
        const newCard = featureCards[index];
        const isNext = index > currentFeatureIndex;

        featureCards.forEach((c, idx) => {
            c.classList.remove('active');
            if (idx < index) {
                c.classList.add('prev');
            } else {
                c.classList.remove('prev');
            }
        });

        if (isNext) {
            oldCard.classList.add('prev');
        } else {
            oldCard.classList.remove('prev');
        }

        newCard.classList.add('active');
        newCard.classList.remove('prev');

        currentFeatureIndex = index;
        updateFeatureIndicators();
        
        setTimeout(updateSliderHeight, 50);
    }

    function updateFeatureIndicators() {
        if (!featuresIndicators) return;
        const dots = featuresIndicators.querySelectorAll('.feat-dot');
        dots.forEach((dot, idx) => {
            if (idx === currentFeatureIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    if (featNextBtn) {
        featNextBtn.addEventListener('click', () => {
            let nextIdx = currentFeatureIndex + 1;
            if (nextIdx >= totalFeatures) nextIdx = 0;
            showFeature(nextIdx);
        });
    }

    if (featPrevBtn) {
        featPrevBtn.addEventListener('click', () => {
            let prevIdx = currentFeatureIndex - 1;
            if (prevIdx < 0) prevIdx = totalFeatures - 1;
            showFeature(prevIdx);
        });
    }

    // Initialize UI
    createFeatureIndicators();

    featureCards.forEach((card, idx) => {
        if (idx < currentFeatureIndex) {
            card.classList.add('prev');
        } else if (idx > currentFeatureIndex) {
            card.classList.remove('prev');
        }
    });

    setTimeout(updateSliderHeight, 150);
    window.addEventListener('resize', updateSliderHeight);

    // ==========================================
    // 5. FAQ ACCORDION
    // ==========================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            const answer = this.nextElementSibling;
            
            if (item.classList.contains('active')) {
                answer.style.maxHeight = '0';
                item.classList.remove('active');
            } else {
                document.querySelectorAll('.faq-item.active').forEach(openItem => {
                    openItem.classList.remove('active');
                    openItem.querySelector('.faq-answer').style.maxHeight = '0';
                });
                
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ==========================================
    // 6. INTERACTIVE ROI CALCULATOR
    // ==========================================
    const qtySlider = document.getElementById('qty-slider');
    const priceSlider = document.getElementById('price-slider');
    const qtyVal = document.getElementById('qty-val');
    const priceVal = document.getElementById('price-val');
    const revenueResult = document.getElementById('revenue-result');
    const comparisonText = document.getElementById('comparison-text');
    
    if (qtySlider && priceSlider) {
        function updateROI() {
            const qty = parseInt(qtySlider.value);
            const price = parseInt(priceSlider.value);
            
            // Update labels
            qtyVal.textContent = qty;
            priceVal.textContent = '$ ' + price;
            
            // Calculate revenue
            const totalRevenue = qty * price;
            
            // Format revenue
            const formattedRevenue = '$ ' + totalRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            revenueResult.textContent = formattedRevenue;
            
            // Dynamic comparison hint
            const monthlyCost = 3.90;
            if (totalRevenue > 0) {
                const singleEvalPaidMonths = Math.floor(price / monthlyCost);
                if (singleEvalPaidMonths > 1) {
                    comparisonText.textContent = `1 single evaluation pays ${singleEvalPaidMonths} months of the system!`;
                } else if (singleEvalPaidMonths === 1) {
                    comparisonText.textContent = `1 single evaluation pays 1 month of the system!`;
                } else {
                    comparisonText.textContent = `Guaranteed financial return!`;
                }
            } else {
                comparisonText.textContent = `Simulate your return`;
            }
        }
        
        qtySlider.addEventListener('input', updateROI);
        priceSlider.addEventListener('input', updateROI);
        
        // Initial run
        updateROI();
    }

    // ==========================================
    // 8. ANIMATED CLIENTS COUNTER
    // ==========================================
    const counterElement = document.getElementById('clients-counter');
    if (counterElement) {
        const targetNumber = 600;
        const duration = 2000;
        
        const animateCounter = () => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                
                const easeProgress = progress * (2 - progress);
                
                counterElement.textContent = Math.floor(easeProgress * targetNumber);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    counterElement.textContent = targetNumber;
                }
            };
            window.requestAnimationFrame(step);
        };
        
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        counterObserver.observe(counterElement);
    }

});

function copyCouponCode() {
    const codeText = document.getElementById("promo-code").innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        const btn = document.querySelector(".btn-copy-coupon");
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            btn.classList.add("copied");
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                btn.classList.remove("copied");
            }, 2000);
        }
    }).catch(err => {
        console.error("Failed to copy coupon: ", err);
    });
}
window.copyCouponCode = copyCouponCode;
