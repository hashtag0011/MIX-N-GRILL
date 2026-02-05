// ========================================
// MIX-N-GRILL - Customer JavaScript
// ========================================

// Menu Items Data
const menuItems = {
    // Burgers
    'b1': { name: 'Chicken Burger', price: 6.49, image: 'images/burger.jpg' },
    'b2': { name: 'Chicken Burger Meal', price: 6.99, image: 'images/burger.jpg' },
    'b3': { name: 'Tower Burger', price: 6.99, image: 'images/burger.jpg' },
    'b4': { name: 'Tower Burger Meal', price: 7.49, image: 'images/burger.jpg' },
    'b5': { name: 'Ringer Burger', price: 6.99, image: 'images/burger.jpg' },
    'b7': { name: 'BBQ Chicken Burger', price: 6.99, image: 'images/burger.jpg' },
    'b9': { name: 'Veg Burger', price: 6.49, image: 'images/burger.jpg' },
    'b14': { name: 'Cheese Burger', price: 4.49, image: 'images/burger.jpg' },
    
    // Wings
    'w1': { name: '4 Wings Meal', price: 4.49, image: 'images/wings.jpg' },
    'w2': { name: '6 Wings Meal', price: 6.49, image: 'images/wings.jpg' },
    'w3': { name: '8 Wings Meal', price: 7.49, image: 'images/wings.jpg' },
    'bbq1': { name: '6 BBQ Wings Meal', price: 6.99, image: 'images/wings.jpg' },
    'pp3': { name: 'Grill Wings (6)', price: 7.49, image: 'images/wings.jpg' },
    
    // Wraps
    'wr1': { name: 'Chicken Wrap Meal', price: 6.49, image: 'images/wrap.jpg' },
    
    // Chicken
    'c1': { name: '1pc Chicken Meal', price: 4.49, image: 'images/chicken.jpg' },
    'c2': { name: '2pc Chicken Meal', price: 5.99, image: 'images/chicken.jpg' },
    'c3': { name: '3pc Chicken Meal', price: 7.49, image: 'images/chicken.jpg' },
    
    // Variety Boxes
    'v1': { name: 'Variety Box 1', price: 5.99, image: 'images/chicken.jpg' },
    
    // Pizzas
    'pz1': { name: 'Margherita', price: 8.99, image: 'images/pizza.jpg' },
    'pz2': { name: 'Double Pepperoni', price: 9.99, image: 'images/pizza.jpg' },
    'pz6': { name: 'BBQ Meat Feast', price: 11.99, image: 'images/pizza.jpg' },
    'pz7': { name: 'Club Chicken', price: 10.99, image: 'images/pizza.jpg' },
    'pz9': { name: 'American Hot', price: 10.99, image: 'images/pizza.jpg' },
    'pz12': { name: 'Garden Party', price: 9.99, image: 'images/pizza.jpg' },
    
    // Extras
    'e1': { name: 'Regular Fries', price: 1.99, image: 'images/chicken.jpg' },
    'e2': { name: 'Large Fries', price: 2.99, image: 'images/chicken.jpg' },
    'e3': { name: 'Onion Rings (10)', price: 3.49, image: 'images/chicken.jpg' },
    'e4': { name: 'Mozzarella Sticks', price: 3.49, image: 'images/chicken.jpg' },
    'e7': { name: 'Potato Wedges', price: 2.99, image: 'images/chicken.jpg' },
    'e9': { name: 'Coleslaw', price: 1.49, image: 'images/chicken.jpg' },
};

// Cart State
function safeParseArray(storageKey) {
    try {
        const value = JSON.parse(localStorage.getItem(storageKey));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

let cart = safeParseArray('mixngrill_cart');
let orders = safeParseArray('mixngrill_orders');
let selectedOrderType = null;

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initMenuTabs();
    initCart();
    initContactForm();
    updateCartCount();
});

// ========================================
// Navbar
// ========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!navbar || !menuToggle || !mobileMenu) {
        return;
    }
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
        });
    });
}

