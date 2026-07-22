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
  const minSwipeDistance = 50; // minimum distance in pixels for a swipe

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

    // If we transition to the Quiz slide (Slide 8), render/reset the quiz
    if (slides[currentSlideIndex].id === 'slide-8') {
      renderQuizQuestion();
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
    // Avoid interrupting standard inputs if the user adds them later
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // Lock Space key navigation on the quiz slide to prevent skipping slide when attempting to click options
    if (slides[currentSlideIndex].id === 'slide-8') {
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
        e.preventDefault(); // Prevents scroll on Space
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
        // Swiped left -> show next slide
        nextSlide();
      } else {
        // Swiped right -> show previous slide
        prevSlide();
      }
    }
  }

  // Event Listeners: Dynamic Transition Picker
  transitionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle chip active class
      transitionChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      // Get transition type
      const transitionType = chip.getAttribute('data-transition');

      // Clear existing transition classes on the deck
      const transitionClasses = Array.from(deck.classList).filter(cls => cls.startsWith('transition-'));
      transitionClasses.forEach(cls => deck.classList.remove(cls));

      // Apply new transition class
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
    // Fallback if hash is invalid or missing
    goToSlide(0, false);
  }

  window.addEventListener('hashchange', handleHash);


  // --- SLIDE TRANSITION CONFETTI ---
  function launchTransitionConfetti() {
    // Remove any existing confetti first
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
      const size = Math.random() * 8 + 6; // 6–14px
      const left = Math.random() * 110 - 5; // -5% to 105%
      const duration = Math.random() * 1.5 + 2; // 2–3.5s
      const delay = Math.random() * 0.8; // 0–0.8s stagger
      const drift = (Math.random() - 0.5) * 200; // horizontal drift px

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

    // Auto-remove after all pieces have finished falling
    setTimeout(() => container.remove(), 4500);
  }

  // --- INTERACTIVE QUIZ ENGINE ---
  const quizQuestions = [
    {
      question: "Dans quelle ville Raphaël est-il né le 19 janvier 1993 ?",
      options: ["Lille (59)", "Lyon (69)", "Tourcoing (59)", "Paris (75)"],
      answer: 2 // Tourcoing
    },
    {
      question: "Quelle filière d'études Raphaël a-t-il choisie après sa reprise d'études ?",
      options: ["Informatique", "Faculté de Droit", "Sciences Humaines", "Commerce"],
      answer: 1 // Faculté de Droit
    },
    {
      question: "Pendant combien d'années Raphaël a-t-il été coordinateur d'activités associatives ?",
      options: ["1 an", "2 ans", "3 ans", "4 ans"],
      answer: 3 // 4 ans
    },
    {
      question: "Dans quelle ville a-t-il vécu pendant un an en dehors de sa région d'origine ?",
      options: ["Marseille", "Lyon", "Bordeaux", "Nantes"],
      answer: 1 // Lyon
    },
    {
      question: "Quelle est la principale raison de sa reconversion dans l'informatique ?",
      options: [
        "Par simple hasard",
        "Pour rejoindre le domaine de sa copine qui y travaille aussi",
        "Par désintérêt pour le milieu associatif",
        "Pour coder des applications mobiles"
      ],
      answer: 1 // Pour rejoindre le domaine de sa copine
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

    // Check if quiz is finished
    if (currentQuestionIndex >= quizQuestions.length) {
      showQuizScore();
      return;
    }

    const currentQ = quizQuestions[currentQuestionIndex];

    // Update progress numbers
    quizQuestionNum.textContent = `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    const percent = Math.round((currentQuestionIndex / quizQuestions.length) * 100);
    quizPercent.textContent = `${percent}%`;
    quizProgressBar.style.width = `${percent}%`;

    // Update question text
    quizQuestion.textContent = currentQ.question;

    // Render options
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

    // Lock option buttons and color code them
    optionButtons.forEach((btn, idx) => {
      btn.classList.add('disabled');
      if (idx === currentQ.answer) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('incorrect');
      }
    });

    if (selectedIdx === currentQ.answer) {
      quizScore++;
    }

    // Wait and advance to next question
    setTimeout(() => {
      currentQuestionIndex++;
      renderQuizQuestion();
    }, 1500);
  }

  function showQuizScore() {
    quizQuestionNum.textContent = "Quiz Terminé !";
    quizPercent.textContent = "100%";
    quizProgressBar.style.width = "100%";
    quizQuestion.textContent = "Félicitations d'être venu tester vos connaissances !";

    let message = "";
    if (quizScore === quizQuestions.length) {
      message = "Parfait ! 🏆 Vous connaissez mon histoire sur le bout des doigts !";
    } else if (quizScore >= 3) {
      message = "Très bon score ! 😊 Vous avez bien suivi les grandes étapes de mon parcours.";
    } else {
      message = "Pas mal ! 👍 Relisez les diapositives pour en apprendre plus sur mon parcours.";
    }

    quizOptions.innerHTML = `
      <div class="quiz-score-screen">
        <div class="quiz-score-num">${quizScore} / ${quizQuestions.length}</div>
        <div class="quiz-score-msg">${message}</div>
        <button id="quizRestartBtn" class="quiz-restart-btn">Recommencer le quiz</button>
      </div>
    `;

    if (quizScore >= 3) {
      createConfetti();
    }

    document.getElementById('quizRestartBtn').addEventListener('click', restartQuiz);
  }

  function restartQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;

    // Remove confetti
    const confettiContainer = quizContainer.querySelector('.confetti-container');
    if (confettiContainer) {
      confettiContainer.remove();
    }

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
      
      // randomize animations somewhat
      confetti.style.animationDuration = `${Math.random() * 1.5 + 2}s`;
      
      confettiContainer.appendChild(confetti);
    }

    quizContainer.appendChild(confettiContainer);
  }

  // Initialize presentation
  handleHash();

  // --- PHOTO LIGHTBOX ---
  function initLightbox() {
    const lightbox     = document.getElementById('lightbox');
    const lightboxImg  = document.getElementById('lightboxImg');
    const lightboxCap  = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const backdrop     = document.getElementById('lightboxBackdrop');

    let isOpen = false;

    function openLightbox(src, alt, caption) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightboxCap.textContent = caption || '';
      lightbox.classList.add('lightbox--open');
      isOpen = true;
      // Trap focus on close button
      setTimeout(() => lightboxClose.focus(), 50);
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--open');
      isOpen = false;
      // Clear src after fade-out so there's no flash on next open
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

    // Close on backdrop or × button
    backdrop.addEventListener('click', closeLightbox);
    lightboxClose.addEventListener('click', closeLightbox);

    // Close on Escape — but only when lightbox is open
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        closeLightbox();
      }
    }, true); // capture phase so it runs before the slide keydown handler
  }

  initLightbox();
});
