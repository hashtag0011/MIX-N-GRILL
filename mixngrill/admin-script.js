// ========================================
// MIX-N-GRILL - Admin/Shop Display JavaScript
// ========================================

function safeParseArray(storageKey) {
    try {
        const value = JSON.parse(localStorage.getItem(storageKey));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

let orders = [];
let currentFilter = 'all';
let soundEnabled = true;
let lastOrderCount = 0;

// Status configuration
const statusConfig = {
    pending: { icon: 'fa-clock', color: '#F59E0B', label: 'Pending', next: 'confirmed', nextLabel: 'Confirm' },
    confirmed: { icon: 'fa-check-circle', color: '#3B82F6', label: 'Confirmed', next: 'preparing', nextLabel: 'Start Preparing' },
    preparing: { icon: 'fa-fire', color: '#FF4D2E', label: 'Preparing', next: 'ready', nextLabel: 'Mark Ready' },
    ready: { icon: 'fa-box', color: '#A855F7', label: 'Ready', next: 'delivered', nextLabel: 'Mark Delivered' },
    delivered: { icon: 'fa-check-double', color: '#22C55E', label: 'Delivered', next: null, nextLabel: null }
};

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    updateStats();
    renderOrders();
    
    // Auto-refresh every 3 seconds
    setInterval(() => {
        loadOrders();
        checkNewOrders();
        updateStats();
        if (currentFilter === 'all') {
            renderOrders();
        }
    }, 3000);
});

// ========================================
// Load Orders
// ========================================
function loadOrders() {
    orders = safeParseArray('mixngrill_shop_orders');
    // Sort by date, newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ========================================
// Check for New Orders
// ========================================
function checkNewOrders() {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    
    if (pendingCount > lastOrderCount && lastOrderCount > 0 && soundEnabled) {
        showNewOrderAlert();
        playNotificationSound();
    }
    
    lastOrderCount = pendingCount;
}

// ========================================
// Update Statistics
// ========================================
function updateStats() {
    const counts = {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };

    const statMap = [
        ['pendingCount', counts.pending],
        ['preparingCount', counts.preparing],
        ['readyCount', counts.ready],
        ['allCount', orders.length],
        ['tabPendingCount', counts.pending],
        ['confirmedCount', counts.confirmed],
        ['tabPreparingCount', counts.preparing],
        ['tabReadyCount', counts.ready],
        ['deliveredCount', counts.delivered]
    ];

    statMap.forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// ========================================
// Filter Orders
// ========================================
function filterOrders(filter) {
    currentFilter = filter;
    
    // Update tab styles
    const tabs = document.querySelectorAll('.filter-tab');
    if (tabs.length) {
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            }
        });
    }
    
    renderOrders();
}

