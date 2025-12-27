// --- Product Data (Mock) ---
const products = [
    { id: 1, name: "240 Shots Multi Color", category: "gift-boxes", price: 1200, image: "https://images.unsplash.com/photo-1533230154799-a3740e95c4cf?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 2, name: "Flower Pots (Big)", category: "flower-pots", price: 250, image: "https://images.unsplash.com/photo-1542358892-0b81eb0db004?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 3, name: "10cm Sparklers (Red)", category: "sparklers", price: 45, image: "https://images.unsplash.com/photo-1627807755375-1030e463a5ba?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 4, name: "Ground Chakkar (Deluxe)", category: "ground-chakkars", price: 180, image: "https://images.unsplash.com/photo-1627807755512-42173a1e3540?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 5, name: "Rocket Bomb (Packet)", category: "rockets", price: 300, image: "https://images.unsplash.com/photo-1532057398157-12fa83f08ca6?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 6, name: "Family Gift Box (Mega)", category: "gift-boxes", price: 4500, image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 7, name: "Standard Sparklers", category: "sparklers", price: 30, image: "https://images.unsplash.com/photo-1505377059067-e285a7bac49b?auto=format&fit=crop&q=80&w=200&h=200" },
];

let cart = {}; // Object to store { productId: quantity }

// --- DOM Elements ---
const productListEl = document.getElementById('product-list');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const headerCartTotalEl = document.getElementById('header-cart-total');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const modal = document.getElementById('checkout-modal');
const closeModalSpan = document.querySelector('.close-modal');
const enquiryForm = document.getElementById('enquiry-form');
const modalTotalEl = document.getElementById('modal-total');

// Mobile Menu Elements
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

// --- Initialization ---
function init() {
    loadCart();
    renderProducts('all');
    setupEventListeners();
    updateCartSummary();
}

// --- Persistence ---
function saveCart() {
    localStorage.setItem('vinoCrackersCart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('vinoCrackersCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error("Failed to parse cart", e);
            cart = {};
        }
    }
}

// --- Render Products ---
function renderProducts(category) {
    productListEl.innerHTML = '';

    const filteredProducts = category === 'all'
        ? products
        : products.filter(p => p.category === category);

    filteredProducts.forEach(product => {
        const qty = cart[product.id] || 0;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" class="product-img"></td>
            <td>
                <div style="font-weight:500;">${product.name}</div>
                <div style="font-size:0.85rem; color:#666; text-transform:capitalize;">${product.category.replace('-', ' ')}</div>
            </td>
            <td>₹${product.price}</td>
            <td>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQty(${product.id}, -1)">-</button>
                    <input type="text" class="qty-input" value="${qty}" readonly>
                    <button class="qty-btn" onclick="updateQty(${product.id}, 1)">+</button>
                </div>
            </td>
            <td style="font-weight:bold; color:var(--color-primary);">₹${qty * product.price}</td>
        `;
        productListEl.appendChild(row);
    });
}

// --- Cart Logic ---
window.updateQty = function (id, change) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += change;

    if (cart[id] < 0) cart[id] = 0;

    // Prune 0 qty items to keep object clean
    if (cart[id] === 0) {
        delete cart[id];
    }

    saveCart();

    // Re-render to show updates
    const activeBtn = document.querySelector('.filter-btn.active');
    const currentCategory = activeBtn ? activeBtn.dataset.category : 'all';
    renderProducts(currentCategory);

    updateCartSummary();
}

function updateCartSummary() {
    let totalItems = 0;
    let totalPrice = 0;

    for (const [id, qty] of Object.entries(cart)) {
        if (qty > 0) {
            const product = products.find(p => p.id == id);
            if (product) {
                totalItems += qty;
                totalPrice += (qty * product.price);
            }
        }
    }

    cartCountEl.textContent = totalItems;
    cartTotalEl.textContent = `₹${totalPrice}`;
    headerCartTotalEl.textContent = `₹${totalPrice}`;

    // Update modal total as well
    if (modalTotalEl) {
        modalTotalEl.textContent = `₹${totalPrice}`;
    }
}

// --- Modal Logic ---
function openModal() {
    const total = parseFloat(cartTotalEl.innerText.replace('₹', ''));
    if (total <= 0) {
        alert("Your cart is empty! Add some crackers first.");
        return;
    }
    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
}

// --- Event Listeners ---
function setupEventListeners() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const category = e.target.dataset.category;
            renderProducts(category);
        });
    });

    // Mobile Menu
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('show');
        });
    }

    // Modal Events
    if (closeModalSpan) {
        closeModalSpan.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    // Checkout Button (in Sidebar)
    const checkoutBtn = document.querySelector('.cart-box .btn-block');
    if (checkoutBtn) {
        // Remove inline onclick and use event listener
        checkoutBtn.removeAttribute('onclick');
        checkoutBtn.addEventListener('click', openModal);
    }

    // Form Submission
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            // Prepare Order Object
            const order = {
                customer: { name, phone, message },
                items: cart,
                total: cartTotalEl.textContent
            };

            console.log("Order Submitted:", order);
            alert(`Thank you ${name}! Your enquiry has been sent. We will contact you at ${phone} shortly.`);

            // Clear Cart
            cart = {};
            saveCart();
            updateCartSummary();
            renderProducts(document.querySelector('.filter-btn.active').dataset.category);
            closeModal();
            enquiryForm.reset();
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === "#") return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                mainNav.classList.remove('show');
            }
        });
    });
}

// --- Fireworks Logic ---
function createFirework() {
    const container = document.createElement('div');
    container.classList.add('firework-container');
    document.body.appendChild(container);

    const fw = document.createElement('div');
    fw.classList.add('firework');

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight / 2); // Top half only

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    fw.style.left = `${x}px`;
    fw.style.top = `${y}px`;
    fw.style.backgroundColor = color;
    fw.style.boxShadow = `0 0 10px 2px ${color}`;

    container.appendChild(fw);

    setTimeout(() => {
        container.remove();
    }, 1000);
}

setInterval(createFirework, 2000);

init();
