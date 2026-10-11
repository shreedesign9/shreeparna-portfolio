/**
 * Homepage interactions.
 *
 * 1. Photo carousel — the ← / → buttons scroll the "Life lately" row one photo at a time.
 * 2. Cheers animation — two hands slide in from the sides and clink as the
 *    contact banner scrolls into view.
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---------------------------------------------------------------------------
   1. Photo carousel
   --------------------------------------------------------------------------- */
function initCarousel(carousel) {
  const track = carousel.querySelector('[data-carousel-track]');
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');

  // Distance of one step = width of one photo + the gap between photos
  function slideWidth() {
    const slide = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slide ? slide.getBoundingClientRect().width + gap : track.clientWidth;
  }

  prevButton.addEventListener('click', () => track.scrollBy({ left: -slideWidth() }));
  nextButton.addEventListener('click', () => track.scrollBy({ left: slideWidth() }));
}


/* ---------------------------------------------------------------------------
   2. Cheers animation
   --------------------------------------------------------------------------- */

// Horizontal offset of each hand (as % of its own width) and tilt of the right hand
const HAND_START_OFFSET = 62;   // fully apart, partly off-screen
const HAND_END_OFFSET = -15.5;  // overlapping in the middle
const RIGHT_HAND_END_TILT = -13; // degrees

// Smooth start and finish (ease-in-out quad), input and output are 0 → 1
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function initCheers(banner) {
  const leftHand = banner.querySelector('[data-cheers-left]');
  const rightHand = banner.querySelector('[data-cheers-right]');

  function render(progress) {
    const eased = easeInOut(progress);
    const offset = HAND_START_OFFSET + (HAND_END_OFFSET - HAND_START_OFFSET) * eased;
    const tilt = RIGHT_HAND_END_TILT * eased;

    leftHand.style.transform = `translateX(${-offset}%)`;
    rightHand.style.transform = `translateX(${offset}%) rotate(${tilt}deg)`;
  }

  // No motion requested: show the hands already clinking
  if (prefersReducedMotion) {
    render(1);
    return;
  }

  // 0 when the banner's top edge enters the bottom of the screen,
  // 1 when it has scrolled roughly halfway up
  function scrollProgress() {
    const rect = banner.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const progress = (viewportHeight - rect.top) / (viewportHeight * 0.55 + rect.height * 0.5);
    return Math.min(1, Math.max(0, progress));
  }

  // Update at most once per frame, however often scroll events fire
  let frameRequested = false;
  function onScroll() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
      frameRequested = false;
      render(scrollProgress());
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  render(scrollProgress());
}


/* ---------------------------------------------------------------------------
   Start-up (script is loaded with `defer`, so the DOM is ready here)
   --------------------------------------------------------------------------- */
document.querySelectorAll('[data-carousel]').forEach(initCarousel);
document.querySelectorAll('[data-cheers]').forEach(initCheers);
