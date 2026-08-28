        gsap.registerPlugin(ScrollTrigger);

        /* ---------------- Lenis smooth scroll ---------------- */
        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        // Smooth-scroll anchor links through Lenis
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const id = link.getAttribute('href');
                if (id.length > 1 && document.querySelector(id)) {
                    e.preventDefault();
                    lenis.scrollTo(id, { offset: 0, duration: 1.4 });
                }
            });
        });

        /* ---------------- Circle Navbar ---------------- */
        const circleNavbar = document.getElementById('circle-navbar');
        const navCircle = document.getElementById('nav-circle');
        const navItems = document.querySelectorAll('.nav-item');
        const radius = 130;
        const totalItems = navItems.length;
        let navbarHovered = false;

        // Position items in a circle + build letter spans for labels
        navItems.forEach((item, index) => {
            const angle = (index / totalItems) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            item.style.left = `calc(50% + ${x}px - 20px)`;
            item.style.top = `calc(50% + ${y}px - 20px)`;

            const label = item.querySelector('.nav-label');
            const text = item.getAttribute('data-label') || '';
            label.innerHTML = text
                .split('')
                .map((ch) => `<span class="letter">${ch === ' ' ? '&nbsp;' : ch}</span>`)
                .join('');
        });

        // Rotation is applied purely from the section-progress calculation
        // below (updateActiveNav) — no independent scroll-fraction-of-page
        // animation here, so the ring never drifts out of sync with the
        // actual section being viewed.

        function showLabel(item, delay = 0) {
            const letters = item.querySelectorAll('.nav-label .letter');
            gsap.to(letters, {
                opacity: 1,
                y: 0,
                duration: 0.35,
                stagger: 0.02,
                delay,
                ease: 'power2.out',
                overwrite: true,
            });
        }

        function hideLabel(item) {
            const letters = item.querySelectorAll('.nav-label .letter');
            gsap.to(letters, {
                opacity: 0,
                y: 8,
                duration: 0.2,
                stagger: 0.012,
                ease: 'power2.in',
                overwrite: true,
            });
        }

        // Show only the active section's label by default; reveal every
        // label together (cascading) whenever the navbar itself is hovered.
        function refreshLabels() {
            navItems.forEach((item, i) => {
                if (navbarHovered) {
                    showLabel(item, i * 0.03);
                } else if (item.classList.contains('active')) {
                    showLabel(item);
                } else {
                    hideLabel(item);
                }
            });
        }

        circleNavbar.addEventListener('mouseenter', () => {
            navbarHovered = true;
            refreshLabels();
        });
        circleNavbar.addEventListener('mouseleave', () => {
            navbarHovered = false;
            refreshLabels();
        });

        // Reveal the active section's label right away, no hover needed
        refreshLabels();

        // Icons stay fixed in place relative to each other; the whole ring
        // rotates in lockstep with the current section instead. Rotation is
        // calibrated directly from which section is active and how far
        // scrolled through it (same 150px anchor line used for the active
        // state), NOT from raw scroll-% of the whole document — so the ring
        // always matches the section actually on screen, one slice (360° /
        // number of sections) per section, and never runs ahead or behind.
        // Hooked into Lenis's own scroll event (in addition to the native
        // window scroll) so it stays reliably in sync during smooth scroll.
        const sections = ['hero', 'life-story', 'experience', 'ventures', 'motive', 'gallery', 'blogs'];
        function updateActiveNav() {
            let activeIndex = 0;
            let progress = 0;
            let activeChanged = false;

            sections.forEach((id, index) => {
                const section = document.getElementById(id);
                if (!section) return;
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    activeIndex = index;
                    progress = Math.min(1, Math.max(0, (150 - rect.top) / (rect.height || 1)));
                    if (!navItems[index].classList.contains('active')) {
                        navItems.forEach((nav) => nav.classList.remove('active'));
                        navItems[index].classList.add('active');
                        activeChanged = true;
                    }
                }
            });

            const rotation = -((activeIndex + progress) / totalItems) * 360;
            navCircle.style.transform = `rotate(${rotation}deg)`;
            navItems.forEach((item) => {
                item.style.transform = `rotate(${-rotation}deg)`;
            });

            if (activeChanged) refreshLabels();
        }
        lenis.on('scroll', updateActiveNav);
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav();

        /* ---------------- Hero entrance ---------------- */
        gsap.set('.hero-in', { opacity: 0, y: 30 });
        gsap.to('.hero-in', {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.2,
        });

        /* ---------------- Story Section Animations ---------------- */
        document.querySelectorAll('.story-section').forEach((section) => {
            gsap.to(section, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                },
            });
        });

        /* ---------------- Generic scroll reveals ---------------- */
        ScrollTrigger.batch('.reveal', {
            start: 'top 85%',
            onEnter: (batch) =>
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.12,
                    overwrite: true,
                }),
        });

        ScrollTrigger.batch('.reveal-scale', {
            start: 'top 88%',
            onEnter: (batch) =>
                gsap.to(batch, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.1,
                    overwrite: true,
                }),
        });

        /* ---------------- Experience Line Animation ---------------- */
        gsap.to('#line', {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: '#experience',
                start: 'top center',
                end: 'bottom center',
                scrub: 1,
            },
        });

        /* ---------------- Message Section: typing animation ---------------- */
        const quote = "I started as a call center agent. Today, I lead an industry — because outsourcing isn't just business, it's opportunity.";
        const typingEl = document.getElementById('typing-text');
        let hasTyped = false;

        ScrollTrigger.create({
            trigger: '#message',
            start: 'top 65%',
            onEnter: () => {
                if (hasTyped) return;
                hasTyped = true;

                let i = 0;
                const typeSpeed = 32;
                const typer = setInterval(() => {
                    typingEl.textContent += quote[i];
                    i++;
                    if (i >= quote.length) {
                        clearInterval(typer);
                    }
                }, typeSpeed);

                gsap.to('#message-author', {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: (quote.length * typeSpeed) / 1000 + 0.3,
                    ease: 'power2.out',
                });
            },
        });
