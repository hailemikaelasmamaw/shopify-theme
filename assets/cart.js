/**
 * Cart functionality for Shopify store
 * Handles cart updates, quantity changes, and item removal
 */

document.addEventListener('DOMContentLoaded', function() {
  initializeCart();
});

/**
 * Initialize all cart functionality
 */
function initializeCart() {
  // Initialize add to cart forms
  initializeAddToCartForms();
  
  // Initialize quantity inputs
  initializeQuantityInputs();
  
  // Initialize quantity buttons
  initializeQuantityButtons();
  
  // Initialize remove buttons
  initializeRemoveButtons();
  
  // Update cart on page load
  updateCartUI();
}

/**
 * Initialize add to cart forms
 */
function initializeAddToCartForms() {
  document.querySelectorAll('form[action="/cart/add"]').forEach(form => {
    form.addEventListener('submit', async function(e) {
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
          headers: { 'Accept': 'application/json' },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Item added to cart:', data);
        
        // Update cart UI
        updateCartUI();
        
        // Show success message or open cart drawer if available
        showAddToCartSuccess(data);
      } catch (error) {
        console.error('Error adding to cart:', error);
        showAddToCartError(error);
      } finally {
        if (submitButton) {
          submitButton.textContent = originalText;
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
  document.querySelectorAll('.line-item-quantity-input').forEach(input => {
    input.addEventListener('change', function() {
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
  // Decrease quantity buttons
  document.querySelectorAll('.line-item-quantity-decrease').forEach(button => {
    button.addEventListener('click', function() {
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
  
  // Increase quantity buttons
  document.querySelectorAll('.line-item-quantity-increase').forEach(button => {
    button.addEventListener('click', function() {
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
  document.querySelectorAll('.line-item-remove-button').forEach(button => {
    button.addEventListener('click', function() {
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
    const body = JSON.stringify({
      id: key,
      quantity: quantity
    });
    
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Cart updated:', data);
    
    // Update the UI
    updateCartUI(data);
    
    // If quantity is 0, remove the item from the DOM
    if (quantity === 0) {
      removeCartItemFromDOM(key);
    }
  } catch (error) {
    console.error('Error updating cart:', error);
  }
}

/**
 * Remove a cart item from the DOM
 * @param {string} key - The cart item key
 */
function removeCartItemFromDOM(key) {
  const itemContainer = document.querySelector(`.line-item-quantity-input[data-line-item-key="${key}"]`)
    ?.closest('.cart-item, .cart-item-container');
  
  if (itemContainer) {
    itemContainer.style.opacity = '0';
    setTimeout(() => {
      itemContainer.remove();
      
      // Check if cart is empty
      const cartItems = document.querySelectorAll('.cart-item, .cart-item-container');
      if (cartItems.length === 0) {
        showEmptyCartMessage();
      }
    }, 300);
  }
}

/**
 * Show empty cart message
 */
function showEmptyCartMessage() {
  const cartContainer = document.querySelector('.cart-container, .cart-section');
  if (!cartContainer) return;
  
  // Clear the cart container
  cartContainer.innerHTML = `
    <div class="cart-empty-container">
      <div class="cart-empty-message">
        <h2 class="cart-empty-heading">Your cart is empty</h2>
        <p class="cart-empty-text">You haven't added any items to your cart yet.</p>
        <div class="cart-empty-button-container">
          <a href="/collections/all" class="cart-empty-button">Start Shopping</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update the cart UI
 * @param {Object} cartData - Optional cart data from fetch response
 */
async function updateCartUI(cartData = null) {
  try {
    // If cart data wasn't provided, fetch it
    if (!cartData) {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      cartData = await response.json();
    }
    
    // Update cart count
    updateCartCount(cartData.item_count);
    
    // Update cart totals
    updateCartTotals(cartData);
    
    // Update line item prices if they exist
    updateLineItemPrices(cartData.items);
    
    console.log('Cart UI updated with:', cartData);
  } catch (error) {
    console.error('Error updating cart UI:', error);
  }
}

/**
 * Update cart count in the header
 * @param {number} count - The cart item count
 */
function updateCartCount(count) {
  document.querySelectorAll('.cart-count').forEach(element => {
    element.textContent = count;
  });
}

/**
 * Update cart totals
 * @param {Object} cartData - The cart data
 */
function updateCartTotals(cartData) {
  // Update subtotal
  document.querySelectorAll('.cart-subtotal-price, .cart-subtotal-amount').forEach(element => {
    element.textContent = formatPrice(cartData.total_price);
  });
  
  // Update total price
  document.querySelectorAll('.cart-total-price, .cart-total-price-value').forEach(element => {
    element.textContent = formatPrice(cartData.total_price);
  });
}

/**
 * Update line item prices
 * @param {Array} items - The cart items
 */
function updateLineItemPrices(items) {
  if (!items || !items.length) return;
  
  items.forEach(item => {
    const lineItem = document.querySelector(`.line-item-quantity-input[data-line-item-key="${item.key}"]`)
      ?.closest('.line-item');
    
    if (!lineItem) return;
    
    // Update line price
    const totalPriceElement = lineItem.querySelector('.line-item-total-price');
    if (totalPriceElement) {
      totalPriceElement.textContent = formatPrice(item.final_line_price);
    }
  });
}

/**
 * Show add to cart success message
 * @param {Object} product - The product data
 */
function showAddToCartSuccess(product) {
  // Implementation depends on the design
  // Could show a toast, modal, or update a cart drawer
  console.log('Product added successfully:', product);
}

/**
 * Show add to cart error message
 * @param {Error} error - The error object
 */
function showAddToCartError(error) {
  // Implementation depends on the design
  console.error('Error adding product to cart:', error);
}

/**
 * Format price for display
 * @param {number} price - The price in cents
 * @returns {string} - The formatted price
 */
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price / 100);
}
