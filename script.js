/**
 * Royal Muslim Wedding Invitation — Interactive Script
 * Features: 3D Video Envelope Reveal, Vocal Nasheed Audio,
 * Scratch-to-reveal Date, Countdown Timer, Gold Dust Particles & Smooth Scroll.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Ensure page strictly loads and remains at top (0,0) during opening animation
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.classList.add('opening-active');

    // =========================================================================
    // 1. Ultra-Smooth Lenis Scroll Configuration (Initialized stopped during opening)
    // =========================================================================
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false, // native momentum on mobile for 120Hz buttery smoothness
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
        });

        // Stop Lenis while envelope animation plays so user cannot scroll away
        lenis.stop();

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // =========================================================================
    // 2. Audio / Nasheed Player Logic
    // =========================================================================
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('floating-music-btn');
    let isMusicPlaying = false;
    let userManuallyMuted = false;

    function updateMusicUI(playing) {
        if (!musicBtn) return;
        const tooltip = musicBtn.querySelector('.music-tooltip');
        if (playing) {
            musicBtn.classList.add('playing');
            musicBtn.classList.remove('muted');
            musicBtn.setAttribute('title', 'Click to Mute Sound');
            musicBtn.setAttribute('aria-label', 'Mute Sound');
            if (tooltip) tooltip.textContent = 'Mute';
        } else {
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('muted');
            musicBtn.setAttribute('title', 'Click to Play Sound');
            musicBtn.setAttribute('aria-label', 'Play Sound');
            if (tooltip) tooltip.textContent = 'Unmute';
        }
    }

    function playNasheed() {
        if (!bgMusic || userManuallyMuted) return;
        bgMusic.volume = 0.45;
        const promise = bgMusic.play();
        if (promise !== undefined) {
            promise.then(() => {
                isMusicPlaying = true;
                updateMusicUI(true);
            }).catch(() => {
                isMusicPlaying = false;
                updateMusicUI(false);
            });
        }
    }

    function pauseNasheed() {
        if (!bgMusic) return;
        bgMusic.pause();
        isMusicPlaying = false;
        updateMusicUI(false);
    }

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMusicPlaying) {
                userManuallyMuted = true;
                pauseNasheed();
            } else {
                userManuallyMuted = false;
                playNasheed();
            }
        });
    }

    // =========================================================================
    // 3. Interactive 3D Video Envelope Opening (Auto-play on load + smooth reveal)
    // =========================================================================
    const envelopeScreen = document.getElementById('envelope-screen');
    const envelopeVideo = document.getElementById('envelope-video');
    const invitationContent = document.getElementById('invitation-content');
    const replayEnvelopeBtn = document.getElementById('replay-envelope-btn');
    let isEnvelopeOpening = false;

    function finishOpening() {
        if (!envelopeScreen || envelopeScreen.classList.contains('opened')) return;
        envelopeScreen.classList.add('opened');

        // Reveal floating music control button once invitation is opened
        const musicContainer = document.getElementById('floating-music-container') || document.querySelector('.floating-music-btn-container');
        if (musicContainer) {
            musicContainer.classList.add('visible');
        }

        // Guarantee view is strictly at the top of the card
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        if (invitationContent) {
            invitationContent.classList.add('visible');
        }

        setTimeout(() => {
            envelopeScreen.style.display = 'none';
            document.body.classList.remove('opening-active');
            if (envelopeVideo) {
                envelopeVideo.pause();
            }
            window.scrollTo(0, 0);
            if (lenis) {
                lenis.resize();
                lenis.start();
                lenis.scrollTo(0, { immediate: true });
            }
        }, 750);
    }

    function triggerEnvelopeOpen() {
        if (isEnvelopeOpening) {
            finishOpening();
            playNasheed();
            return;
        }
        isEnvelopeOpening = true;

        if (tapPrompt) {
            tapPrompt.style.opacity = '0';
            tapPrompt.style.pointerEvents = 'none';
        }

        playNasheed();

        if (envelopeVideo) {
            envelopeVideo.play().catch(() => {});
            envelopeVideo.addEventListener('ended', finishOpening, { once: true });
            envelopeVideo.addEventListener('timeupdate', () => {
                if (envelopeVideo.currentTime >= 2.6) finishOpening();
            });
            setTimeout(finishOpening, 2900);
        } else {
            finishOpening();
        }
    }

    // Auto-play envelope video immediately on page load
    if (envelopeVideo) {
        envelopeVideo.muted = true;
        const autoPlayPromise = envelopeVideo.play();
        if (autoPlayPromise !== undefined) {
            autoPlayPromise.then(() => {
                isEnvelopeOpening = true;
                envelopeVideo.addEventListener('ended', finishOpening, { once: true });
                envelopeVideo.addEventListener('timeupdate', () => {
                    if (envelopeVideo.currentTime >= 2.6) finishOpening();
                });
                setTimeout(finishOpening, 2900);
            }).catch(() => {
                // If autoplay prevented, user can tap anywhere to start
            });
        }
    }

    if (envelopeScreen) {
        envelopeScreen.addEventListener('click', triggerEnvelopeOpen);
    }

    // Auto-enable Nasheed audio on first user touch/click/scroll if browser blocked initial autoplay
    const startAudioOnFirstInteraction = (e) => {
        if (userManuallyMuted) return;
        if (e && e.target && e.target.closest('#floating-music-btn')) return;
        if (!isMusicPlaying) {
            playNasheed();
        }
        ['click', 'touchstart', 'scroll'].forEach(evt => {
            window.removeEventListener(evt, startAudioOnFirstInteraction, { capture: true });
        });
    };
    ['click', 'touchstart', 'scroll'].forEach(evt => {
        window.addEventListener(evt, startAudioOnFirstInteraction, { capture: true, passive: true });
    });

    // Replay Video Envelope
    if (replayEnvelopeBtn) {
        replayEnvelopeBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            document.body.classList.add('opening-active');
            const musicContainer = document.getElementById('floating-music-container') || document.querySelector('.floating-music-btn-container');
            if (musicContainer) {
                musicContainer.classList.remove('visible');
            }
            if (lenis) {
                lenis.stop();
                lenis.scrollTo(0, { immediate: true });
            }
            isEnvelopeOpening = false;
            if (envelopeScreen) {
                envelopeScreen.style.display = 'flex';
                envelopeScreen.classList.remove('opened');
                if (envelopeVideo) {
                    envelopeVideo.currentTime = 0;
                    envelopeVideo.play().catch(() => {});
                }
            }
        });
    }

    // =========================================================================
    // 4. Countdown Timer Logic (October 21, 2026 at 11:00 AM)
    // =========================================================================
    const targetDate = new Date("October 21, 2026 11:00:00").getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            if (daysEl) daysEl.innerText = "00";
            if (hoursEl) hoursEl.innerText = "00";
            if (minutesEl) minutesEl.innerText = "00";
            if (secondsEl) secondsEl.innerText = "00";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // =========================================================================
    // 5. Intersection Observer for Scroll Animations
    // =========================================================================
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in-on-scroll').forEach(el => scrollObserver.observe(el));

    // =========================================================================
    // 6. Interactive Scratch-to-Reveal Card
    // =========================================================================
    const scratchCanvas = document.getElementById('scratch-canvas');
    const autoRevealBtn = document.getElementById('auto-reveal-btn');

    if (scratchCanvas) {
        const ctx = scratchCanvas.getContext('2d');
        const wrapper = scratchCanvas.parentElement;
        let isDrawing = false;
        let isRevealed = false;

        function resizeCanvas() {
            scratchCanvas.width = wrapper.offsetWidth;
            scratchCanvas.height = wrapper.offsetHeight;
            drawScratchCover();
        }

        function drawScratchCover() {
            const w = scratchCanvas.width;
            const h = scratchCanvas.height;

            // Metallic Brushed Gold Gradient
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#D2C08A');
            grad.addColorStop(0.35, '#f3e9cf');
            grad.addColorStop(0.65, '#9E824A');
            grad.addColorStop(1, '#D2C08A');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Shimmering pattern overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            for (let i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Elegant instruction text on scratch surface
            ctx.fillStyle = '#3a2c18';
            ctx.font = '600 13px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.letterSpacing = '2px';
            ctx.fillText('✦ SCRATCH TO REVEAL DATE ✦', w / 2, h / 2 - 8);

            ctx.fillStyle = '#6e5e47';
            ctx.font = '500 11px "Montserrat", sans-serif';
            ctx.fillText('Touch & drag across the gold surface', w / 2, h / 2 + 16);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function scratch(x, y) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 28, 0, Math.PI * 2);
            ctx.fill();
            checkScratchPercent();
        }

        function checkScratchPercent() {
            if (isRevealed) return;
            const pixels = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
            let clearCount = 0;
            const total = pixels.length / 4;
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] === 0) clearCount += 4;
            }
            if (clearCount / total > 0.4) {
                revealCompletely();
            }
        }

        function revealCompletely() {
            isRevealed = true;
            scratchCanvas.style.opacity = '0';
            setTimeout(() => {
                scratchCanvas.style.display = 'none';
            }, 600);
        }

        function getPos(e) {
            const rect = scratchCanvas.getBoundingClientRect();
            if (e.touches && e.touches[0]) {
                return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
            }
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        scratchCanvas.addEventListener('mousedown', (e) => { isDrawing = true; const p = getPos(e); scratch(p.x, p.y); });
        scratchCanvas.addEventListener('mousemove', (e) => { if (isDrawing) { const p = getPos(e); scratch(p.x, p.y); } });
        window.addEventListener('mouseup', () => { isDrawing = false; });

        scratchCanvas.addEventListener('touchstart', (e) => { isDrawing = true; const p = getPos(e); scratch(p.x, p.y); }, { passive: true });
        scratchCanvas.addEventListener('touchmove', (e) => { if (isDrawing) { const p = getPos(e); scratch(p.x, p.y); } }, { passive: true });
        window.addEventListener('touchend', () => { isDrawing = false; });

        if (autoRevealBtn) {
            autoRevealBtn.addEventListener('click', revealCompletely);
        }
    }

    // =========================================================================
    // 7. Golden Sparkle & Ambient Dust Particles
    // =========================================================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        const particles = [];
        const count = Math.min(22, Math.floor(window.innerWidth / 45));

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.8,
                dy: -(Math.random() * 0.45 + 0.15),
                dx: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.3 ? '#D2C08A' : '#ffffff'
            });
        }

        function renderParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y += p.dy;
                p.x += p.dx;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            });
            requestAnimationFrame(renderParticles);
        }
        renderParticles();
    }

    // =========================================================================
    // 8. Share Invitation
    // =========================================================================
    const shareBtn = document.getElementById('share-invite-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Wedding Invitation | Shinin Abdullah & Fathima Abdul Jamal',
                text: 'Join us in celebrating the sacred Wedding Ceremony of Shinin Abdullah & Fathima Abdul Jamal on Wednesday, October 21, 2026 at Meruzila Convention Center.',
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {}
            } else {
                navigator.clipboard.writeText(window.location.href);
                const originalText = shareBtn.querySelector('span').textContent;
                shareBtn.querySelector('span').textContent = 'Link Copied!';
                setTimeout(() => {
                    shareBtn.querySelector('span').textContent = originalText;
                }, 2500);
            }
        });
    }

});
