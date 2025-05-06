/**
 * Cart functionality for Shopify store
 * Handles cart updates, quantity changes, and item removal
 */

document.addEventListener('DOMContentLoaded', function () {
  initializeCart();
});

/**
 * Initialize all cart functionality
 */
async function initializeCart() {
  // Fetch and render the latest cart section content first
  await refreshCartSection();

  // Initialize add to cart forms
  initializeAddToCartForms();

  // Initialize quantity inputs
  initializeQuantityInputs();

  // Initialize quantity buttons
  initializeQuantityButtons();

  // Initialize remove buttons
  initializeRemoveButtons();
}

/**
 * Fetch the rendered cart section HTML and update the DOM
 */
async function refreshCartSection() {
  const cartSectionContainer = document.querySelector('.cart-section');
  if (!cartSectionContainer) {
    console.error('Cart section container (.cart-section) not found.');
    return;
  }

  try {
    const response = await fetch('/cart?section_id=cart');
    if (!response.ok) {
      throw new Error('Failed to fetch cart section.');
    }

    const html = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const newCartContent = tempDiv.querySelector('.cart-section');
    if (newCartContent) {
      cartSectionContainer.innerHTML = newCartContent.innerHTML;

      // Reinitialize dynamic elements
      initializeQuantityInputs();
      initializeQuantityButtons();
      initializeRemoveButtons();
    }
  } catch (error) {
    console.error('Error refreshing cart section:', error);
  }
}

/**
 * Initialize add to cart forms
 */
function initializeAddToCartForms() {
  document.querySelectorAll('form[action="/cart/add"]').forEach((form) => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const submitButton = form.querySelector('[type="submit"]');

      if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Adding...';
        submitButton.disabled = true;
      }

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to add product to cart.');
        }

        const data = await response.json();
        console.log('Product added to cart:', data);

        // Refresh the cart section
        await refreshCartSection();

        // Show success message
        showAddToCartSuccess(data);
      } catch (error) {
        console.error('Error adding product to cart:', error);
        showAddToCartError(error);
      } finally {
        if (submitButton) {
          submitButton.textContent = 'Add to Cart';
          submitButton.disabled = false;
        }
      }
    });
  });
}

/**
 * Initialize quantity inputs
 */
function initializeQuantityInputs() {
  document.querySelectorAll('.line-item-quantity-input').forEach((input) => {
    input.addEventListener('change', function () {
      const key = this.dataset.lineItemKey;
      const quantity = parseInt(this.value, 10);

      if (isNaN(quantity)) return;

      updateCartItem(key, quantity);
    });
  });
}

/**
 * Initialize quantity buttons (increase/decrease)
 */
function initializeQuantityButtons() {
  document.querySelectorAll('.line-item-quantity-decrease').forEach((button) => {
    button.addEventListener('click', function () {
      const wrapper = this.closest('.line-item-quantity-wrapper');
      if (!wrapper) return;

      const input = wrapper.querySelector('.line-item-quantity-input');
      if (!input) return;

      const key = input.dataset.lineItemKey;
      const currentValue = parseInt(input.value, 10);

      if (isNaN(currentValue) || currentValue <= 1) return;

      const newValue = currentValue - 1;
      input.value = newValue;
      updateCartItem(key, newValue);
    });
  });

  document.querySelectorAll('.line-item-quantity-increase').forEach((button) => {
    button.addEventListener('click', function () {
      const wrapper = this.closest('.line-item-quantity-wrapper');
      if (!wrapper) return;

      const input = wrapper.querySelector('.line-item-quantity-input');
      if (!input) return;

      const key = input.dataset.lineItemKey;
      const currentValue = parseInt(input.value, 10);

      if (isNaN(currentValue)) return;

      const newValue = currentValue + 1;
      input.value = newValue;
      updateCartItem(key, newValue);
    });
  });
}

/**
 * Initialize remove buttons
 */
function initializeRemoveButtons() {
  document.querySelectorAll('.line-item-remove-button').forEach((button) => {
    button.addEventListener('click', function () {
      const key = this.dataset.lineItemKey;
      updateCartItem(key, 0);
    });
  });
}

/**
 * Update a cart item
 * @param {string} key - The cart item key
 * @param {number} quantity - The new quantity
 */
async function updateCartItem(key, quantity) {
  try {
    const body = JSON.stringify({ id: key, quantity });

    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to update cart item.');
    }

    const data = await response.json();
    console.log('Cart updated:', data);

    // Refresh the cart section
    await refreshCartSection();
  } catch (error) {
    console.error('Error updating cart item:', error);
  }
}

/**
 * Show add to cart success message
 * @param {Object} product - The product data
 */
function showAddToCartSuccess(product) {
  alert(`Product "${product.title}" added to cart!`);
}

/**
 * Show add to cart error message
 * @param {Error} error - The error object
 */
function showAddToCartError(error) {
  alert('Failed to add product to cart. Please try again.');
}
