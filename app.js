/**
 * PRIME ENERGY HYDRATION - MAIN APPLICATION CONTROLLER
 * Handles interactive UI components, e-commerce cart engine,
 * interactive widgets, gallery lightbox, and notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Background Lightning Canvas
  if (window.LightningAtmosphere) {
    new window.LightningAtmosphere('lightning-canvas');
  }

  // Initialize Hero Bottle Auto-Animation Engine
  if (window.HeroBottleAnimation) {
    new window.HeroBottleAnimation({
      canvasId: 'hero-canvas',
      heroId: 'home'
    });
  }

  // Initialize Application Modules
  initNavigation();
  initShopAndCart();
  initEnergySimulator();
  initGalleryLightbox();
  initHydrationCalculator();
  initFAQAccordion();
  initFormsAndDrops();
});

/* ==========================================================================
   Navigation Module
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Sticky Navbar Glass Transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNav();
  }, { passive: true });

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      if (window.soundFX) window.soundFX.playClick();
    });

    // Close mobile drawer on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active Link Spy
  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   Shop & Shopping Cart Module
   ========================================================================== */
function initShopAndCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const openCartBtns = document.querySelectorAll('.open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartBadge = document.getElementById('cart-count-badge');
  const cartItemsContainer = document.getElementById('cart-items-body');
  const emptyState = document.getElementById('cart-empty-state');
  
  // Cart Price Readouts
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('cart-discount-row');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');
  const freeShipFill = document.getElementById('free-ship-fill');
  const freeShipText = document.getElementById('free-ship-text');

  // Checkout modal
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Pack selector in shop section
  const packCards = document.querySelectorAll('.pack-card');
  const shopCurrentPrice = document.getElementById('shop-current-price');
  const shopQtyVal = document.getElementById('shop-qty-val');
  const qtyMinusBtn = document.getElementById('qty-minus');
  const qtyPlusBtn = document.getElementById('qty-plus');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const buyNowBtn = document.getElementById('buy-now-btn');

  // Promo code
  const promoInput = document.getElementById('promo-input');
  const applyPromoBtn = document.getElementById('apply-promo-btn');

  let currentPack = {
    name: '12-Pack Case',
    price: 29.99,
    originalPrice: 34.99,
    img: 'ezgif-frame-300.jpg'
  };

  let cart = [
    {
      id: 'prime-violet-12',
      title: 'PRIME Violet Surge',
      pack: '12-Pack Case',
      price: 29.99,
      qty: 1,
      img: 'ezgif-frame-300.jpg'
    }
  ];

  let appliedDiscount = 0;
  let promoCode = '';

  // Pack Selection Logic
  packCards.forEach(card => {
    card.addEventListener('click', () => {
      packCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const packType = card.dataset.pack;
      const price = parseFloat(card.dataset.price);

      currentPack = {
        name: packType,
        price: price,
        img: 'ezgif-frame-300.jpg'
      };

      if (shopCurrentPrice) {
        shopCurrentPrice.textContent = `$${price.toFixed(2)}`;
      }
      if (window.soundFX) window.soundFX.playClick();
    });
  });

  // Quantity Stepper
  let currentQty = 1;
  if (qtyMinusBtn && qtyPlusBtn && shopQtyVal) {
    qtyMinusBtn.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        shopQtyVal.textContent = currentQty;
        if (window.soundFX) window.soundFX.playClick();
      }
    });
    qtyPlusBtn.addEventListener('click', () => {
      if (currentQty < 24) {
        currentQty++;
        shopQtyVal.textContent = currentQty;
        if (window.soundFX) window.soundFX.playClick();
      }
    });
  }

  // Add To Cart
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addToCart(currentPack.name, currentPack.price, currentQty, currentPack.img);
      openCart();
      if (window.soundFX) window.soundFX.playCartAdd();
      showToast(`Added ${currentQty}x ${currentPack.name} to Cart!`);
    });
  }

  // Buy Now
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      addToCart(currentPack.name, currentPack.price, currentQty, currentPack.img);
      openCart();
      if (window.soundFX) window.soundFX.playCartAdd();
    });
  }

  function addToCart(packName, price, qty, img) {
    const existingIndex = cart.findIndex(item => item.pack === packName);
    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        id: `prime-violet-${Date.now()}`,
        title: 'PRIME Violet Surge',
        pack: packName,
        price: price,
        qty: qty,
        img: img
      });
    }
    renderCart();
  }

  function renderCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.transform = 'scale(1.3)';
      setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
    }

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      if (totalEl) totalEl.textContent = '$0.00';
      if (freeShipFill) freeShipFill.style.width = '0%';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map((item, index) => {
      const itemSubtotal = item.price * item.qty;
      subtotal += itemSubtotal;
      return `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.img}" alt="${item.title}">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.title}</h4>
            <span class="cart-item-pack">${item.pack}</span>
            <span class="cart-item-price">$${item.price.toFixed(2)} &times; ${item.qty} = $${itemSubtotal.toFixed(2)}</span>
          </div>
          <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">
            &times;
          </button>
        </div>
      `;
    }).join('');

    // Attach remove listeners
    cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        cart.splice(idx, 1);
        renderCart();
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    // Calculate discounts & totals
    const discountAmount = subtotal * appliedDiscount;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    if (discountRow) {
      discountRow.style.display = appliedDiscount > 0 ? 'flex' : 'none';
    }
    if (totalEl) totalEl.textContent = `$${finalTotal.toFixed(2)}`;

    // Free Shipping threshold ($50)
    const shipThreshold = 50.0;
    if (subtotal >= shipThreshold) {
      if (freeShipFill) freeShipFill.style.width = '100%';
      if (freeShipText) freeShipText.innerHTML = '⚡ You unlocked <strong>FREE Express Shipping</strong>!';
    } else {
      const remaining = (shipThreshold - subtotal).toFixed(2);
      const percentage = (subtotal / shipThreshold) * 100;
      if (freeShipFill) freeShipFill.style.width = `${percentage}%`;
      if (freeShipText) freeShipText.innerHTML = `Add <strong>$${remaining}</strong> more for FREE Express Shipping!`;
    }
  }

  // Promo Code Handler
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'VIOLET20') {
        appliedDiscount = 0.20;
        promoCode = code;
        renderCart();
        showToast('Promo code VIOLET20 applied (20% OFF)!');
      } else if (code === 'ENERGY') {
        appliedDiscount = 0.15;
        promoCode = code;
        renderCart();
        showToast('Promo code ENERGY applied (15% OFF)!');
      } else if (code === '') {
        showToast('Please enter a promo code (Try VIOLET20)');
      } else {
        showToast('Invalid promo code. Try VIOLET20');
      }
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  // Cart Drawer open/close
  function openCart() {
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.add('open');
      cartBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.remove('open');
      cartBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  openCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openCart();
      if (window.soundFX) window.soundFX.playClick();
    });
  });

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      closeCart();
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', closeCart);
  }

  // Checkout Modal Trigger
  if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your cart is empty! Add items first.');
        return;
      }
      closeCart();
      checkoutModal.classList.add('open');
      triggerConfetti();
      if (window.soundFX) window.soundFX.playSurge();
    });
  }

  if (closeCheckoutBtn && checkoutModal) {
    closeCheckoutBtn.addEventListener('click', () => {
      checkoutModal.classList.remove('open');
      cart = [];
      appliedDiscount = 0;
      renderCart();
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  renderCart();
}

/* ==========================================================================
   Energy Experience Intensity Simulator
   ========================================================================== */
function initEnergySimulator() {
  const rangeInput = document.getElementById('energy-range-input');
  const levelBadge = document.getElementById('sim-level-badge');
  const outputText = document.getElementById('sim-output-text');
  const statElectro = document.getElementById('stat-electro');

  if (!rangeInput) return;

  const levels = [
    {
      badge: 'LEVEL 1: BASE FOCUS',
      text: 'Baseline cognitive clarity and clean cellular hydration. Ideal for long study sessions, light cardio, and all-day hydration.',
      electro: '250mg'
    },
    {
      badge: 'LEVEL 2: PEAK HYDRATION',
      text: 'Active electrolyte recharge with coconut water bio-matrix. Powers gym workouts, HIIT intervals, and team sport endurance.',
      electro: '500mg'
    },
    {
      badge: 'LEVEL 3: OVERDRIVE SURGE',
      text: 'Maximum electrical surge! BCAA muscle protection and lightning-fast absorption for competitive athletics and high-stakes performance.',
      electro: '750mg'
    }
  ];

  rangeInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const data = levels[val - 1];

    if (levelBadge) levelBadge.textContent = data.badge;
    if (outputText) outputText.textContent = data.text;
    if (statElectro) statElectro.textContent = data.electro;

    if (window.soundFX) window.soundFX.playSurge();
  });
}

