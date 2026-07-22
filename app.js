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

    // Update URL hash for deep linking
    if (updateHash) {
      window.location.hash = `slide-${currentSlideIndex + 1}`;
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

    switch (e.key) {
      case 'ArrowRight':
      case 'Space':
      case 'PageDown':
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

  // Initialize presentation
  handleHash();
});
