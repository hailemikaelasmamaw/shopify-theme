function hideProductModal() {
  const productModal = document.querySelectorAll('product-modal[open]');
  productModal && productModal.forEach((modal) => modal.hide());
}




document.addEventListener('shopify:block:select', function (event) {
  hideProductModal();
  const blockSelectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockSelectedIsSlide) return;

  const parentSlideshowComponent = event.target.closest('slideshow-component');
  parentSlideshowComponent.pause();

  setTimeout(function () {
    parentSlideshowComponent.slider.scrollTo({
      left: event.target.offsetLeft,
    });
  }, 200);
});

document.addEventListener('shopify:block:deselect', function (event) {
  const blockDeselectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockDeselectedIsSlide) return;
  const parentSlideshowComponent = event.target.closest('slideshow-component');
  if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play();
});


document.addEventListener('shopify:section:load', () => {
  hideProductModal();
  const zoomOnHoverScript = document.querySelector('[id^=EnableZoomOnHover]');
  if (!zoomOnHoverScript) return;
  if (zoomOnHoverScript) {
    const newScriptTag = document.createElement('script');
    newScriptTag.src = zoomOnHoverScript.src;
    zoomOnHoverScript.parentNode.replaceChild(newScriptTag, zoomOnHoverScript);
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  document.querySelectorAll(`[data-section="${event.detail.sectionId}"]`).forEach((element) => {
    element.remove();
    document.body.classList.remove('overflow-hidden');
  });
});

document.querySelectorAll('form[action^="/cart/add"]').forEach((form) => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // ✅ Console log for dev
    console.log('Remove from cart clicked!');

    // ✅ Show temporary toast
    const toast = document.createElement('div');
    toast.textContent = '🛒 Product Added!';
    toast.style.position = 'fixed';
    toast.style.bottom = '0px';
    toast.style.right = '0px';
    toast.style.padding = '12px 18px';
    toast.style.background = '#000';
    toast.style.color = '#fff';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.zIndex = '1000';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000); // remove after 3 seconds

    // ✅ Submit the real form
    form.submit();
  });
});


document.querySelectorAll('form[action^="/cart/remove"]').forEach((form) => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // ✅ Console log for dev
    console.log('Add to cart clicked!');

    // ✅ Show temporary toast
    const toast = document.createElement('div');
    toast.textContent = '🚫 Product Removed';
    toast.style.position = 'fixed';
    toast.style.bottom = '0px';
    toast.style.right = '0px';
    toast.style.padding = '12px 18px';
    toast.style.background = '#000';
    toast.style.color = '#fff';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.zIndex = '1000';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000); // remove after 3 seconds

    // ✅ Submit the real form
    form.submit();
  });
});



document.addEventListener('shopify:section:reorder', () => hideProductModal());

document.addEventListener('shopify:section:select', () => hideProductModal());

document.addEventListener('shopify:section:deselect', () => hideProductModal());

document.addEventListener('shopify:inspector:activate', () => hideProductModal());

document.addEventListener('shopify:inspector:deactivate', () => hideProductModal());