/* ==========================================================================
   Product Gallery & Lightbox Viewer
   ========================================================================== */
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');

  let currentImages = [];
  let currentIndex = 0;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      if (window.soundFX) window.soundFX.playClick();
    });
  });

  function updateGalleryList() {
    currentImages = Array.from(galleryItems)
      .filter(item => item.style.display !== 'none')
      .map(item => ({
        src: item.querySelector('img').getAttribute('src'),
        caption: item.querySelector('.gallery-title')?.textContent || 'PRIME Violet Surge'
      }));
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      updateGalleryList();
      const clickedSrc = item.querySelector('img').getAttribute('src');
      currentIndex = currentImages.findIndex(img => img.src === clickedSrc);
      if (currentIndex === -1) currentIndex = 0;

      openLightbox(currentIndex);
      if (window.soundFX) window.soundFX.playClick();
    });
  });

  function openLightbox(index) {
    if (!lightbox || currentImages.length === 0) return;
    const imgData = currentImages[index];
    if (lightboxImg) lightboxImg.src = imgData.src;
    if (lightboxCaption) lightboxCaption.textContent = imgData.caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      openLightbox(currentIndex);
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % currentImages.length;
      openLightbox(currentIndex);
      if (window.soundFX) window.soundFX.playClick();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
    if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
  });
}

