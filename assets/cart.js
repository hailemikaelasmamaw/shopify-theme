document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('form[action="/cart/add"]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);

      try {
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Cart updated successfully');

      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  input = document.querySelector('.cart-quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      let id = this.dataset.id;
      let quantity = this.value;
      updateCart(id, quantity);
      try {   
        fetch('/cart/update.js', {
          method: 'POST',
          body: JSON.stringify({ id: id, quantity: quantity }),
        });
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    });
  });
});
 document.querySelector('.cart-remove-button').addEventListener('click',async e => {
  e.preventDefault();
  let id = this.dataset.id;
  let quantity = 0;
  updateCart(id, quantity);
  try {
    fetch('/cart/update.js', {
      method: 'POST',
      body: JSON.stringify({ id: id, quantity: 0 }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
  }

 });

 // UI Upddate

 async function updateCart() {
  try {
    const response = await fetch('/cart.js');
    const data = await response.json();
    document.querySelector('.cart-count').textContent = data.item_count;
    document.querySelector('.cart-total').textContent = formatPrice(data.total_price);
    document.querySelector('.cart-subtotal').textContent = formatPrice(data.subtotal_price);
    document.querySelector('.cart-total-price').textContent = formatPrice(data.total_price);
    console.log(data);
  } catch (error) {
    console.error('Error updating cart:', error);
  }
 }

 function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price / 100);
 }
 
