document.addEventListener('DOMContentLoaded', () => {

    // Entry Screen Logic
    const entryScreen = document.getElementById('entry-screen');
    const text1Element = document.getElementById('typing-text-1');
    const text2Element = document.getElementById('typing-text-2');
    const openBtn = document.getElementById('open-invitation-btn');
    
    const text1 = "Shinin Abdullah & Fathima Abdul Jamal";
    const text2 = "Our wedding on 21st October 2026";
    
    function typeWriter(text, i, element, callback) {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            setTimeout(() => typeWriter(text, i + 1, element, callback), 60); // typing speed
        } else if (callback) {
            setTimeout(callback, 500); // pause before next action
        }
    }
    
    if (entryScreen) {
        // Start typing after a short delay
        setTimeout(() => {
            typeWriter(text1, 0, text1Element, () => {
                
                // Hide cursor on main text
                text1Element.classList.add('done-typing');
                
                // Start typing the subtitle text
                typeWriter(text2, 0, text2Element, () => {
                    // Hide cursor on subtitle too if desired (or leave it blinking)
                    text2Element.classList.add('done-typing');
                    
                    // Show button shortly after
                    setTimeout(() => {
                        openBtn.classList.remove('hide');
                        openBtn.classList.add('fade-in-up');
                        
                        // Auto close after 5 seconds if not clicked
                        setTimeout(closeEntryScreen, 5000);
                    }, 400);
                });
            });
        }, 800);
        
        openBtn.addEventListener('click', closeEntryScreen);
    }
    
    // Background Audio / Nasheed Logic
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    const musicStatusText = document.getElementById('music-status-text');
    let isPlaying = false;
    let userHasManuallyMuted = false;

    function updateMusicUI(playing) {
        if (!musicBtn) return;
        if (playing) {
            musicBtn.classList.add('playing');
            musicBtn.classList.remove('muted');
            musicBtn.setAttribute('title', 'Mute Nasheed');
            if (musicStatusText) musicStatusText.textContent = 'Nasheed';
        } else {
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('muted');
            musicBtn.setAttribute('title', 'Play Nasheed');
            if (musicStatusText) musicStatusText.textContent = userHasManuallyMuted ? 'Muted' : 'Play Nasheed';
        }
    }

    function playMusic() {
        if (!bgMusic) return;
        bgMusic.volume = 0.35;
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updateMusicUI(true);
            }).catch(() => {
                isPlaying = false;
                updateMusicUI(false);
            });
        }
    }

    function pauseMusic() {
        if (!bgMusic) return;
        bgMusic.pause();
        isPlaying = false;
        updateMusicUI(false);
    }

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isPlaying) {
                userHasManuallyMuted = true;
                pauseMusic();
            } else {
                userHasManuallyMuted = false;
                playMusic();
            }
        });
    }

    // Try subtle initial play if allowed
    playMusic();

    function closeEntryScreen() {
        if (!userHasManuallyMuted && !isPlaying) {
            playMusic();
        }
        if(!entryScreen.classList.contains('hidden')){
            entryScreen.classList.add('hidden');
            setTimeout(() => {
                entryScreen.style.display = 'none';
                /* Trigger hero animations here to ensure they only start when viewed */
                document.querySelector('.hero-content').classList.add('fade-in-up');
            }, 800);
        }
    }

    // Auto-enable audio on first interaction if not manually muted
    const enableAudioOnFirstInteraction = (e) => {
        if (e.target && (e.target.closest('#music-toggle-btn') || userHasManuallyMuted)) return;
        if (!isPlaying) {
            playMusic();
        }
        window.removeEventListener('click', enableAudioOnFirstInteraction);
        window.removeEventListener('touchstart', enableAudioOnFirstInteraction);
    };
    window.addEventListener('click', enableAudioOnFirstInteraction);
    window.addEventListener('touchstart', enableAudioOnFirstInteraction);

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smooth: true,
    });

    // Parallax hero bg linked to Lenis Native Scroll
    const heroBg = document.getElementById('hero-bg');

    lenis.on('scroll', (e) => {
        if (heroBg && window.scrollY < window.innerHeight) {
            // Apple-like subtle scroll scale and translate on hero
            heroBg.style.transform = `translateY(${window.scrollY * 0.4}px) scale(${1 + window.scrollY * 0.0002})`;
        }
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Countdown Logic (21st October 2026 at 11:00 AM)
    const targetDate = new Date("October 21, 2026 11:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById('countdown').innerHTML = "<p>The celebration has begun!</p>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    };

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.split-animate');
    animatedElements.forEach(el => observer.observe(el));

    // Particles System - Floating Hearts
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        let particlesArray = [];

        class Particle {
            constructor(x, y, dx, dy, size, color, isHover = false) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.size = size;
                this.color = color;
                this.opacity = isHover ? 0.9 : 0.35; // Hover -> highly visible, Regular -> barely noticeable
                this.life = isHover ? 100 : Infinity; // lifetimes for hover burst
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.opacity);
                ctx.fillStyle = this.color;
                ctx.translate(this.x, this.y);
                const s = this.size;
                ctx.beginPath();
                ctx.moveTo(0, s/4);
                ctx.arc(-s/4, -s/4, s/2.5, Math.PI, 0, false);
                ctx.arc(s/4, -s/4, s/2.5, Math.PI, 0, false);
                ctx.lineTo(0, s);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            update() {
                // Parallax drift based on scroll native
                this.y += this.dy; // Natural drift

                if (this.life === Infinity) {
                    this.x += this.dx;
                    // Wrap around canvas logic for infinite particles
                    if (this.y < -50) this.y = canvas.height + 50;
                    if (this.x < -50) this.x = canvas.width + 50;
                    if (this.x > canvas.width + 50) this.x = -50;
                } else {
                    // Hover particles disperse, slow down, string out and shrink
                    this.x += this.dx;
                    this.y -= this.dy * 1.5; // fly upwards like balloons
                    this.dx *= 0.98; // friction
                    
                    this.life--;
                    this.opacity -= 0.009;
                    this.size *= 0.95; // slowly shrink
                }

                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            let numberOfParticles = (canvas.width * canvas.height) / 35000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 8) + 3;
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                let dx = (Math.random() - 0.5) * 0.3; 
                let dy = (Math.random() - 0.5) * 0.3 - 0.3; // slowly drifting up
                
                // Color array: soft light pinks / golds
                let colors = ['#fce4ec', '#f8bbd0', '#f48fb1', '#fff3e0'];
                let color = colors[Math.floor(Math.random() * colors.length)];
                
                particlesArray.push(new Particle(x, y, dx, dy, size, color));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                if (particlesArray[i].life <= 0 || particlesArray[i].size < 0.2) {
                    particlesArray.splice(i, 1);
                    i--;
                }
            }
        }

        initParticles();
        animateParticles();

        // Add hover effects for buttons, gallery images, quotes
        const hoverElements = document.querySelectorAll('.gallery-item, .btn, .quote');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const rect = el.getBoundingClientRect();
                // We add pageYOffset because canvas is fixed. 
                // Alternatively, just send the client coordinates because Canvas is fixed!
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // create burst of small high opacity heart particles that float up
                for(let i=0; i<8; i++){
                    let dx = (Math.random() - 0.5) * 4; // horizontal random drift
                    let dy = Math.random() * 2 + 1; // upwards drifting explicitly
                    let size = Math.random() * 12 + 8;
                    particlesArray.push(new Particle(centerX, centerY, dx, dy, size, '#ffb6c1', true));
                }
            });
        });
    }

});