/* ==========================================================================
   Hydration Calculator Widget
   ========================================================================== */
function initHydrationCalculator() {
  const sportSelect = document.getElementById('calc-sport');
  const durationInput = document.getElementById('calc-duration');
  const intensitySelect = document.getElementById('calc-intensity');
  const resultNum = document.getElementById('calc-result-num');
  const resultAdvice = document.getElementById('calc-advice');

  function calculateHydration() {
    if (!sportSelect || !durationInput || !intensitySelect || !resultNum) return;

    const duration = parseFloat(durationInput.value) || 60;
    const sportMultiplier = parseFloat(sportSelect.value) || 1.0;
    const intensityMultiplier = parseFloat(intensitySelect.value) || 1.0;

    const bottles = (duration / 45) * sportMultiplier * intensityMultiplier;
    const roundedBottles = Math.max(1, Math.round(bottles * 10) / 10);
    const electrolytes = Math.round(roundedBottles * 250);

    resultNum.textContent = roundedBottles;
    if (resultAdvice) {
      resultAdvice.innerHTML = `Recommended: <strong>${roundedBottles} bottles</strong> (~${electrolytes}mg bioavailable electrolytes) to maintain peak neuromuscular response.`;
    }
  }

  if (sportSelect) sportSelect.addEventListener('change', calculateHydration);
  if (durationInput) durationInput.addEventListener('input', calculateHydration);
  if (intensitySelect) intensitySelect.addEventListener('change', calculateHydration);
}

/* ==========================================================================
   FAQ Accordion Module
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        faqItems.forEach(other => other.classList.remove('active'));

        if (!isActive) {
          item.classList.add('active');
        }
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  });
}

/* ==========================================================================
   Forms & Drop Signups Module
   ========================================================================== */
function initFormsAndDrops() {
  const vipForm = document.getElementById('vip-form');
  const contactForm = document.getElementById('contact-form');

  if (vipForm) {
    vipForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('vip-email').value;
      if (email) {
        showToast('⚡ Access Granted! You are on the VIP Drop list.');
        vipForm.reset();
        if (window.soundFX) window.soundFX.playSurge();
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Transmission Received. Our squad will reply within 24 hours.');
      contactForm.reset();
      if (window.soundFX) window.soundFX.playClick();
    });
  }
}

/* ==========================================================================
   Global Toast Notification System
   ========================================================================== */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ==========================================================================
   Confetti Burst Celebration Engine
   ========================================================================== */
function triggerConfetti() {
  const colors = ['#a855f7', '#c084fc', '#e879f9', '#38bdf8', '#ffffff'];
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = `${Math.random() * 8 + 6}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confetti.style.top = '50%';
    confetti.style.left = '50%';
    confetti.style.zIndex = '4000';
    confetti.style.pointerEvents = 'none';
    confetti.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(confetti);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 350 + 150;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity - 100;

    confetti.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) rotate(${Math.random() * 720}deg) scale(0)`, opacity: 0 }
    ], {
      duration: Math.random() * 800 + 800,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }).onfinish = () => confetti.remove();
  }
}
