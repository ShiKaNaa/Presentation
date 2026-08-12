document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const deck = document.getElementById('presentationDeck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const currentIndicator = document.getElementById('currentSlide');
  const progressBar = document.getElementById('progressBar');
  const transitionChips = document.querySelectorAll('.transition-chip');
  const nextTriggers = document.querySelectorAll('.next-trigger');

  let currentSlideIndex = 0;

  // Touch Swipe Variables
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  /**
   * Navigate to a slide by index
   * @param {number} index - Index of slide (0-based)
   * @param {boolean} updateHash - Whether to update the URL hash
   */
  function goToSlide(index, updateHash = true) {
    if (index < 0 || index >= slides.length) return;

    const previousIndex = currentSlideIndex;
    currentSlideIndex = index;

    // Update active, previous, and next states for CSS transitions
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'previous', 'next');

      if (i === currentSlideIndex) {
        slide.classList.add('active');
      } else if (i < currentSlideIndex) {
        slide.classList.add('previous');
      } else {
        slide.classList.add('next');
      }
    });

    // Update floating controls UI
    currentIndicator.textContent = currentSlideIndex + 1;

    // Update progress bar width
    const progressPercent = (currentSlideIndex / (slides.length - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update URL hash for deep linking without triggering default browser scroll
    if (updateHash) {
      history.pushState(null, null, `#slide-${currentSlideIndex + 1}`);
    }

    // Confetti burst when going from Slide 1 to Slide 2
    if (previousIndex === 0 && currentSlideIndex === 1) {
      launchTransitionConfetti();
    }

    // Applause confetti on final slide (slide-11)
    if (slides[currentSlideIndex].id === 'slide-11') {
      launchApplauseConfetti();
    }

    // Reset & render quiz when reaching slide-10
    if (slides[currentSlideIndex].id === 'slide-10') {
      renderQuizQuestion();
    }

    // Animate the donut chart when reaching slide-4
    if (slides[currentSlideIndex].id === 'slide-4') {
      animateDonut();
    }
  }

  // Navigation functions
  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Event Listeners: Navigation Buttons
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Event Listeners: Internal Slide triggers (e.g. start button on Slide 1)
  nextTriggers.forEach(trigger => {
    trigger.addEventListener('click', nextSlide);
  });

  // Event Listeners: Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    // Avoid interrupting standard inputs
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // Lock Space key on the quiz slide (slide-10)
    if (slides[currentSlideIndex].id === 'slide-10') {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        return;
      }
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        nextSlide();
        break;
      case 'Space':
      case ' ': // space bar
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slides.length - 1);
        break;
    }
  });

  // Event Listeners: Mobile Swipe Support
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) >= minSwipeDistance) {
      if (swipeDistance < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  // Event Listeners: Dynamic Transition Picker
  transitionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      transitionChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const transitionType = chip.getAttribute('data-transition');

      const transitionClasses = Array.from(deck.classList).filter(cls => cls.startsWith('transition-'));
      transitionClasses.forEach(cls => deck.classList.remove(cls));

      deck.classList.add(`transition-${transitionType}`);
    });
  });

  // Deep Linking: Handle URL Hash on Load and Hash Change
  function handleHash() {
    const hash = window.location.hash;
    const match = hash.match(/^#slide-(\d+)$/);

    if (match) {
      const slideNum = parseInt(match[1], 10);
      if (slideNum >= 1 && slideNum <= slides.length) {
        goToSlide(slideNum - 1, false);
        return;
      }
    }
    goToSlide(0, false);
  }

  window.addEventListener('hashchange', handleHash);


  // --- SLIDE TRANSITION CONFETTI (slide 1 → 2) ---
  function launchTransitionConfetti() {
    const existing = document.querySelector('.slide-confetti-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'slide-confetti-container';

    const colors = [
      '#00f5d4', '#9d4edd', '#ff007f', '#3a86c8', '#ffb703',
      '#ff6b6b', '#51cf66', '#ffd43b', '#74c0fc', '#f06595'
    ];
    const shapes = ['rect', 'circle', 'ribbon'];

    for (let i = 0; i < 90; i++) {
      const piece = document.createElement('div');
      piece.className = 'slide-confetti-piece';

      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.random() * 8 + 6;
      const left = Math.random() * 110 - 5;
      const duration = Math.random() * 1.5 + 2;
      const delay = Math.random() * 0.8;
      const drift = (Math.random() - 0.5) * 200;

      piece.style.cssText = `
        left: ${left}%;
        width: ${shape === 'ribbon' ? size * 3 : size}px;
        height: ${shape === 'ribbon' ? size * 0.4 : size}px;
        background-color: ${color};
        border-radius: ${shape === 'circle' ? '50%' : shape === 'ribbon' ? '2px' : '3px'};
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: 0;
        animation-fill-mode: both;
        transform-origin: center center;
        animation-name: slideConfettiFall;
        --drift: ${drift}px;
      `;

      container.appendChild(piece);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 4500);
  }

  // --- APPLAUSE CONFETTI (slide finale) ---
  function launchApplauseConfetti() {
    const existing = document.querySelector('.applause-confetti-container');
    if (existing) return; // Don't re-trigger if already done

    const container = document.createElement('div');
    container.className = 'applause-confetti-container slide-confetti-container';

    const colors = [
      '#ffd700', '#ff007f', '#00f5d4', '#9d4edd', '#ff6b6b',
      '#ffb703', '#74c0fc', '#51cf66', '#f06595', '#3a86c8'
    ];
    const shapes = ['rect', 'circle', 'ribbon'];

    for (let i = 0; i < 120; i++) {
      const piece = document.createElement('div');
      piece.className = 'slide-confetti-piece';

      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.random() * 10 + 6;
      const left = Math.random() * 110 - 5;
      const duration = Math.random() * 2 + 2;
      const delay = Math.random() * 1.2;
      const drift = (Math.random() - 0.5) * 300;

      piece.style.cssText = `
        left: ${left}%;
        width: ${shape === 'ribbon' ? size * 3 : size}px;
        height: ${shape === 'ribbon' ? size * 0.4 : size}px;
        background-color: ${color};
        border-radius: ${shape === 'circle' ? '50%' : shape === 'ribbon' ? '2px' : '3px'};
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: 0;
        animation-fill-mode: both;
        transform-origin: center center;
        animation-name: slideConfettiFall;
        --drift: ${drift}px;
      `;

      container.appendChild(piece);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 6000);
  }

  // --- DONUT CHART ANIMATION (slide 4) ---
  let donutAnimated = false;

  function animateDonut() {
    if (donutAnimated) return;
    donutAnimated = true;

    const talent = document.querySelector('.seg-talent');
    const cafe   = document.querySelector('.seg-cafe');
    if (!talent || !cafe) return;

    // Start from 0 and animate to final values
    const circumference = 2 * Math.PI * 70; // r=70 → ~439.8
    const talentPct = 0.98;
    const cafePct   = 0.02;

    talent.style.transition = 'stroke-dasharray 1.6s cubic-bezier(0.4, 0, 0.2, 1)';
    cafe.style.transition   = 'stroke-dasharray 1.6s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)';

    // Set start state
    talent.setAttribute('stroke-dasharray', `0 ${circumference}`);
    cafe.setAttribute('stroke-dasharray', `0 ${circumference}`);
    cafe.setAttribute('stroke-dashoffset', '0');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        talent.setAttribute('stroke-dasharray', `${circumference * talentPct} ${circumference * cafePct}`);
        cafe.setAttribute('stroke-dasharray', `${circumference * cafePct} ${circumference * talentPct}`);
        cafe.setAttribute('stroke-dashoffset', `${-(circumference * talentPct)}`);
      });
    });
  }

  // --- INTERACTIVE QUIZ ENGINE ---
  const quizQuestions = [
    {
      question: "Quel est mon niveau officiel au jeu de Go ?",
      options: [
        "10 kyu",
        "3 kyu ffg",
        "1 Dan",
        "5 kyu"
      ],
      answer: 1
    },
    {
      question: "Quel est le dernier instrument de musique que j'ai essayé d'apprendre ?",
      options: ["Le piano", "La guitare", "La batterie", "La basse"],
      answer: 2
    },
    {
      question: "Quel voyage fait avec Gaëlle m'a le plus marqué aujourd'hui ?",
      options: [
        "Un voyage au Canada",
        "Un séjour au Japon",
        "Une randonnée en Islande",
        "Un roadtrip aux USA"
      ],
      answer: 0
    },
    {
      question: "Qui est ma personne préférée au monde ?",
      options: [
        "David Hume",
        "Ma mère",
        "Moi évidemment",
        "Einstein"
      ],
      answer: 2
    }
  ];

  let currentQuestionIndex = 0;
  let quizScore = 0;

  const quizContainer = document.getElementById('quizContainer');
  const quizQuestionNum = document.getElementById('quizQuestionNum');
  const quizPercent = document.getElementById('quizPercent');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');

  function renderQuizQuestion() {
    if (!quizContainer || !quizQuestion) return;

    // Reset to first question each time the slide is visited
    if (currentQuestionIndex >= quizQuestions.length) {
      showQuizScore();
      return;
    }

    const currentQ = quizQuestions[currentQuestionIndex];

    quizQuestionNum.textContent = `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    const percent = Math.round((currentQuestionIndex / quizQuestions.length) * 100);
    quizPercent.textContent = `${percent}%`;
    quizProgressBar.style.width = `${percent}%`;

    quizQuestion.textContent = currentQ.question;

    quizOptions.innerHTML = '';
    currentQ.options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = option;
      btn.addEventListener('click', () => handleQuizAnswer(idx));
      quizOptions.appendChild(btn);
    });
  }

  function handleQuizAnswer(selectedIdx) {
    const currentQ = quizQuestions[currentQuestionIndex];
    const optionButtons = quizOptions.querySelectorAll('.quiz-option-btn');

    optionButtons.forEach((btn, idx) => {
      btn.classList.add('disabled');
      if (idx === currentQ.answer) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('incorrect');
      }
    });

    if (selectedIdx === currentQ.answer) quizScore++;

    setTimeout(() => {
      currentQuestionIndex++;
      renderQuizQuestion();
    }, 1500);
  }

  function showQuizScore() {
    quizQuestionNum.textContent = 'Quiz Terminé !';
    quizPercent.textContent = '100%';
    quizProgressBar.style.width = '100%';
    quizQuestion.textContent = 'Félicitations d\'avoir survécu à l\'épreuve intellectuelle !';

    let message = '';
    if (quizScore === quizQuestions.length) {
      message = '🏆 Score parfait ! Vous êtes soit un génie, soit vous avez triché. Les deux sont acceptés.';
    } else if (quizScore >= 3) {
      message = '😊 Bon score ! Vous avez clairement payé attention. Ma mère serait fière de vous.';
    } else {
      message = '👀 Hmm... Relisez les slides. Ou devenez philosophe. Hume accepterait ça.';
    }

    quizOptions.innerHTML = `
      <div class="quiz-score-screen">
        <div class="quiz-score-num">${quizScore} / ${quizQuestions.length}</div>
        <div class="quiz-score-msg">${message}</div>
        <button id="quizRestartBtn" class="quiz-restart-btn">🔄 Recommencer</button>
      </div>
    `;

    if (quizScore >= 3) createConfetti();

    document.getElementById('quizRestartBtn').addEventListener('click', restartQuiz);
  }

  function restartQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    const confettiEl = quizContainer.querySelector('.confetti-container');
    if (confettiEl) confettiEl.remove();
    renderQuizQuestion();
  }

  function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    const colors = ['#00f5d4', '#9d4edd', '#ff007f', '#3a86c8', '#ffb703'];
    for (let i = 0; i < 40; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = `${Math.random() * 6 + 6}px`;
      confetti.style.height = confetti.style.width;
      confetti.style.opacity = Math.random() * 0.7 + 0.3;
      confetti.style.animationDuration = `${Math.random() * 1.5 + 2}s`;
      confettiContainer.appendChild(confetti);
    }
    quizContainer.appendChild(confettiContainer);
  }

  // --- KITSCH APPLAUSE AUDIO SYNTHESIS ---
  let kitschApplauseTimeout = null;

  function scheduleKitschApplause() {
    cancelKitschApplause();
    kitschApplauseTimeout = setTimeout(() => {
      playKitschApplause();
    }, 3000);
  }

  function cancelKitschApplause() {
    if (kitschApplauseTimeout) {
      clearTimeout(kitschApplauseTimeout);
      kitschApplauseTimeout = null;
    }
  }

  function playKitschApplause() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Clap Sound Generator (White noise bandpass filtered with exponential gain)
      function createClap() {
        const bufferSize = ctx.sampleRate * 0.18;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 200;
        filter.Q.value = 2.5;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
      }
      
      // Kitsh brass OSC note
      function playNote(freq, start, duration) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration - 0.02);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      }
      
      // Retro kitsch fanfare melody: C4, E4, G4, C5 chord progression
      const melody = [261.63, 329.63, 392.00, 523.25];
      melody.forEach((freq, idx) => {
        playNote(freq, idx * 0.12, 1.0);
      });
      
      // Synthesize crowd claps for 3.5 seconds
      for (let i = 0; i < 70; i++) {
        const delay = Math.random() * 3.3;
        setTimeout(() => {
          try { createClap(); } catch (err) {}
        }, delay * 1000);
      }
    } catch (e) {
      console.warn('Audio Context is blocked or not supported:', e);
    }
  }

  // Initialize presentation
  handleHash();

  // --- PHOTO LIGHTBOX ---
  function initLightbox() {
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightboxImg');
    const lightboxCap   = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const backdrop      = document.getElementById('lightboxBackdrop');

    let isOpen = false;

    function openLightbox(src, alt, caption) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightboxCap.textContent = caption || '';
      lightbox.classList.add('lightbox--open');
      isOpen = true;
      setTimeout(() => lightboxClose.focus(), 50);
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--open');
      isOpen = false;
      setTimeout(() => { lightboxImg.src = ''; }, 350);
    }

    // Open on polaroid card click
    deck.addEventListener('click', (e) => {
      const card = e.target.closest('.polaroid-card');
      if (!card) return;

      const img     = card.querySelector('img');
      const caption = card.querySelector('.polaroid-caption');
      if (img) {
        openLightbox(img.src, img.alt, caption ? caption.textContent : '');
      }
    });

    backdrop.addEventListener('click', closeLightbox);
    lightboxClose.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        closeLightbox();
      }
    }, true);
  }

  initLightbox();

  // --- PERSON PHOTO MODAL (Slide 3) ---
  function initPersonModal() {
    const modal      = document.getElementById('personModal');
    const modalCard  = document.getElementById('personModalCard');
    const modalImg   = document.getElementById('personModalImg');
    const modalName  = document.getElementById('personModalName');
    const modalLabel = document.getElementById('personModalLabel');
    const backdrop   = document.getElementById('personModalBackdrop');

    if (!modal) return;

    function openPersonModal(photoSrc, personName, label) {
      // Try to load the image; fall back to placeholder if 404
      modalImg.src = '';
      modalName.textContent = personName;
      modalLabel.textContent = label;

      const testImg = new Image();
      testImg.onload  = () => { modalImg.src = photoSrc; };
      testImg.onerror = () => { modalImg.src = ''; };
      testImg.src = photoSrc;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closePersonModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      // Clear src after transition
      setTimeout(() => { modalImg.src = ''; }, 400);
    }

    // Open on person-card click
    deck.addEventListener('click', (e) => {
      const card = e.target.closest('.person-card');
      if (!card) return;

      const photo  = card.dataset.photo  || '';
      const person = card.dataset.person || '';
      const label  = card.dataset.label  || '';
      openPersonModal(photo, person, label);
    });

    // Close on backdrop or card click
    backdrop.addEventListener('click', closePersonModal);
    modalCard.addEventListener('click', closePersonModal);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        e.stopPropagation();
        closePersonModal();
      }
    }, true);
  }

  initPersonModal();
});