// ========================================
// Render Orders
// ========================================
function renderOrders() {
    const container = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyState');

    if (!container || !emptyState) {
        return;
    }
    
    let filteredOrders = orders;
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(o => o.status === currentFilter);
    }
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredOrders.map(order => {
        const config = statusConfig[order.status];
        const nextAction = config.next ? `
            <button class="btn-action ${config.next}" onclick="updateOrderStatus('${order.id}', '${config.next}'); event.stopPropagation();">
                ${config.nextLabel}
            </button>
        ` : '';
        
        const cancelAction = order.status !== 'delivered' && order.status !== 'cancelled' ? `
            <button class="btn-action cancel" onclick="updateOrderStatus('${order.id}', 'cancelled'); event.stopPropagation();">
                <i class="fas fa-times"></i>
            </button>
        ` : '';
        
        return `
            <div class="order-card ${order.status}" onclick="openOrderModal('${order.id}')">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status ${order.status}">
                        <i class="fas ${config.icon}"></i>
                        ${config.label}
                    </span>
                </div>
                <div class="order-meta">
                    <span><i class="fas fa-clock"></i> ${formatTime(order.createdAt)}</span>
                    <span><i class="fas fa-${order.type === 'delivery' ? 'truck' : 'store'}"></i> ${order.type}</span>
                </div>
                <div class="order-items">
                    ${order.items.slice(0, 3).map(item => `
                        <div class="order-item">
                            <span>${item.quantity}x ${item.name}</span>
                        </div>
                    `).join('')}
                    ${order.items.length > 3 ? `<div class="order-item" style="color: var(--taupe);">+${order.items.length - 3} more items</div>` : ''}
                </div>
                <div class="order-total">
                    <span>Total</span>
                    <span>£${order.total.toFixed(2)}</span>
                </div>
                <div class="order-actions">
                    ${nextAction}
                    ${cancelAction}
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// Update Order Status
// ========================================
function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    order.status = newStatus;
    
    // Save to shop orders
    localStorage.setItem('mixngrill_shop_orders', JSON.stringify(orders));
    
    // Also update in customer orders
    let customerOrders = safeParseArray('mixngrill_orders');
    const customerOrder = customerOrders.find(o => o.id === orderId);
    if (customerOrder) {
        customerOrder.status = newStatus;
        localStorage.setItem('mixngrill_orders', JSON.stringify(customerOrders));
    }
    
    updateStats();
    renderOrders();
    
    // If modal is open, update it
    const modal = document.getElementById('orderModal');
    if (modal && modal.classList.contains('open')) {
        openOrderModal(orderId);
    }
}

// ========================================
// Order Modal
// ========================================
function openOrderModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    const overlay = document.getElementById('orderOverlay');

    const modalOrderId = document.getElementById('modalOrderId');
    const modalOrderType = document.getElementById('modalOrderType');
    const modalPhone = document.getElementById('modalPhone');
    const modalTime = document.getElementById('modalTime');
    if (!modal || !overlay || !modalOrderId || !modalOrderType || !modalPhone || !modalTime) {
        return;
    }

    modalOrderId.textContent = order.id;
    modalOrderType.textContent = order.type.charAt(0).toUpperCase() + order.type.slice(1);
    modalPhone.textContent = order.phone;
    modalTime.textContent = formatTime(order.createdAt);
    
    // Address
    const addressRow = document.getElementById('modalAddressRow');
    if (order.address) {
        if (addressRow) {
            addressRow.style.display = 'flex';
        }
        const modalAddress = document.getElementById('modalAddress');
        if (modalAddress) {
            modalAddress.textContent = order.address;
        }
    } else if (addressRow) {
        addressRow.style.display = 'none';
    }
    
    // Notes
    const notesRow = document.getElementById('modalNotesRow');
    if (order.notes) {
        if (notesRow) {
            notesRow.style.display = 'flex';
        }
        const modalNotes = document.getElementById('modalNotes');
        if (modalNotes) {
            modalNotes.textContent = order.notes;
        }
    } else if (notesRow) {
        notesRow.style.display = 'none';
    }
    
    // Items
    const modalItems = document.getElementById('modalItems');
    if (modalItems) {
        modalItems.innerHTML = order.items.map(item => `
            <div class="order-item">
                <span>${item.quantity}x ${item.name}</span>
                <span>£${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }
    
    // Total
    const modalTotal = document.getElementById('modalTotal');
    if (modalTotal) {
        modalTotal.textContent = `£${order.total.toFixed(2)}`;
    }
    
    // Actions
    const config = statusConfig[order.status];
    const actionsContainer = document.getElementById('modalActions');

    if (actionsContainer) {
        if (config.next) {
            actionsContainer.innerHTML = `
                <button class="btn-action ${config.next}" onclick="updateOrderStatus('${order.id}', '${config.next}'); closeOrderModal();">
                    ${config.nextLabel}
                </button>
                <button class="btn-action cancel" onclick="updateOrderStatus('${order.id}', 'cancelled'); closeOrderModal();">
                    Cancel Order
                </button>
            `;
        } else if (order.status === 'cancelled') {
            actionsContainer.innerHTML = `
                <span style="color: var(--taupe);">Order Cancelled</span>
            `;
        } else {
            actionsContainer.innerHTML = `
                <span style="color: var(--success);">Order Completed</span>
            `;
        }
    }
    
    modal.classList.add('open');
    overlay.classList.add('open');
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    const overlay = document.getElementById('orderOverlay');

    if (!modal || !overlay) {
        return;
    }

    modal.classList.remove('open');
    overlay.classList.remove('open');
}

// ========================================
// New Order Alert
// ========================================
function showNewOrderAlert() {
    const alert = document.getElementById('newOrderAlert');
    const latestOrder = orders.find(o => o.status === 'pending');

    if (!alert) {
        return;
    }

    if (latestOrder) {
        const alertOrderId = document.getElementById('alertOrderId');
        if (alertOrderId) {
            alertOrderId.textContent = latestOrder.id;
        }
    }
    
    alert.classList.add('show');
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

// ========================================
// Sound Toggle
// ========================================
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundBtn');

    if (!btn) {
        return;
    }

    if (soundEnabled) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

// ========================================
// Play Notification Sound
// ========================================
function playNotificationSound() {
    if (!soundEnabled) return;
    
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play second beep
    setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
}

// ========================================
// Refresh Orders
// ========================================
function refreshOrders() {
    const btn = document.querySelector('.btn-refresh i');

    if (!btn) {
        loadOrders();
        updateStats();
        renderOrders();
        return;
    }

    btn.style.animation = 'spin 1s linear';
    
    loadOrders();
    updateStats();
    renderOrders();
    
    setTimeout(() => {
        btn.style.animation = '';
    }, 1000);
}

// ========================================
// Utilities
// ========================================
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
