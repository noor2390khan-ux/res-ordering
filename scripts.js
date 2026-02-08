// Menu Data
const menuData = [
    {
        id: 1,
        name: "Wagyu Gold Burger",
        category: "burger",
        price: 1250,
        description: "Premium Wagyu beef, gold-leaf bun, truffle mayo.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Truffle Cream Linguine",
        category: "pasta",
        price: 950,
        description: "Handmade pasta, black truffle, aged parmesan.",
        image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1994&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Artisan Margherita",
        category: "pizza",
        price: 850,
        description: "Buffalo mozzarella, San Marzano tomatoes, fresh basil.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "The Royal Feast Burger",
        category: "burger",
        price: 1100,
        description: "Double beef patty, caramelized onions, smoked cheddar.",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop"
    },
    {
        id: 5,
        name: "Wild Mushroom Risotto",
        category: "pasta",
        price: 800,
        description: "Porcini mushrooms, arborio rice, white wine butter.",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 6,
        name: "Burrata & Prosciutto Pizza",
        category: "pizza",
        price: 1450,
        description: "Creamy burrata, 24-month cured prosciutto, arugula.",
        image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=1974&auto=format&fit=crop"
    }
];

// State Management
let cart = JSON.parse(localStorage.getItem('flavorFusionCart')) || [];
const DELIVERY_FEE = 150;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderMenu('all');
    updateCartUI();
    initFilters();
});

// Render Menu Items
function renderMenu(filter) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    const filteredItems = filter === 'all' ? menuData : menuData.filter(item => item.category === filter);

    filteredItems.forEach(item => {
        const card = `
            <div class="col-md-6 col-lg-4">
                <div class="glass-card h-100 overflow-hidden d-flex flex-column">
                    <img src="${item.image}" class="card-img-top menu-item-img" alt="${item.name}">
                    <div class="card-body p-4 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title mb-0">${item.name}</h5>
                            <span class="price-tag">RS ${item.price}</span>
                        </div>
                        <p class="card-text text-gray small mb-4">${item.description}</p>
                        <button class="btn btn-gold w-100 mt-auto" onclick="orderNow(${item.id})">Order Now</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Category Filtering
function initFilters() {
    const btns = document.querySelectorAll('.menu-category-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMenu(btn.getAttribute('data-filter'));
        });
    });
}

// Cart Logic
function orderNow(id) {
    addToCart(id);
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
    setTimeout(() => {
        document.getElementById('checkoutBtn').click();
    }, 500);
}

function addToCart(id) {
    const item = menuData.find(p => p.id === id);
    const inCart = cart.find(p => p.id === id);

    if (inCart) {
        inCart.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`${item.name} added to basket!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateQuantity(id, change) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('flavorFusionCart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const itemsContainer = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');

    // Update Badge
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.innerText = totalCount;

    // Update Modal Items
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<div class="text-center py-4 text-gray"><i class="fas fa-shopping-basket mb-3 fs-1 d-block opacity-25"></i>Your basket is empty</div>';
    } else {
        itemsContainer.innerHTML = cart.map(item => `
            <div class="d-flex align-items-center mb-3 p-2 glass-card">
                <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" class="me-3">
                <div class="flex-grow-1">
                    <h6 class="mb-0 text-white">${item.name}</h6>
                    <small class="text-gold">RS ${item.price * item.quantity}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary text-white" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary text-white" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="btn btn-sm text-danger ms-2" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    // Update Totals
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

    subtotalEl.innerText = `RS ${subtotal}`;
    totalEl.innerText = `RS ${total}`;

    // Update Checkout Button Text
    const checkoutSubmitBtn = document.querySelector('#checkoutForm button[type="submit"]');
    if (checkoutSubmitBtn) {
        checkoutSubmitBtn.innerHTML = `Place Order RS ${total} <i class="fas fa-check-circle ms-2"></i>`;
    }
}

// Checkout Flow
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast("Please add items to your basket first!");
        return;
    }
    document.getElementById('cartItemsContainer').classList.add('d-none');
    document.getElementById('cartSummary').classList.add('d-none');
    document.getElementById('checkoutForm').classList.remove('d-none');
    document.getElementById('modalFooterActions').classList.add('d-none');
});

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Simulate Order Submission
    const formData = new FormData(e.target);
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const order = {
        id: orderId,
        customer: formData.get('name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        items: cart,
        total: document.getElementById('cartTotal').innerText,
        status: 'Pending',
        timestamp: new Date().toLocaleString()
    };

    // Store order for Admin Panel
    const orders = JSON.parse(localStorage.getItem('flavorFusionOrders')) || [];
    orders.unshift(order);
    localStorage.setItem('flavorFusionOrders', JSON.stringify(orders));

    // Reset UI
    cart = [];
    saveCart();
    updateCartUI();

    // Show Success Modal
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    cartModal.hide();

    document.getElementById('displayOrderId').innerText = orderId;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    // Reset Form for next time
    e.target.reset();
    document.getElementById('cartItemsContainer').classList.remove('d-none');
    document.getElementById('cartSummary').classList.remove('d-none');
    document.getElementById('checkoutForm').classList.add('d-none');
    document.getElementById('modalFooterActions').classList.remove('d-none');
});

document.getElementById('quickOrderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const orderId = 'QRD-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const request = {
        id: orderId,
        customer: formData.get('name'),
        phone: formData.get('phone'),
        category: formData.get('favorite'),
        message: formData.get('message'),
        status: 'Request',
        timestamp: new Date().toLocaleString(),
        total: 'TBD' // To be determined
    };

    // Store in orders
    const orders = JSON.parse(localStorage.getItem('flavorFusionOrders')) || [];
    orders.unshift(request);
    localStorage.setItem('flavorFusionOrders', JSON.stringify(orders));

    // Hide Modal
    bootstrap.Modal.getInstance(document.getElementById('quickOrderModal')).hide();

    // Show Success
    document.getElementById('displayOrderId').innerText = orderId;
    new bootstrap.Modal(document.getElementById('successModal')).show();

    e.target.reset();
});

// Helper: Toast (Simple alert replacement)
function showToast(msg) {
    // Simple basic visual feedback
    const toast = document.createElement('div');
    toast.className = 'fixed-bottom mb-4 me-4 ms-auto bg-gold text-dark p-3 rounded shadow-lg';
    toast.style.width = 'fit-content';
    toast.style.zIndex = '9999';
    toast.innerHTML = `<i class="fas fa-info-circle me-2"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