// ========================================
// Menu Tabs
// ========================================
function initMenuTabs() {
    const tabs = document.querySelectorAll('.menu-tab');
    const contents = document.querySelectorAll('.menu-content');

    if (!tabs.length || !contents.length) {
        return;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// ========================================
// Cart Functions
// ========================================
function initCart() {
    const cartBtn = document.getElementById('cartBtn');

    if (!cartBtn) {
        return;
    }

    cartBtn.addEventListener('click', openCart);
}

function addToCart(itemId) {
    const item = menuItems[itemId];
    if (!item) return;
    
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: itemId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    
    // Show feedback
    showNotification(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    saveCart();
    updateCartCount();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem('mixngrill_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cartCount');
    if (countEl) {
        countEl.textContent = count;
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ========================================
// Cart Drawer
// ========================================
function openCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (!drawer || !overlay) {
        return;
    }

    renderCartItems();
    drawer.classList.add('open');
    overlay.classList.add('open');
}

function closeCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (!drawer || !overlay) {
        return;
    }

    drawer.classList.remove('open');
    overlay.classList.remove('open');
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (!container || !totalEl) {
        return;
    }
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
                <button class="btn btn-primary" onclick="closeCart(); scrollToSection('menu')">Browse Menu</button>
            </div>
        `;
        totalEl.textContent = '£0.00';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">£${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    <button class="btn-remove" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    totalEl.textContent = `£${getCartTotal().toFixed(2)}`;
}

// ========================================
// Checkout Modal
// ========================================
function openCheckout() {
    closeCart();
    
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    const summary = document.getElementById('orderSummary');
    const totalEl = document.getElementById('checkoutTotal');

    if (!modal || !overlay || !summary || !totalEl) {
        return;
    }
    
    // Reset selection
    selectedOrderType = null;
    document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('selected'));
    const addressField = document.getElementById('addressField');
    if (addressField) {
        addressField.style.display = 'none';
    }
    
    // Render summary
    summary.innerHTML = `
        <div class="order-summary-title">Order Summary</div>
        ${cart.map(item => `
            <div class="summary-item">
                <span>${item.quantity}x ${item.name}</span>
                <span>£${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
    `;
    
    totalEl.textContent = `£${getCartTotal().toFixed(2)}`;
    
    modal.classList.add('open');
    overlay.classList.add('open');
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');

    if (!modal || !overlay) {
        return;
    }

    modal.classList.remove('open');
    overlay.classList.remove('open');
}

function selectOrderType(type) {
    selectedOrderType = type;
    
    document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('selected'));
    const selectedOption = document.getElementById(type + 'Option');
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    const addressField = document.getElementById('addressField');
    if (!addressField) {
        return;
    }

    if (type === 'delivery') {
        addressField.style.display = 'block';
    } else {
        addressField.style.display = 'none';
    }
}

function placeOrder() {
    if (!selectedOrderType) {
        showNotification('Please select Collection or Delivery', 'error');
        return;
    }
    
    const phoneInput = document.getElementById('phoneNumber');
    if (!phoneInput) {
        showNotification('Phone number field is unavailable', 'error');
        return;
    }

    const phone = phoneInput.value;
    if (!phone) {
        showNotification('Please enter your phone number', 'error');
        return;
    }
    
    if (selectedOrderType === 'delivery') {
        const addressInput = document.getElementById('deliveryAddress');
        const address = addressInput ? addressInput.value : '';
        if (!address) {
            showNotification('Please enter your delivery address', 'error');
            return;
        }
    }
    
    // Create order
    const order = {
        id: 'ORD-' + Date.now(),
        items: [...cart],
        total: getCartTotal(),
        type: selectedOrderType,
        phone: phone,
        address: selectedOrderType === 'delivery' ? (document.getElementById('deliveryAddress')?.value ?? '') : null,
        notes: document.getElementById('orderNotes')?.value ?? '',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save order
    orders.push(order);
    localStorage.setItem('mixngrill_orders', JSON.stringify(orders));
    
    // Also save to shop orders for admin
    let shopOrders = safeParseArray('mixngrill_shop_orders');
    shopOrders.push(order);
    localStorage.setItem('mixngrill_shop_orders', JSON.stringify(shopOrders));
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Close checkout and show success
    closeCheckout();
    showSuccessModal(order.id);
}

function showSuccessModal(orderId) {
    const modal = document.getElementById('successModal');
    const overlay = document.getElementById('successOverlay');
    
    const orderNumber = document.getElementById('orderNumber');
    if (!modal || !overlay || !orderNumber) {
        return;
    }

    orderNumber.textContent = orderId;
    
    modal.classList.add('open');
    overlay.classList.add('open');
}

function closeSuccess() {
    const modal = document.getElementById('successModal');
    const overlay = document.getElementById('successOverlay');

    if (!modal || !overlay) {
        return;
    }

    modal.classList.remove('open');
    overlay.classList.remove('open');
}

// ========================================
// Order Tracker
// ========================================
function openTracker() {
    const modal = document.getElementById('trackerModal');
    const overlay = document.getElementById('trackerOverlay');
    
    const trackOrderId = document.getElementById('trackOrderId');
    const trackerResult = document.getElementById('trackerResult');
    if (!modal || !overlay || !trackOrderId || !trackerResult) {
        return;
    }

    trackOrderId.value = '';
    trackerResult.innerHTML = '';
    
    modal.classList.add('open');
    overlay.classList.add('open');
}

function closeTracker() {
    const modal = document.getElementById('trackerModal');
    const overlay = document.getElementById('trackerOverlay');

    if (!modal || !overlay) {
        return;
    }

    modal.classList.remove('open');
    overlay.classList.remove('open');
}

function trackOrder() {
    const trackOrderId = document.getElementById('trackOrderId');
    const resultContainer = document.getElementById('trackerResult');
    if (!trackOrderId || !resultContainer) {
        return;
    }

    const orderId = trackOrderId.value.trim();
    
    if (!orderId) {
        resultContainer.innerHTML = '<p style="color: var(--taupe);">Please enter an order ID</p>';
        return;
    }
    
    // Check in both customer orders and shop orders
    const allOrders = [...orders, ...safeParseArray('mixngrill_shop_orders')];
    const order = allOrders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
    
    if (!order) {
        resultContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-search" style="font-size: 32px; color: var(--taupe); margin-bottom: 12px;"></i>
                <p style="color: var(--taupe);">Order not found</p>
            </div>
        `;
        return;
    }
    
    const statusConfig = {
        pending: { icon: 'fa-clock', color: '#F59E0B', label: 'Order Received' },
        confirmed: { icon: 'fa-check-circle', color: '#3B82F6', label: 'Confirmed' },
        preparing: { icon: 'fa-fire', color: '#FF4D2E', label: 'Preparing' },
        ready: { icon: 'fa-box', color: '#A855F7', label: 'Ready' },
        delivered: { icon: 'fa-check-double', color: '#22C55E', label: 'Delivered' }
    };
    
    const status = statusConfig[order.status];
    const timeline = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const currentIndex = timeline.indexOf(order.status);
    
    resultContainer.innerHTML = `
        <div class="tracker-status">
            <div class="status-icon ${order.status}">
                <i class="fas ${status.icon}"></i>
            </div>
            <div>
                <h4 style="font-size: 18px; margin-bottom: 4px;">${status.label}</h4>
                <p style="color: var(--taupe); font-size: 14px;">Order ${order.id}</p>
            </div>
        </div>
        <div class="tracker-timeline">
            ${timeline.map((step, index) => {
                const stepStatus = statusConfig[step];
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;
                return `
                    <div class="timeline-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                        <div class="timeline-dot">
                            <i class="fas ${isCompleted ? 'fa-check' : stepStatus.icon}"></i>
                        </div>
                        <span style="font-size: 14px; ${isActive ? 'font-weight: 600;' : ''}">${stepStatus.label}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: var(--taupe);">Order Type:</span>
                <span>${order.type.charAt(0).toUpperCase() + order.type.slice(1)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: var(--taupe);">Phone:</span>
                <span>${order.phone}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--taupe);">Total:</span>
                <span style="color: var(--coral); font-weight: 700;">£${order.total.toFixed(2)}</span>
            </div>
        </div>
    `;
}

// ========================================
// Contact Form
// ========================================
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) {
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Message sent! We\'ll get back to you soon.');
        form.reset();
    });
}

// ========================================
// Utilities
// ========================================
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: ${type === 'error' ? '#EF4444' : '#22C55E'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 14px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
