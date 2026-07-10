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
        // Duplica os cards de depoimento para criar um loop de scroll infinito contínuo
        const originalCards = Array.from(testimonialsSlider.children);
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            testimonialsSlider.appendChild(clone);
        });

        let scrollSpeed = 0.6; // Velocidade do auto-scroll (pixels por frame)
        let isPaused = false;
        let resumeTimeout;

        // Loop principal do ticker
        function autoScroll() {
            if (!isPaused) {
                testimonialsSlider.scrollLeft += scrollSpeed;
                
                // Quando passar do final da lista original, volta para o início de forma invisível
                const maxScroll = testimonialsSlider.scrollWidth / 2;
                if (testimonialsSlider.scrollLeft >= maxScroll) {
                    testimonialsSlider.scrollLeft -= maxScroll;
                }
            }
            requestAnimationFrame(autoScroll);
        }

        // Inicializa o auto-scroll
        requestAnimationFrame(autoScroll);

        // Pausa no hover do mouse para permitir leitura/interação
        testimonialsSlider.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        // Retoma o scroll ao retirar o mouse
        testimonialsSlider.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        // Pausa no toque (mobile) para não atrapalhar o gesto do usuário
        testimonialsSlider.addEventListener('touchstart', () => {
            isPaused = true;
            clearTimeout(resumeTimeout);
        }, { passive: true });

        // Retoma o scroll automático no mobile após um pequeno delay pós-gesto
        testimonialsSlider.addEventListener('touchend', () => {
            clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(() => {
                isPaused = false;
            }, 2000); // 2 segundos de pausa para cessar a inércia do scroll manual
        }, { passive: true });
    }

    // ==========================================
    // 3. SCROLL-TRIGGERED BENEFITS ANIMATION
    // ==========================================
    const benefitItems = document.querySelectorAll('.scroll-animate');
    
    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target); // Executa apenas uma vez
            }
        });
    }, {
        threshold: 0.05, // Dispara quando 5% do item está visível (ótimo para mobile)
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

    // Dynamically update the slider container height to match the active card
    function updateSliderHeight() {
        if (!featuresSlider || featureCards.length === 0) return;
        const activeCard = featureCards[currentFeatureIndex];
        if (activeCard) {
            // Measure scrollHeight directly as the card is always expanded
            const height = activeCard.scrollHeight;
            featuresSlider.style.height = `${height}px`;
        }
    }

    // Create pagination dots
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

        // Remove active class and set proper layout state for all cards
        featureCards.forEach((c, idx) => {
            c.classList.remove('active');
            if (idx < index) {
                c.classList.add('prev');
            } else {
                c.classList.remove('prev');
            }
        });

        // Ensure old card slides out in correct direction
        if (isNext) {
            oldCard.classList.add('prev');
        } else {
            oldCard.classList.remove('prev');
        }

        // Ensure new active card transitions in
        newCard.classList.add('active');
        newCard.classList.remove('prev');

        currentFeatureIndex = index;
        updateFeatureIndicators();
        
        // Wait a tiny bit for transition to start before measuring height
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

    // Set initial height
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
            
            // Toggle current FAQ
            if (item.classList.contains('active')) {
                answer.style.maxHeight = '0';
                item.classList.remove('active');
            } else {
                // Close other open FAQ items first (optional, standard accordion behavior)
                document.querySelectorAll('.faq-item.active').forEach(openItem => {
                    openItem.classList.remove('active');
                    openItem.querySelector('.faq-answer').style.maxHeight = '0';
                });
                               // Open clicked FAQ item
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
            priceVal.textContent = 'R$ ' + price;
            
            // Calculate revenue
            const totalRevenue = qty * price;
            
            // Format revenue to currency BRL
            const formattedRevenue = totalRevenue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            
            revenueResult.textContent = formattedRevenue;
            
            // Dynamic comparison hint (e.g. "1 única avaliação paga X meses de sistema!")
            const monthlyCost = 19.90;
            if (totalRevenue > 0) {
                const singleEvalPaidMonths = Math.floor(price / monthlyCost);
                if (singleEvalPaidMonths > 1) {
                    comparisonText.textContent = `1 única avaliação paga ${singleEvalPaidMonths} meses de sistema!`;
                } else if (singleEvalPaidMonths === 1) {
                    comparisonText.textContent = `1 única avaliação paga 1 mês de sistema!`;
                } else {
                    comparisonText.textContent = `Retorno financeiro garantido!`;
                }
            } else {
                comparisonText.textContent = `Simule seu retorno`;
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
        const duration = 2000; // 2 seconds
        
        const animateCounter = () => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                
                // Easing function: easeOutQuad
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
