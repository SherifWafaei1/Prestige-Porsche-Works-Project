    // Global variables
    const modelImages = {
        "911": "Porsche911.png",
        "taycan": "PorscheTaycan.png",
        "cayenne": "PorscheCayenne.png",
        "macan": "PorscheMacan.png",
        "panamera": "NewPanamera.jpg",
        "boxster": "Porsche718Boxster.png",
        "carrera_gt": "CarreraGt.png",
        "918_spyder": "newPorsche918Spyder.png",
        "taycan_turbo_s": "PorscheTaycanTurboS.png",
        "911_gt3": "Porsche911GT3.png",
        "gt2_rs": "PorscheGT2RS.png",
        "911_turbo_s": "Porsche911TurboS.png",
        "taycan_cross": "PorscheTaycanCrossTurismo.png",
        "spyder_rs": "Porsche718SpyderRS.png",
        "classic_356": "HomeImg.jpg"
    };

    const modelPrices = {
        "911": 100000,
        "taycan": 85000,
        "cayenne": 75000,
        "macan": 65000,
        "panamera": 90000,
        "boxster": 70000,
        "carrera_gt": 440000,
        "918_spyder": 845000,
        "taycan_turbo_s": 185000,
        "911_gt3": 175000,
        "gt2_rs": 250000,
        "911_turbo_s": 200000,
        "taycan_cross": 95000,
        "spyder_rs": 160000,
        "classic_356": 150000
    };

    const colorMap = {
        "black": "#000000",
        "white": "#ffffff",
        "red": "#d5001c",
        "blue": "#0066cc",
        "silver": "#c0c0c0",
        "yellow": "#ffcc00",
        "green": "#006633",
        "orange": "#ff6600",
        "purple": "#660099",
        "gold": "#d4af37",
        "bronze": "#cd7f32",
        "carbon": "#1a1a1a",
        "midnight": "#191970",
        "champagne": "#f7e7ce",
        "navy": "#000080"
    };

    // Authentication Functions
    let currentUser = null;
    let verificationCode = '';
    let userEmail = '';

    // Model data for cards
    let models = []; // Initialize as empty, data will be fetched
    let currentPage = 1;
    let modelsPerPage = 6; // Changed to 6 models per page
    let totalPages = 1;

    // Function to fetch models from the backend
    async function fetchModels(page = currentPage, limit = modelsPerPage) {
        try {
            const response = await fetch(`http://localhost:3001/api/models?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Raw data from backend:', data); // Diagnostic log
            // Ensure modelsToMap is an array before attempting to map
            let modelsToMap = [];
            if (Array.isArray(data)) {
                modelsToMap = data;
            } else if (data && typeof data === 'object' && Array.isArray(data.models)) {
                modelsToMap = data.models;
            } else {
                console.warn('Unexpected data format from backend for models, defaulting to empty array:', data);
                modelsToMap = [];
            }
            
            // Map backend model data to frontend format, ensuring prices are strings
            models = modelsToMap.map(model => ({
                id: model._id,
                name: model.name,
                price: `$${model.price.toLocaleString()}`,
                image: model.imageUrl,
                specs: {
                    "0-60 mph": model.specifications ? model.specifications["0-60mph"] : 'N/A',
                    "Max power": model.specifications ? `${model.specifications.horsepower} hp` : 'N/A',
                    "Top speed": model.specifications ? `${model.specifications.topSpeed}` : 'N/A'
                },
                stock: model.stock // Include stock from backend
            }));
            currentPage = (data && data.currentPage) || 1;
            totalPages = (data && data.totalPages) || 1;
            console.log('Fetched models:', models);
            renderModelCards(); // Render cards after fetching
            renderPaginationControls(); // Render pagination controls
            window.models = models;
        } catch (error) {
            console.error('Error fetching models:', error);
            // Optionally, load from localStorage or display an error message if fetch fails
            models = JSON.parse(localStorage.getItem('porscheModels')) || [];
            renderModelCards(); // Still try to render if data exists in localStorage
            renderPaginationControls(); // Still try to render if data exists in localStorage
        }
    }

    // Call fetchModels on page load
    document.addEventListener('DOMContentLoaded', fetchModels);

    // Get the modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.querySelector('.auth-button.login-btn');
    const registerBtn = document.querySelector('.auth-button.register-btn');
    const closeSpan = document.querySelectorAll('.close-modal');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const userLoginBtn = document.getElementById('userLoginBtn');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const userLoginForm = document.getElementById('userLoginForm');
    const loginOptions = document.querySelector('.login-options');
    const cartModal = document.getElementById('cartModal'); // Keep cartModal declaration here for global access

    // Ensure modals are hidden by default on script load
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
    if (cartModal) cartModal.style.display = 'none'; // Ensure cart modal is hidden on initial load

    // When the user clicks the login button, open the modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
            loginOptions.style.display = 'flex';
            adminLoginForm.style.display = 'none';
            userLoginForm.style.display = 'none';
        });
    }

    // When the user clicks the register button, open the modal
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            registerModal.style.display = 'flex';
        });
    }

    // When the user clicks on <span> (x), close the modals
    closeSpan.forEach(span => {
        span.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            if (registerModal) registerModal.style.display = 'none';
            if (adminLoginForm) adminLoginForm.style.display = 'none';
            if (userLoginForm) userLoginForm.style.display = 'none';
            if (loginOptions) loginOptions.style.display = 'flex';
            if (cartModal) cartModal.style.display = 'none'; // Ensure cart modal is closed when other modals close
        });
    });

    // When the user clicks anywhere outside of the modals, close them
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
            if (adminLoginForm) adminLoginForm.style.display = 'none';
            if (userLoginForm) userLoginForm.style.display = 'none';
            if (loginOptions) loginOptions.style.display = 'flex';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
        // Only close cartModal if the click is outside its content and not on the cart button
        if (cartModal && !cartModal.contains(event.target) && !event.target.closest('.cart-btn')) {
            cartModal.style.display = 'none';
        }
    });

    // Handle Login as Admin click
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            loginOptions.style.display = 'none';
            adminLoginForm.style.display = 'block';
            userLoginForm.style.display = 'none'; // Hide user form
        });
    }

    // Handle Login as User click
    if (userLoginBtn) {
        userLoginBtn.addEventListener('click', () => {
            loginOptions.style.display = 'none';
            userLoginForm.style.display = 'block';
            adminLoginForm.style.display = 'none'; // Hide admin form
        });
    }

    // Admin Login Logic
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginSubmit = document.getElementById('adminLoginSubmit');
    const adminLoginError = document.getElementById('adminLoginError');
    const authButtons = document.getElementById('authButtons'); // Get auth buttons container
    const adminControls = document.getElementById('adminControls'); // Get admin controls container
    const signoutBtn = document.querySelector('.auth-button.signout-btn'); // Get sign out button

    if (adminLoginSubmit) {
        adminLoginSubmit.addEventListener('click', async (event) => {
            event.preventDefault();
            const username = adminUsernameInput.value;
            const password = adminPasswordInput.value;
            try {
                const response = await fetch('http://localhost:3001/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: username, password: password })
                });
                const data = await response.json();
                if (response.ok && data.user.role === 'admin') {
                    alert('Admin login successful!');
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateAuthDisplay();
                    forceMenuRerender();
                    adminLoginError.textContent = '';
                    adminLoginForm.style.display = 'none';
                    loginModal.style.display = 'none';
                } else {
                    adminLoginError.textContent = 'Invalid admin credentials.';
                }
            } catch (error) {
                console.error('Error during admin login:', error);
                adminLoginError.textContent = 'Network error or server unavailable. Please try again.';
            }
        });
    }

    // User Login Logic
    const userEmailInput = document.getElementById('userEmail');
    const userPasswordInput = document.getElementById('userPassword');
    const userLoginSubmit = document.getElementById('userLoginSubmit');
    const userLoginError = document.getElementById('userLoginError');
    const userControls = document.getElementById('userControls'); // New: User controls container
    const userSignoutBtn = document.querySelector('.user-signout-btn'); // New: User signout button

    if (userLoginSubmit) {
        userLoginSubmit.addEventListener('click', async (event) => {
            event.preventDefault();
            const email = userEmailInput.value;
            const password = userPasswordInput.value;
            const userLoginError = document.getElementById('userLoginError');
            userLoginError.textContent = '';
            console.log('Attempting user login with backend...');
            try {
                const response = await fetch('http://localhost:3001/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    localStorage.setItem('isUserLoggedIn', 'true');
                    updateAuthDisplay();
                    forceMenuRerender();
                    userLoginError.textContent = '';
                    userLoginForm.style.display = 'none';
                    loginModal.style.display = 'none';
                    restoreCartFromStorage();
                    console.log('currentUser after login and before processPayment:', JSON.parse(localStorage.getItem('currentUser')));
                    console.log('currentUser.id after login:', JSON.parse(localStorage.getItem('currentUser')).id);
                    localStorage.setItem('activeSection', 'home');
                    showSection('home');
                } else {
                    userLoginError.textContent = data.message || 'Invalid credentials.';
                }
            } catch (error) {
                console.error('Error during user login:', error);
                userLoginError.textContent = 'Network error or server unavailable. Please try again.';
            }
        });
    }

    // Function to update authentication display based on login status
    function updateAuthDisplay() {
        const adminDashboardMenuItem = document.getElementById('adminDashboardMenuItem');
        const updateInfoMenuItem = document.getElementById('updateInfoMenuItem');
        const adminControls = document.getElementById('adminControls');
        const userControls = document.getElementById('userControls');
        const authButtons = document.getElementById('authButtons');
        const loginBtn = document.querySelector('.auth-button.login-btn');
        const registerBtn = document.querySelector('.auth-button.register-btn');
        const cartBtn = document.querySelector('.auth-button.cart-btn');
        const verifyEmailBtn = document.querySelector('.auth-button.verify-email-btn');

        if (localStorage.getItem('isAdminLoggedIn') === 'true') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (cartBtn) cartBtn.style.display = 'flex'; // Ensure cart button is visible for admin
            if (adminControls) {
                adminControls.style.display = 'flex';
                const welcomeMessage = adminControls.querySelector('.welcome-message');
                if (welcomeMessage && currentUser && currentUser.firstName) {
                    welcomeMessage.textContent = `Welcome, ${currentUser.firstName}!`;
                } else if (welcomeMessage) {
                    welcomeMessage.textContent = 'Welcome, Admin'; // Fallback if name not found
                }
            }
            if (userControls) userControls.style.display = 'none';
            if (adminDashboardMenuItem) adminDashboardMenuItem.style.display = 'block';
            if (updateInfoMenuItem) updateInfoMenuItem.style.display = 'block';
            if (verifyEmailBtn) verifyEmailBtn.style.display = 'none';
        } else if (localStorage.getItem('isUserLoggedIn') === 'true') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (cartBtn) cartBtn.style.display = 'flex'; // Ensure cart button is visible for user
            if (adminControls) adminControls.style.display = 'none';
            if (userControls) {
                userControls.style.display = 'flex';
                const welcomeMessage = userControls.querySelector('.welcome-message');
                if (welcomeMessage && currentUser && currentUser.firstName) {
                    welcomeMessage.textContent = `Welcome, ${currentUser.firstName}!`;
                } else if (welcomeMessage) {
                    welcomeMessage.textContent = 'Logged in';
                }
            }
            if (adminDashboardMenuItem) adminDashboardMenuItem.style.display = 'none';
            if (updateInfoMenuItem) updateInfoMenuItem.style.display = 'block';
            if (verifyEmailBtn) verifyEmailBtn.style.display = 'none';
        } else {
            // Guest/default state
            if (loginBtn) loginBtn.style.display = 'flex';
            if (registerBtn) registerBtn.style.display = 'flex';
            if (cartBtn) cartBtn.style.display = 'flex'; // Show cart for guests
            if (adminControls) adminControls.style.display = 'none';
            if (userControls) userControls.style.display = 'none';
            if (adminDashboardMenuItem) adminDashboardMenuItem.style.display = 'none';
            if (updateInfoMenuItem) updateInfoMenuItem.style.display = 'none';
            if (verifyEmailBtn) verifyEmailBtn.style.display = 'flex';
        }
    }

    // Function to verify password before showing update form
    async function verifyPassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const passwordVerificationError = document.getElementById('passwordVerificationError');
        const passwordVerificationForm = document.getElementById('passwordVerificationForm');
        const updateInfoForm = document.getElementById('updateInfoForm');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const token = localStorage.getItem('token');

        if (!currentUser || !token) {
            passwordVerificationError.textContent = 'You must be logged in to update information.';
            return;
        }

        passwordVerificationError.textContent = ''; // Clear any previous error

        try {
            // Send a request to the backend to verify the password
            // We can re-use the login endpoint for this purpose
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: currentUser.email, password: currentPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // Password is correct, show update form and populate it
            passwordVerificationForm.style.display = 'none';
            updateInfoForm.style.display = 'block';
                populateUpdateForm(); // Populate the form with current user data
        } else {
                // Password is incorrect
                passwordVerificationError.textContent = data.message || 'Incorrect password. Please try again.';
            }
        } catch (error) {
            console.error('Error during password verification:', error);
            passwordVerificationError.textContent = 'Network error or server unavailable. Please try again.';
        }
    }

    // Function to populate update information form with current user data
    function populateUpdateForm() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        document.getElementById('updateFirstName').value = currentUser.firstName || '';
        document.getElementById('updateLastName').value = currentUser.lastName || '';
        document.getElementById('updatePhoneNumber').value = currentUser.phoneNumber || '';
        document.getElementById('updateAddress').value = currentUser.address || '';
        document.getElementById('updateEmail').value = currentUser.email || '';
        // Clear password fields
        document.getElementById('updatePassword').value = '';
        document.getElementById('confirmUpdatePassword').value = '';
    }

    // Function to handle update information form submission
    async function handleUpdateInfo(event) {
        event.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const token = localStorage.getItem('token');
        const updateInfoError = document.getElementById('updateInfoError');

        if (!currentUser || !token) {
            updateInfoError.textContent = 'No user data found. Please log in again.';
            return;
        }

        const newPassword = document.getElementById('updatePassword').value;
        const confirmPassword = document.getElementById('confirmUpdatePassword').value;

        if (newPassword && newPassword !== confirmPassword) {
            updateInfoError.textContent = 'New passwords do not match!';
            return;
        }

        const updatedData = {
            firstName: document.getElementById('updateFirstName').value.trim(),
            lastName: document.getElementById('updateLastName').value.trim(),
            phoneNumber: document.getElementById('updatePhoneNumber').value.trim(),
            address: document.getElementById('updateAddress').value.trim(),
            email: document.getElementById('updateEmail').value.trim()
        };

        if (newPassword) {
            updatedData.password = newPassword;
        }

        updateInfoError.textContent = ''; // Clear any previous errors

        try {
            const response = await fetch(`http://localhost:3001/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (response.ok) {
                // Update successful
                localStorage.setItem('currentUser', JSON.stringify({
                    ...currentUser,
                    firstName: updatedData.firstName,
                    lastName: updatedData.lastName,
                    email: updatedData.email
                }));

        // Update welcome message if it exists
        const welcomeMessage = document.querySelector('.user-controls .welcome-message');
        if (welcomeMessage) {
                    welcomeMessage.textContent = `Welcome, ${updatedData.firstName}!`;
        }

        alert('Information updated successfully!');
                updateInfoError.textContent = '';
        
                // Reset the forms and go back to password verification
        document.getElementById('currentPassword').value = '';
        document.getElementById('passwordVerificationForm').style.display = 'block';
        document.getElementById('updateInfoForm').style.display = 'none';
            } else {
                // Update failed
                if (data.message) {
                    updateInfoError.textContent = data.message;
                } else if (data.errors && data.errors.length > 0) {
                    updateInfoError.textContent = data.errors[0].msg;
                } else {
                    updateInfoError.textContent = 'Failed to update information. Please try again.';
                }
            }
        } catch (error) {
            console.error('Error during update information:', error);
            updateInfoError.textContent = 'Network error or server unavailable. Please try again.';
        }
    }

    // Add event listener for update information form
    const updateInfoForm = document.getElementById('updateInfoForm');
    if (updateInfoForm) {
        updateInfoForm.addEventListener('submit', handleUpdateInfo);
    }

    // Update showSection function to handle order-history, update-info, and payment
    const originalShowSection = showSection;
    showSection = function(sectionId) {
        if (sectionId === 'order-history') {
            showOrderHistory();
            return;
        }
        originalShowSection(sectionId);
        if (sectionId === 'update-info') {
            // Reset forms
            document.getElementById('currentPassword').value = '';
            document.getElementById('passwordVerificationForm').style.display = 'block';
            document.getElementById('updateInfoForm').style.display = 'none';
            document.getElementById('passwordVerificationError').textContent = '';
            document.getElementById('updateInfoError').textContent = '';
        }
        if (sectionId === 'payment') {
            renderOrderSummaryWithDiscount();
            calculatePrice();
        }
    };

    // Handle Sign Out click for admin
    if (signoutBtn) {
        signoutBtn.addEventListener('click', () => {
            saveCartToStorage();
            localStorage.removeItem('isAdminLoggedIn');
            cartItems = [];
            updateCartCount();
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = '0';
                cartCountElement.style.display = 'inline-block';
            }
            updateAuthDisplay();
            forceMenuRerender();
            const adminDashboard = document.getElementById('admin-dashboard');
            if (adminDashboard) {
                adminDashboard.style.display = 'none';
            }
            const updateInfo = document.getElementById('update-info');
            if (updateInfo) {
                updateInfo.style.display = 'none';
            }
            showSection('home');
            alert('Signed out as Admin.');
        });
    }

    // Handle Sign Out click for user
    if (userSignoutBtn) {
        userSignoutBtn.addEventListener('click', () => {
            saveCartToStorage();
            localStorage.removeItem('isUserLoggedIn');
            updateAuthDisplay();
            forceMenuRerender();
            const updateInfo = document.getElementById('update-info');
            if (updateInfo) {
                updateInfo.style.display = 'none';
            }
            showSection('home');
            alert('Signed out as User.');
        });
    }


    function toggleMenu() {
        const menu = document.getElementById('menu');
        const menuBtn = document.querySelector('.menu-btn');
        
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
            document.removeEventListener('mousedown', handleMenuOutsideClick);
        } else {
            menu.style.display = 'block';
            // Add event listener for outside click
            setTimeout(() => {
                document.addEventListener('mousedown', handleMenuOutsideClick);
            }, 0);
        }
    }

    function handleMenuOutsideClick(event) {
        const menu = document.getElementById('menu');
        const menuBtn = document.querySelector('.menu-btn');
        if (menu.style.display === 'block' && !menu.contains(event.target) && !menuBtn.contains(event.target)) {
            menu.style.display = 'none';
            document.removeEventListener('mousedown', handleMenuOutsideClick);
        }
    }

    function showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.style.display = 'block';
            // Re-enable interactive elements like videos or animations if necessary
            // Also update local storage to remember active section
            localStorage.setItem("activeSection", sectionId);

            // If the payment section is activated, ensure the default card payment is shown
            if (sectionId === 'payment') {
                switchPaymentMethod('card');
            }
            
            // Close the menu after showing the section
            const menu = document.getElementById('menu');
            if (menu) {
                menu.style.display = 'none';
                document.removeEventListener('mousedown', handleMenuOutsideClick);
            }
        }
    }

    function renderModelCards() {
        const modelList = document.getElementById('modelList');
        console.log('models array:', models);
        modelList.innerHTML = models.map(model => `
            <div class="model-card">
                <div class="image-container">
                    <img src="${model.image}" alt="${model.name}" class="responsive-img">
                </div>
                <h3>${model.name}</h3>
                <p>From ${model.price}</p>
                <p class="model-stock ${model.stock === 0 ? 'out-of-stock' : (model.stock < 2 ? 'low-stock' : '')}">
                    Stock: ${model.stock !== undefined && model.stock > 0 ? model.stock : '0'}
                </p>
                <ul class="model-specs">
                    <li>0-60 mph: ${model.specs["0-60 mph"]}</li>
                    <li>Max power: ${model.specs["Max power"]}</li>
                    <li>Top speed: ${model.specs["Top speed"]}</li>
                </ul>
                <button onclick="selectModel('${model.id}')" class="action-button" ${model.stock === 0 ? 'disabled style=\'background:#888;cursor:not-allowed;opacity:0.6\'' : ''}>${model.stock === 0 ? 'Out of Stock' : 'Select model'}</button>
            </div>
        `).join('');
        console.log('Rendered', models.length, 'model cards.');
    }

    function renderPaginationControls() {
        const paginationContainer = document.getElementById('paginationControls');
        if (!paginationContainer) {
            console.warn('Pagination container not found. Please add a div with id="paginationControls" to FrontEnd.html');
            return;
        }
        paginationContainer.innerHTML = ''; // Clear previous controls

        if (totalPages > 1) {
            const ul = document.createElement('ul');
            ul.classList.add('pagination');

            // Previous button
            const prevLi = document.createElement('li');
            const prevBtn = document.createElement('a');
            prevBtn.href = '#';
            prevBtn.textContent = 'Previous';
            prevBtn.classList.add('page-link');
            if (currentPage === 1) {
                prevLi.classList.add('disabled');
            } else {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetchModels(currentPage - 1);
                });
            }
            prevLi.appendChild(prevBtn);
            ul.appendChild(prevLi);

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                const btn = document.createElement('a');
                btn.href = '#';
                btn.textContent = i;
                btn.classList.add('page-link');
                if (i === currentPage) {
                    li.classList.add('active');
                }
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetchModels(i);
                });
                li.appendChild(btn);
                ul.appendChild(li);
            }

            // Next button
            const nextLi = document.createElement('li');
            const nextBtn = document.createElement('a');
            nextBtn.href = '#';
            nextBtn.textContent = 'Next';
            nextBtn.classList.add('page-link');
            if (currentPage === totalPages) {
                nextLi.classList.add('disabled');
            } else {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetchModels(currentPage + 1);
                });
            }
            nextLi.appendChild(nextBtn);
            ul.appendChild(nextLi);

            paginationContainer.appendChild(ul);
        }
    }

    // Update selectModel to work with card system - removed display updates for removed info panel
    function selectModel(modelIdOrName) {
        // Accept either id or name
        let model = models.find(m => m.id === modelIdOrName) || models.find(m => m.name === modelIdOrName);
        if (!model) return;
        if (model.stock === 0) {
            alert('This model is out of stock and cannot be selected.');
            return;
        }
        // Reset all customizations
        document.querySelectorAll('.modifications input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        // Reset color selection to default (black)
        document.getElementById("colorDropdown").value = "black";
        selectColor();
        // Clear modification summary
        const summaryContainer = document.getElementById('modificationSummary');
        if (summaryContainer) {
            summaryContainer.innerHTML = '<h3>Selected Modifications</h3><div class="selected-mods-list"></div>';
        }
        // Clear final price display
        const finalPriceElement = document.getElementById("finalPrice");
        if (finalPriceElement) {
            finalPriceElement.innerHTML = '';
        }
        // Clear discount code input and message, and reset appliedDiscount
        const discountCodeInput = document.getElementById('discountCodeInput');
        if (discountCodeInput) discountCodeInput.value = '';
        const discountCodeMessage = document.getElementById('discountCodeMessage');
        if (discountCodeMessage) discountCodeMessage.textContent = '';
        appliedDiscount = null;
        // Save the new model selection
        localStorage.setItem("selectedModel", model.id);
        // Navigate to customize section
        showSection('customize');
        // Calculate and display initial price
        calculatePrice();
    }

    function selectColor() {
        let colorDropdown = document.getElementById("colorDropdown");
        let selectedColor = colorDropdown.value;
        let displayElement = document.getElementById("selectedColorDisplay");
        let colorPreview = document.getElementById("colorPreview");
        
        if (displayElement) {
            displayElement.innerText = "Selected Color: " + colorDropdown.options[colorDropdown.selectedIndex].text;
        }
        
        if (colorPreview && colorMap[selectedColor]) {
            colorPreview.style.backgroundColor = colorMap[selectedColor];
        }
        
        localStorage.setItem("selectedColor", selectedColor);
        renderModificationSummary();
    }

    function renderModificationSummary() {
        const summaryDiv = document.querySelector('.selected-mods-list');
        const selectedMods = {};
        let totalPrice = 0;

        document.querySelectorAll('.mod-option input[type="checkbox"]:checked').forEach(checkbox => {
            const modName = checkbox.nextElementSibling.textContent.split('+')[0].trim();
            const modPrice = parseFloat(checkbox.value);
            selectedMods[checkbox.id] = modName;
            totalPrice += modPrice;
        });

        localStorage.setItem('selectedModifications', JSON.stringify(selectedMods));

        summaryDiv.innerHTML = `
            <div class="mod-summary">
                ${Object.entries(selectedMods).map(([id, name]) => `
                    <div class="mod-item">
                        <span>${name}</span>
                        <span>+$${parseFloat(document.getElementById(id).value).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    let appliedDiscount = null;

    async function applyDiscountCode() {
        const codeInput = document.getElementById('discountCodeInput');
        const messageDiv = document.getElementById('discountCodeMessage');
        const code = codeInput.value.trim();
        if (!code) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Please enter a discount code.';
            appliedDiscount = null;
            renderOrderSummaryWithDiscount();
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/discounts/verify?code=${encodeURIComponent(code)}`);
            if (!response.ok) {
                const data = await response.json();
                messageDiv.style.color = 'red';
                messageDiv.textContent = data.message || 'Invalid discount code.';
                appliedDiscount = null;
                renderOrderSummaryWithDiscount();
                return;
            }
            const data = await response.json();
            appliedDiscount = { code, percentage: data.percentage, description: data.description };
            messageDiv.style.color = '#4CAF50';
            messageDiv.textContent = `Discount applied: ${data.percentage}% off (${data.description})`;
            renderOrderSummaryWithDiscount();
        } catch (error) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Network error. Please try again.';
            appliedDiscount = null;
            renderOrderSummaryWithDiscount();
        }
    }

    // Update calculatePrice to only apply discount if in payment section
    function calculatePrice() {
        let selectedModelId = localStorage.getItem("selectedModel");
        if (!selectedModelId) {
            const finalPriceElement = document.getElementById("finalPrice");
            if (finalPriceElement) {
                finalPriceElement.innerHTML = '';
                finalPriceElement.removeAttribute('data-total-price');
            }
            return;
        }
        let selectedModel = models.find(m => m.id === selectedModelId);
        if (!selectedModel) {
            console.error("Selected model not found in models array.");
            return;
        }
        let basePrice = parseInt(selectedModel.price.replace(/[^0-9]/g, '')) || 50000;
        let addedCost = 0;
        document.querySelectorAll('input[type=checkbox]:checked').forEach(item => {
            addedCost += parseInt(item.value);
        });
        let finalPriceElement = document.getElementById("finalPrice");
        if (finalPriceElement) {
            let totalPrice = basePrice + addedCost;
            finalPriceElement.innerHTML = `
                <div class="price-breakdown">
                    <div class="price-item">
                        <span>Base Price:</span>
                        <span>$${basePrice.toLocaleString()}</span>
                    </div>
                    <div class="price-item">
                        <span>Modifications:</span>
                        <span>$${addedCost.toLocaleString()}</span>
                    </div>
                    <div class="price-item total">
                        <span>Total Price:</span>
                        <span>$${totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            `;
            finalPriceElement.setAttribute('data-total-price', totalPrice);
            finalPriceElement.classList.add('price-calculated');
            setTimeout(() => {
                finalPriceElement.classList.remove('price-calculated');
            }, 1000);
        }
    }

    function bookmarkModel() {
        // The model display elements were removed from HTML, so we no longer retrieve model info from display.
        let selectedModelId = localStorage.getItem("selectedModel");
        let selectedModel = models.find(m => m.id === selectedModelId);
        
        if (!selectedModel) {
            alert("Please select a model first!"); // Keep alert here for specific user action
            return;
        }
        localStorage.setItem("bookmarkedModel", selectedModel.name);
    }

    // Payment Method Switching
    function switchPaymentMethod(method) {
        console.log(`Attempting to switch to payment method: ${method}`);
        // Remove active class from all methods and sections
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('active');
            console.log(`Removed active from payment method: ${m.outerHTML}`);
        });
        document.querySelectorAll('.payment-form-section').forEach(s => {
            s.classList.remove('active');
            console.log(`Removed active from payment form section: ${s.id}`);
        });
        
        // Add active class to selected method and corresponding section
        const selectedMethod = document.querySelector(`.payment-method[onclick*="${method}"]`);
        const selectedForm = document.getElementById(`${method}-form`);
        
        if (selectedMethod && selectedForm) {
            selectedMethod.classList.add('active');
            selectedForm.classList.add('active');
            console.log(`Added active to selected method: ${selectedMethod.outerHTML}`);
            console.log(`Added active to selected form: ${selectedForm.id}`);
        } else {
            console.warn(`Could not find selected method (${method}) or form (${method}-form).`);
        }
    }

    // Card Number Formatting
    function formatCardNumber(input) {
        let value = input.value.replace(/\D/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        input.value = formattedValue.slice(0, 19); // Limit to 16 digits + 3 spaces
    }

    // Expiry Date Formatting
    function formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        
        input.value = value.slice(0, 5); // MM/YY format
    }

    // Process Payment
    async function processPayment(event) {
        event.preventDefault();
        console.log('processPayment called!');
        // Check if the user is logged in (either admin or regular user)
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        const isUserLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('currentUser at start of processPayment:', currentUser);
        if (!models || models.length === 0) {
            alert('Error: Product information not loaded. Please try again later.');
            return false;
        }
        if (!isAdminLoggedIn && !isUserLoggedIn) {
            alert('You must be logged in to make a purchase!');
            return false;
        }
        const form = event.target;
        const paymentType = form.closest('.payment-form-section').getAttribute('data-payment');
        const paymentStatus = document.getElementById('paymentStatus');
        paymentStatus.innerHTML = '';
        paymentStatus.className = 'payment-status';
        let isValid = true;
        const errors = [];
        // --- RELAXED VALIDATION FOR DEMO ---
        if (paymentType === 'card') {
            const cardNumber = form.querySelector('#cardNumber').value.replace(/\s/g, '');
            const expiry = form.querySelector('#expiryDate').value;
            const cvv = form.querySelector('#cvv').value;
            if (!/^\d{12,19}$/.test(cardNumber)) {
                errors.push('Card number must be 12-19 digits');
                isValid = false;
            }
            if (!/^\d{2}\/\d{2}$/.test(expiry)) {
                errors.push('Expiry must be MM/YY');
                isValid = false;
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                errors.push('CVV must be 3 or 4 digits');
                isValid = false;
            }
        } else if (paymentType === 'paypal') {
            const email = form.querySelector('#paypalEmail').value;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.push('Invalid PayPal email');
                isValid = false;
            }
            }
        if (!isValid) {
            paymentStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors.join(', ')}`;
            paymentStatus.classList.add('error');
            console.log('Validation failed:', errors);
            return false;
        }
        console.log('Validation passed, proceeding to fetch...');
        try {
            const selectedModelId = localStorage.getItem("selectedModel");
            if (!selectedModelId) {
                alert('Please select a model before paying!');
                return false;
            }
            const finalPriceElement = document.getElementById("finalPrice");
            const totalAmount = parseFloat(finalPriceElement ? finalPriceElement.getAttribute('data-total-price') : '0');
            if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
                alert('Please calculate the final price before paying!');
                return false;
            }
            const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUserData || !currentUserData.id || !currentUserData.email) {
                alert('User information is incomplete. Please log in again or update your profile.');
                paymentStatus.innerHTML = '';
                return false;
            }
            const orderData = {
                user: currentUserData.id,
                items: cartItems.map(item => ({
                    modelId: item.modelId,
                    modelName: item.modelName,
                    color: item.color,
                    modifications: item.modifications,
                    price: item.price
                })),
                totalAmount: cartItems.reduce((sum, item) => sum + Number(item.price), 0),
                discount: appliedDiscount ? { percentage: appliedDiscount.percentage, code: appliedDiscount.code, description: appliedDiscount.description } : null,
                status: 'Pending'
            };
            pendingOrderData = orderData;
            try {
                const response = await fetch('http://localhost:3001/api/orders/request-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
                if (response.ok && data.success) {
                    showPurchasePinModal();
            } else {
                    alert(data.message || 'Failed to send confirmation PIN.');
                }
            } catch (error) {
                alert('Network error or server unavailable. Could not send confirmation PIN.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            paymentStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error or server unavailable. Could not place order.';
            paymentStatus.classList.add('error');
            alert('Network error or server unavailable. Could not place order.');
        }
        return false;
    }

    // Initialize payment form event listeners
    document.addEventListener('DOMContentLoaded', function() {
        // Add event listeners for card number formatting
        document.querySelector('#cardNumber').addEventListener('input', function() {
            formatCardNumber(this);
        });

        // Add event listeners for expiry date formatting
        document.querySelector('#expiryDate').addEventListener('input', function() {
            formatExpiryDate(this);
        });

        // Initialize Card as default payment method
        switchPaymentMethod('card');

        renderModelCards();
    });

    // Contact and About Functions
    function contactUs() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) { // Added async keyword
                e.preventDefault();

                const name = document.getElementById('contactName').value.trim();
                const email = document.getElementById('contactEmail').value.trim();
                const message = document.getElementById('contactMessage').value.trim();
                const contactInfo = document.getElementById('contactInfo');

                if (!name || !email || !message) {
                    contactInfo.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Please fill in all fields.</div>';
                    contactInfo.style.backgroundColor = "#ffecec";
                    contactInfo.style.color = "red";
                    contactInfo.style.padding = "15px";
                    contactInfo.style.borderRadius = "4px";
                    contactInfo.style.marginTop = "20px";
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3001/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, email, message })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        contactInfo.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Thank you for your message! Our team will contact you shortly.</div>';
                        contactInfo.style.backgroundColor = "#eeffee";
                        contactInfo.style.color = "green";
                        contactInfo.style.padding = "15px";
                        contactInfo.style.borderRadius = "4px";
                        contactInfo.style.marginTop = "20px";
                        contactForm.reset();
                    } else {
                        contactInfo.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> Error: ${data.message || 'Failed to send message'}.</div>`;
                        contactInfo.style.backgroundColor = "#ffecec";
                        contactInfo.style.color = "red";
                        contactInfo.style.padding = "15px";
                        contactInfo.style.borderRadius = "4px";
                        contactInfo.style.marginTop = "20px";
                    }
                } catch (error) {
                    console.error('Error sending contact message:', error);
                    contactInfo.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Network error or server unavailable. Could not send message.</div>';
                    contactInfo.style.backgroundColor = "#ffecec";
                    contactInfo.style.color = "red";
                    contactInfo.style.padding = "15px";
                    contactInfo.style.borderRadius = "4px";
                    contactInfo.style.marginTop = "20px";
                }
            });
        }
    }

    function aboutUs() {
        let aboutElement = document.getElementById("aboutInfo");
        if (aboutElement) {
            aboutElement.innerHTML = `
                <div class="about-expanded">
                    <p>At Prestige Porsche Works, we believe that every Porsche deserves to be as unique as its owner. Our team of certified technicians and designers work tirelessly to create bespoke modifications that enhance both the performance and aesthetics of your vehicle.</p>
                    <p>With over 20 years of experience in the luxury automotive industry, we have established ourselves as the premier destination for Porsche enthusiasts seeking to elevate their driving experience.</p>
                    <p>Visit our showroom to see our latest projects and discuss how we can transform your Porsche into a true masterpiece.</p>
                </div>
            `;
            
            // Add animation
            aboutElement.style.animation = "fadeIn 0.5s ease-out";
        }
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
        let activeSection = localStorage.getItem("activeSection");
        let selectedModelId = localStorage.getItem("selectedModel");
        let selectedColor = localStorage.getItem("selectedColor");

        // Determine the section to show on load
        if (!activeSection) {
            // First time visit - default to home
            activeSection = 'home';
            // Also ensure no old customization data is present from previous sessions if they existed
            localStorage.removeItem("selectedModel");
            localStorage.removeItem("selectedColor");
            localStorage.removeItem("selectedModifications"); // Ensure modifications are also cleared
            localStorage.removeItem("finalPrice"); // Clear final price
        }
        showSection(activeSection);

        // Handle customization UI based on the active section and selected model
        if (activeSection === 'customize' || activeSection === 'models') {
            if (selectedModelId) {
                // Restore color selection
                if (selectedColor) {
                    document.getElementById("colorDropdown").value = selectedColor;
                } else {
                    document.getElementById("colorDropdown").value = "black";
                }
                selectColor(); // This will update preview and render modification summary
                // Only calculate price if a model is selected and we're on a relevant section
                calculatePrice();
            } else {
                // If on customize/models but no model was selected, clear customizations UI
                document.querySelectorAll('.modifications input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
                document.getElementById("colorDropdown").value = "black";
                selectColor();
                const summaryContainer = document.getElementById('modificationSummary');
                if (summaryContainer) {
                    summaryContainer.innerHTML = '<h3>Selected Modifications</h3><div class="selected-mods-list"></div>';
                }
                const finalPriceElement = document.getElementById("finalPrice");
                if (finalPriceElement) {
                    finalPriceElement.innerHTML = '';
                }
            }
        } else {
            // If not on customize/models, ensure customization UI is clean
            document.querySelectorAll('.modifications input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            document.getElementById("colorDropdown").value = "black";
            selectColor(); // This updates the preview and summary
            const summaryContainer = document.getElementById('modificationSummary');
            if (summaryContainer) {
                summaryContainer.innerHTML = '<h3>Selected Modifications</h3><div class="selected-mods-list"></div>';
            }
            const finalPriceElement = document.getElementById("finalPrice");
            if (finalPriceElement) {
                finalPriceElement.innerHTML = '';
            }
            // Also clear localStorage if they were on a non-customization page
            localStorage.removeItem("selectedModel");
            localStorage.removeItem("selectedColor");
            localStorage.removeItem("selectedModifications"); // Clear modifications
            localStorage.removeItem("finalPrice"); // Clear final price
        }

        // Add event listeners to modification checkboxes
        document.querySelectorAll('.modifications input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', renderModificationSummary);
        });

        // Initialize contact form
        contactUs();

        // Re-add smooth scrolling for all links (if it was removed)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - document.querySelector('nav').offsetHeight,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Check admin login status on page load and update UI
        updateAuthDisplay();

        // Initialize payment form event listeners
        // These event listeners are moved inside the DOMContentLoaded to ensure elements are present
        const cardNumberInput = document.querySelector('#cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function() {
                formatCardNumber(this);
            });
        }

        const expiryDateInput = document.querySelector('#expiryDate');
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', function() {
                formatExpiryDate(this);
            });
        }

        // Initialize Card as default payment method (if payment section is shown)
        if (document.getElementById('payment').style.display === 'block') {
            switchPaymentMethod('card');
        }
        renderModelCards();
        restoreCartFromStorage(); // Restore cart data on load

        const selectAnotherModelBtn = document.getElementById('selectAnotherModelBtn');
        if (selectAnotherModelBtn) {
            selectAnotherModelBtn.addEventListener('click', function() {
                if (typeof cartModal !== 'undefined' && cartModal) {
                    cartModal.style.display = 'none';
                }
                showSection('models');
            });
        }
    });

    // Add price-breakdown styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .price-breakdown {
            margin: 20px 0;
        }
        
        .price-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .price-item.total {
            font-weight: bold;
            font-size: 1.2em;
            border-top: 2px solid #d5001c;
            border-bottom: none;
            margin-top: 10px;
            padding-top: 15px;
        }
        
        .price-calculated {
            animation: highlight 1s ease;
        }
        
        @keyframes highlight {
            0% { background-color: #d5001c; color: white; }
            100% { background-color: transparent; color: inherit; }
        }
        
        .success-message {
            padding: 15px;
            background-color: #eeffee;
            color: green;
            border-radius: 4px;
            margin-top: 20px;
            animation: fadeIn 0.5s ease-out;
        }
    `;
document.head.appendChild(style);

    // Registration Form Handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const address = document.getElementById('address').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const registerError = document.getElementById('registerError');

            registerError.textContent = ''; // Clear any previous error messages

            if (password !== confirmPassword) {
                registerError.textContent = 'Passwords do not match!';
                return;
            }

            console.log('Attempting registration with backend...');

            fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                firstName,
                lastName,
                phoneNumber,
                address,
                email,
                    password,
                    role: 'user' // Default to 'user' role for frontend registration
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message && data.message.includes('verification PIN')) {
                    registerForm.reset();
                    showPinModal(email);
                } else if (data.token) {
                    // Registration successful, log in automatically
            registerForm.reset();
            registerError.style.color = 'green';
                    registerError.textContent = 'Registration successful! Logging in...';
                    
                    // Store the token and user info (excluding password) in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify({ _id: data.user.id, firstName: data.user.firstName, lastName: data.user.lastName, email: data.user.email, role: data.user.role }));
                    localStorage.setItem('isUserLoggedIn', 'true'); // Keep this flag for now, will refine later
                    localStorage.removeItem('isAdminLoggedIn');

                    updateAuthDisplay();

            setTimeout(() => {
                registerModal.style.display = 'none';
                        alert('Registration successful! Welcome to Prestige Porsche Works.');
                    }, 1000);

                } else if (data.message) {
                    registerError.textContent = data.message;
                } else if (data.errors && data.errors.length > 0) {
                    registerError.textContent = data.errors[0].msg; // Display first validation error
                } else {
                    registerError.textContent = 'Registration failed. Please try again.';
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                registerError.textContent = 'Network error or server unavailable. Please try again.';
            });
        });
    }

    // Admin Dashboard Functions
    function showAdminSection(section) {
        const contentDiv = document.getElementById('admin-section-content');
        if (!contentDiv) return;

        // Clear previous content
        contentDiv.innerHTML = '';

        // Handle different sections
        switch(section) {
            case 'manage-users':
                showManageUsers(contentDiv);
                break;
            case 'edit-models':
                showEditModels(contentDiv);
                break;
            case 'add-models':
                showAddModels(contentDiv);
                break;
            case 'stock':
                showStockManagement(contentDiv);
                break;
            case 'appointments':
                showContactMessages(contentDiv);
                break;
            case 'discounts':
                showDiscountsManagement(contentDiv);
                break;
            case 'orders':
                showOrdersManagement(contentDiv);
                break;
            // ... other cases will be handled later ...
            default:
                contentDiv.innerHTML = `
                    <h3>Welcome to the Admin Dashboard</h3>
                    <p>Select a section from the cards above.</p>
                `;
        }
    }

    async function showManageUsers(contentDiv) {
        const token = localStorage.getItem('token'); // Get admin token
        
        if (!token) {
            contentDiv.innerHTML = '<p>Error: Not authenticated. Please log in as an admin.</p>';
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const users = data; // Corrected from data.users
        contentDiv.innerHTML = `
            <h3>Manage Users</h3>
            <div class="admin-actions">
                <button class="admin-action-btn add-btn" onclick="showAddUserForm()">
                    <i class="fas fa-user-plus"></i> Add New User
                </button>
            </div>
            ${users.length === 0 ? `
                <p>No users found in the system.</p>
            ` : `
                <div class="users-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                        <th>Username</th>
                                <th>Phone</th>
                                <th>Address</th>
                                        <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${user.firstName} ${user.lastName}</td>
                                    <td>${user.email}</td>
                                    <td>${user.phoneNumber}</td>
                                    <td>${user.address}</td>
                                            <td>${user.role}</td>
                                    <td>
                                                <button class="admin-action-btn edit-btn" onclick="editUser('${user._id}')">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                                <button class="admin-action-btn delete-btn" onclick="deleteUser('${user._id}')">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        `;
            } else {
                contentDiv.innerHTML = `<p>Error fetching users: ${data.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            contentDiv.innerHTML = '<p>Network error or server unavailable. Could not load users.</p>';
        }
    }

    function showAddUserForm() {
        const contentDiv = document.getElementById('admin-section-content');
        
        contentDiv.innerHTML = `
            <h3>Add New User</h3>
            <form class="admin-form" onsubmit="addNewUser(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="newFirstName">First Name:</label>
                        <input type="text" id="newFirstName" required>
                    </div>
                    <div class="form-group">
                        <label for="newLastName">Last Name:</label>
                        <input type="text" id="newLastName" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="newEmail">Email:</label>
                    <input type="email" id="newEmail" required>
                </div>
                <div class="form-group">
                    <label for="newPassword">Password:</label>
                    <input type="password" id="newPassword" required 
                           pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$"
                           title="Password must be at least 8 characters long and contain uppercase, lowercase, and numbers">
                </div>
                <div class="form-group">
                    <label for="newPhoneNumber">Phone Number:</label>
                    <input type="tel" id="newPhoneNumber" required>
                </div>
                <div class="form-group">
                    <label for="newAddress">Address:</label>
                    <input type="text" id="newAddress" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="admin-action-btn save-btn">
                        <i class="fas fa-save"></i> Create User
                    </button>
                    <button type="button" class="admin-action-btn cancel-btn" onclick="showAdminSection('manage-users')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
    }

    function addNewUser(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('newFirstName').value.trim();
        const lastName = document.getElementById('newLastName').value.trim();
        const email = document.getElementById('newEmail').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        const phoneNumber = document.getElementById('newPhoneNumber').value.trim();
        const address = document.getElementById('newAddress').value.trim();
        const token = localStorage.getItem('token'); // Get admin token

        // No need for frontend email/password/phone validation here if backend handles it,
        // but keeping it for immediate user feedback.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address!');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers!');
            return;
        }
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            alert('Please enter a valid phone number!');
            return;
        }

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        const newUser = {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            address,
            role: 'user' // Default new user to 'user' role
        };

        fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Admin token for protected route, if registration requires it
            },
            body: JSON.stringify(newUser),
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) { // If token is returned, registration was successful
                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', JSON.stringify({ _id: data.user.id, firstName: data.user.firstName, lastName: data.user.lastName, email: data.user.email, role: data.user.role }));
                localStorage.setItem('isUserLoggedIn', 'true');
                localStorage.removeItem('isAdminLoggedIn');
        alert('User created successfully!');
                showAdminSection('manage-users'); // Refresh user list
            } else if (data.message) {
                alert(`Error: ${data.message}`);
            } else if (data.errors && data.errors.length > 0) {
                alert(`Validation Error: ${data.errors[0].msg}`);
            } else {
                alert('Failed to create user. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error adding new user:', error);
            alert('Network error or server unavailable. Could not add user.');
        });
    }

    async function editUser(userId) {
        const contentDiv = document.getElementById('admin-section-content');
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const user = await response.json();

            if (response.ok) {
                if (!user) {
                    alert('Error: User not found.');
                    showAdminSection('manage-users');
                    return;
                }

        contentDiv.innerHTML = `
            <h3>Edit User: ${user.firstName} ${user.lastName}</h3>
                    <form class="admin-form" onsubmit="updateUser(event, '${user._id}')">
                <div class="form-group">
                    <label for="editFirstName">First Name:</label>
                    <input type="text" id="editFirstName" value="${user.firstName}" required>
                </div>
                <div class="form-group">
                    <label for="editLastName">Last Name:</label>
                    <input type="text" id="editLastName" value="${user.lastName}" required>
                </div>
                <div class="form-group">
                    <label for="editPhoneNumber">Phone Number:</label>
                    <input type="tel" id="editPhoneNumber" value="${user.phoneNumber}" required>
                </div>
                <div class="form-group">
                    <label for="editAddress">Address:</label>
                    <input type="text" id="editAddress" value="${user.address}" required>
                </div>
                <div class="form-group">
                    <label for="editEmail">Email (cannot be changed):</label>
                    <input type="email" id="editEmail" value="${user.email}" disabled>
                </div>
                        <div class="form-group">
                            <label for="editRole">Role:</label>
                            <select id="editRole">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editPassword">New Password (optional):</label>
                            <input type="password" id="editPassword" placeholder="Leave blank to keep current password">
                        </div>
                        <div class="form-group">
                            <label for="confirmEditPassword">Confirm New Password:</label>
                            <input type="password" id="confirmEditPassword" placeholder="Confirm new password">
                        </div>
                <div class="form-actions">
                    <button type="submit" class="admin-action-btn save-btn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button type="button" class="admin-action-btn cancel-btn" onclick="showAdminSection('manage-users')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
            } else {
                alert(`Error fetching user: ${user.message || 'Unknown error'}`);
                showAdminSection('manage-users');
            }
        } catch (error) {
            console.error('Error fetching user for edit:', error);
            alert('Network error or server unavailable. Could not load user for editing.');
            showAdminSection('manage-users');
        }
    }

    async function updateUser(event, userId) {
        event.preventDefault();
        
        const firstName = document.getElementById('editFirstName').value.trim();
        const lastName = document.getElementById('editLastName').value.trim();
        const phoneNumber = document.getElementById('editPhoneNumber').value.trim();
        const address = document.getElementById('editAddress').value.trim();
        const role = document.getElementById('editRole').value;
        const newPassword = document.getElementById('editPassword').value;
        const confirmPassword = document.getElementById('confirmEditPassword').value;
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        const updatedData = {
                firstName,
                lastName,
                phoneNumber,
            address,
            role
        };

        if (newPassword) {
            updatedData.password = newPassword;
        }

        // Frontend validation for password strength if password is provided
        if (newPassword && newPassword.length > 0) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                alert('New password must be at least 8 characters long and contain uppercase, lowercase, and numbers!');
                return;
            }
        }

        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/role`, { // Using /role route for role update, other fields go to /profile
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error updating role: ${errorData.message || 'Unknown error'}`);
                return; 
            }

            // Separate request for profile fields and password
            const profileUpdateData = { ...updatedData };
            delete profileUpdateData.role; // Role handled by separate endpoint

            const profileResponse = await fetch(`http://localhost:3001/api/users/${userId}`, { // Assuming a PUT /api/users/:id for general user updates
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileUpdateData)
            });
            
            const profileData = await profileResponse.json();

            if (profileResponse.ok) {
            alert('User information updated successfully!');
                showAdminSection('manage-users'); // Refresh user list
        } else {
                alert(`Error updating user profile: ${profileData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating user information:', error);
            alert('Network error or server unavailable. Could not update user.');
        }
    }

    async function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const token = localStorage.getItem('token');
            
            if (!token) {
                alert('Admin not authenticated. Please log in again.');
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
            alert('User deleted successfully.');
            showAdminSection('manage-users');
                } else {
                    alert(`Error deleting user: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Network error or server unavailable. Could not delete user.');
            }
        }
    }

    async function showEditModels(contentDiv) {
        const token = localStorage.getItem('token');

        if (!token) {
            contentDiv.innerHTML = '<p>Error: Admin not authenticated. Please log in again.</p>';
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Ensure data is an array
                const models = Array.isArray(data) ? data : (data.models || []);
                
                if (!models || models.length === 0) {
                    contentDiv.innerHTML = `
                        <h3>Edit Porsche Models</h3>
                        <p>No models found in the system.</p>
                    `;
                    return;
                }

                contentDiv.innerHTML = `
                    <h3>Edit Porsche Models</h3>
                    <div class="models-table-container">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Year</th>
                                    <th>Price</th>
                                    <th>HP</th>
                                    <th>0-60mph</th>
                                    <th>Top Speed</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${models.map(model => `
                                    <tr>
                                        <td>${model.name}</td>
                                        <td>${model.year}</td>
                                        <td>$${model.price.toLocaleString()}</td>
                                        <td>${model.specifications.horsepower}</td>
                                        <td>${model.specifications["0-60mph"]}</td>
                                        <td>${parseInt(model.specifications.topSpeed)}</td>
                                        <td>
                                            <button class="admin-action-btn edit-btn" onclick="editModel('${model._id}')">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <button class="admin-action-btn delete-btn" onclick="deleteModel('${model._id}')">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                contentDiv.innerHTML = `<p>Error fetching models: ${data.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            contentDiv.innerHTML = '<p>Network error or server unavailable. Could not load models.</p>';
        }
    }

    async function editModel(modelId) {
        const contentDiv = document.getElementById('admin-section-content');
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/models/${modelId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const model = await response.json();

            if (response.ok) {
                if (!model) {
                    alert('Error: Model not found.');
                    showAdminSection('edit-models');
                    return;
                }

        contentDiv.innerHTML = `
                    <h3>Edit Porsche Model: ${model.name}</h3>
                    <form class="admin-form" onsubmit="updateModel(event, '${model._id}')">
                <div class="form-group">
                    <label for="editModelName">Model Name:</label>
                    <input type="text" id="editModelName" value="${model.name}" required>
                </div>
                <div class="form-group">
                            <label for="editModelYear">Year:</label>
                            <input type="number" id="editModelYear" value="${model.year}" required>
                </div>
                <div class="form-group">
                            <label for="editModelPrice">Price:</label>
                            <input type="number" id="editModelPrice" value="${model.price}" required>
                </div>
                <div class="form-group">
                            <label for="editModelHP">Horsepower (HP):</label>
                            <input type="number" id="editModelHP" value="${model.specifications.horsepower}" required>
                </div>
                <div class="form-group">
                            <label for="editModel060mph">0-60 mph:</label>
                            <input type="text" id="editModel060mph" value="${model.specifications["0-60mph"]}" required>
                        </div>
                        <div class="form-group">
                            <label for="editModelTopSpeed">Top Speed:</label>
                            <input type="number" id="editModelTopSpeed" value="${parseInt(model.specifications.topSpeed)}" required>
                </div>
                <div class="form-group">
                    <label for="editModelImage">Image URL:</label>
                            <input type="text" id="editModelImage" value="${model.imageUrl}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="admin-action-btn save-btn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button type="button" class="admin-action-btn cancel-btn" onclick="showAdminSection('edit-models')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
            } else {
                alert(`Error fetching model: ${model.message || 'Unknown error'}`);
                showAdminSection('edit-models');
            }
        } catch (error) {
            console.error('Error fetching model for edit:', error);
            alert('Network error or server unavailable. Could not load model for editing.');
            showAdminSection('edit-models');
        }
    }

    async function updateModel(event, modelId) {
        event.preventDefault();
        
        const name = document.getElementById('editModelName').value.trim();
        const year = parseInt(document.getElementById('editModelYear').value);
        const price = parseFloat(document.getElementById('editModelPrice').value);
        const horsepower = parseInt(document.getElementById('editModelHP').value);
        const acceleration = document.getElementById('editModel060mph').value.trim();
        // Extract only numbers from topSpeed, allowing for units like 'mph'
        const topSpeedMatch = document.getElementById('editModelTopSpeed').value.match(/\d+/);
        const topSpeed = topSpeedMatch ? parseInt(topSpeedMatch[0]) : 0;
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        const updatedData = {
            name,
            year,
            price,
            specifications: {
                horsepower,
                "0-60mph": acceleration,
                topSpeed
            },
            imageUrl: document.getElementById('editModelImage').value.trim() // Changed from 'image' to 'imageUrl'
        };

        try {
            const response = await fetch(`http://localhost:3001/api/models/${modelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Porsche model updated successfully!');
                showAdminSection('edit-models'); // Refresh the models list
            } else {
                alert(`Error updating model: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating model:', error);
            alert('Network error or server unavailable. Could not update model.');
        }
    }

    async function deleteModel(modelId) {
        if (confirm('Are you sure you want to delete this Porsche model? This action cannot be undone.')) {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Admin not authenticated. Please log in again.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:3001/api/models/${modelId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert('Porsche model deleted successfully.');
                    showAdminSection('edit-models'); // Refresh the models list
            } else {
                    alert(`Error deleting model: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error deleting model:', error);
                alert('Network error or server unavailable. Could not delete model.');
            }
        }
    }

    function showAddModels(contentDiv) {
        contentDiv.innerHTML = `
            <h3>Add New Porsche Model</h3>
            <form class="admin-form" onsubmit="addNewModel(event)">
                <div class="form-group">
                    <label for="newModelName">Model Name:</label>
                    <input type="text" id="newModelName" required>
                </div>
                <div class="form-group">
                    <label for="newModelYear">Year:</label>
                    <input type="number" id="newModelYear" required>
                </div>
                <div class="form-group">
                    <label for="newModelPrice">Base Price ($):</label>
                    <input type="number" id="newModelPrice" required min="0">
                </div>
                <div class="form-group">
                    <label for="newAcceleration">0-60 mph:</label>
                    <input type="text" id="newAcceleration" placeholder="e.g., 3.5 s" required>
                </div>
                <div class="form-group">
                    <label for="newPower">Max Power:</label>
                    <input type="text" id="newPower" placeholder="e.g., 379 hp" required>
                </div>
                <div class="form-group">
                    <label for="newTopSpeed">Top Speed:</label>
                    <input type="number" id="newTopSpeed" placeholder="e.g., 182" required>
                </div>
                <div class="form-group">
                    <label for="newModelImage">Image URL:</label>
                    <input type="text" id="newModelImage" placeholder="Enter full image URL" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="admin-action-btn save-btn">
                        <i class="fas fa-plus-circle"></i> Add Model
                    </button>
                    <button type="button" class="admin-action-btn cancel-btn" onclick="showAdminSection('add-models')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
    }

    async function addNewModel(event) {
        event.preventDefault();

        const name = document.getElementById('newModelName').value.trim();
        const year = parseInt(document.getElementById('newModelYear').value);
        const price = parseFloat(document.getElementById('newModelPrice').value);
        const horsepower = document.getElementById('newPower').value.trim(); // Renamed from 'power' to 'horsepower' to match backend schema
        const acceleration = document.getElementById('newAcceleration').value.trim();
        const topSpeed = parseInt(document.getElementById('newTopSpeed').value); // Changed to parse as integer directly
        const image = document.getElementById('newModelImage').value.trim();
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        if (!name || isNaN(year) || isNaN(price) || price < 0 || !horsepower || !acceleration || !topSpeed || !image) {
            alert('Please fill in all fields with valid data. Price and Year cannot be negative.');
            return;
        }

        // Basic URL validation for the image field
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!urlRegex.test(image)) {
            alert('Please enter a valid URL for the image.');
            return;
        }

        const newModel = {
            name,
            year,
            price,
            specifications: {
                horsepower,
                "0-60mph": acceleration,
                topSpeed
            },
            imageUrl: image // Changed from 'image' to 'imageUrl' to match backend
        };

        try {
            const response = await fetch('http://localhost:3001/api/models', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newModel)
            });

            const data = await response.json();

            if (response.ok) {
                alert('New Porsche model added successfully!');
        showAdminSection('edit-models'); // Redirect to edit models to see the new addition
            } else {
                alert(`Error adding model: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding new model:', error);
            alert('Network error or server unavailable. Could not add model.');
        }
    }

    async function showStockManagement(contentDiv) {
        const token = localStorage.getItem('token');

        if (!token) {
            contentDiv.innerHTML = '<p>Error: Admin not authenticated. Please log in again.</p>';
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Ensure data is an array
                const models = Array.isArray(data) ? data : (data.models || []);
                
                if (!models || models.length === 0) {
                    contentDiv.innerHTML = `
                        <h3>Manage Porsche Model Stock</h3>
                        <p>No models found in the system.</p>
                    `;
                    return;
                }

                contentDiv.innerHTML = `
                    <h3>Manage Porsche Model Stock</h3>
                    <div class="stock-table-container">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Model Name</th>
                                    <th>Current Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${models.map(model => `
                                    <tr>
                                        <td>${model.name}</td>
                                        <td>
                                            <input type="number" id="stock-${model._id}" value="${model.stock || 0}" min="0" class="stock-input">
                                        </td>
                                        <td>
                                            <button class="admin-action-btn save-btn" onclick="updateModelStock('${model._id}')">
                                                <i class="fas fa-save"></i> Update Stock
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                contentDiv.innerHTML = `<p>Error fetching models for stock management: ${data.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching models for stock management:', error);
            contentDiv.innerHTML = '<p>Network error or server unavailable. Could not load models for stock management.</p>';
        }
    }

    async function updateModelStock(modelId) {
        const stockInput = document.getElementById(`stock-${modelId}`);
        const newStock = parseInt(stockInput.value);
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        if (isNaN(newStock) || newStock < 0) {
            alert('Please enter a valid non-negative number for stock.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/models/${modelId}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ stock: newStock })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Stock updated successfully!');
            showAdminSection('stock'); // Refresh the view to show updated stock
        } else {
                alert(`Error updating stock: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Network error or server unavailable. Could not update stock.');
        }
    }

    async function showContactMessages(contentDiv) { // Renamed from showAppointmentsManagement
        const token = localStorage.getItem('token');

        if (!token) {
            contentDiv.innerHTML = '<p>Error: Admin not authenticated. Please log in again.</p>';
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/contact', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const messages = await response.json(); // Assuming backend returns array of messages directly

            if (response.ok) {
                if (!messages || messages.length === 0) {
            contentDiv.innerHTML = `
                        <h3>Manage Contact Messages</h3>
                        <p>No contact messages found.</p>
            `;
            return;
        }

        contentDiv.innerHTML = `
                    <h3>Manage Contact Messages</h3>
                    <div class="contact-messages-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Message</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                                ${messages.map(msg => `
                                    <tr>
                                        <td>${msg.name}</td>
                                        <td>${msg.email}</td>
                                        <td>${msg.message}</td>
                                        <td>${new Date(msg.createdAt).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        } else {
                const errorData = await response.json();
                contentDiv.innerHTML = `<p>Error fetching contact messages: ${errorData.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            contentDiv.innerHTML = '<p>Network error or server unavailable. Could not load contact messages.</p>';
        }
    }

    async function showDiscountsManagement(contentDiv) {
        const token = localStorage.getItem('token');

        if (!token) {
            contentDiv.innerHTML = '<p>Error: Admin not authenticated. Please log in again.</p>';
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/discounts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const discounts = await response.json();

            if (response.ok) {
                if (!discounts || discounts.length === 0) {
            contentDiv.innerHTML = `
                <h3>Manage Discounts</h3>
                <p>No discount codes found in the system.</p>
                        <div class="admin-actions" style="margin-top: 20px;">
                            <button class="admin-action-btn add-btn" onclick="showAddDiscountForm()">
                                <i class="fas fa-plus-circle"></i> Add New Discount
                            </button>
                        </div>
            `;
            return;
        }

        contentDiv.innerHTML = `
            <h3>Manage Discounts</h3>
            <div class="discounts-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Percentage</th>
                            <th>Description</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                                ${discounts.map(discount => `
                            <tr>
                                <td>${discount.code}</td>
                                <td>${discount.percentage}%</td>
                                <td>${discount.description}</td>
                                <td>
                                    <span class="status-badge status-${discount.active ? 'confirmed' : 'cancelled'}">
                                        ${discount.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                            <button class="admin-action-btn edit-btn" onclick="editDiscountDescription('${discount._id}')">
                                        <i class="fas fa-edit"></i> Edit Description
                                    </button>
                                            <button class="admin-action-btn edit-btn" onclick="toggleDiscountStatus('${discount._id}', ${discount.active})">
                                        <i class="fas fa-toggle-${discount.active ? 'on' : 'off'}"></i> ${discount.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                            <button class="admin-action-btn delete-btn" onclick="deleteDiscount('${discount._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="admin-actions" style="margin-top: 20px;">
                <button class="admin-action-btn add-btn" onclick="showAddDiscountForm()">
                    <i class="fas fa-plus-circle"></i> Add New Discount
                </button>
            </div>
        `;
            } else {
                const errorData = await response.json();
                contentDiv.innerHTML = `<p>Error fetching discounts: ${errorData.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
            contentDiv.innerHTML = '<p>Network error or server unavailable. Could not load discounts.</p>';
        }
    }

    async function editDiscountDescription(discountId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/discounts/${discountId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error fetching discount: ${errorData.message || 'Unknown error'}`);
                return;
            }

            const discount = await response.json();

        const contentDiv = document.getElementById('admin-section-content');

        if (!discount || !contentDiv) return;

        contentDiv.innerHTML = `
            <h3>Edit Discount Description for ${discount.code}</h3>
                <form class="admin-form" onsubmit="updateDiscountDescription(event, '${discount._id}')">
                <div class="form-group">
                    <label for="newDescription">Description:</label>
                    <input type="text" id="newDescription" value="${discount.description}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="admin-action-btn save-btn">
                        <i class="fas fa-save"></i> Update Description
                    </button>
                    <button type="button" class="admin-action-btn cancel-btn" onclick="showAdminSection('discounts')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
        } catch (error) {
            console.error('Error fetching discount for editing:', error);
            alert('Network error or server unavailable. Could not fetch discount for editing.');
        }
    }

    async function updateDiscountDescription(event, discountId) {
        event.preventDefault();
        const newDescription = document.getElementById('newDescription').value.trim();
        const token = localStorage.getItem('token');

        if (!newDescription) {
            alert('Description cannot be empty.');
            return;
        }

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/discounts/${discountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description: newDescription })
            });

            const data = await response.json();

            if (response.ok) {
            alert('Discount description updated successfully!');
            showAdminSection('discounts');
        } else {
                alert(`Error updating discount description: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating discount description:', error);
            alert('Network error or server unavailable. Could not update discount description.');
        }
    }

    async function addNewDiscount(event) {
        event.preventDefault();
        
        const code = document.getElementById('newDiscountCode').value.trim().toUpperCase();
        const percentage = parseInt(document.getElementById('newDiscountPercentage').value);
        const description = document.getElementById('newDiscountDescription').value.trim();
        const active = document.getElementById('newDiscountActive').checked;
        const token = localStorage.getItem('token');

        if (!code || isNaN(percentage) || percentage < 1 || percentage > 100 || !description) {
            alert('Please fill in all fields with valid data. Percentage must be between 1 and 100.');
            return;
        }

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/discounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code, percentage, description, active })
            });

            const data = await response.json();

            if (response.ok) {
        alert('Discount code added successfully!');
        showAdminSection('discounts');
            } else {
                alert(`Error adding discount code: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding discount code:', error);
            alert('Network error or server unavailable. Could not add discount code.');
        }
    }

    async function toggleDiscountStatus(discountId, currentStatus) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/discounts/${discountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ active: !currentStatus })
            });

            const data = await response.json();

            if (response.ok) {
            alert('Discount status updated successfully!');
            showAdminSection('discounts');
        } else {
                alert(`Error updating discount status: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error toggling discount status:', error);
            alert('Network error or server unavailable. Could not update discount status.');
        }
    }

    async function deleteDiscount(discountId) {
        if (confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Admin not authenticated. Please log in again.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:3001/api/discounts/${discountId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
            alert('Discount code deleted successfully.');
            showAdminSection('discounts');
                } else {
                    alert(`Error deleting discount code: ${data.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting discount code:', error);
                alert('Network error or server unavailable. Could not delete discount code.');
            }
        }
    }

    // Orders data (initialized or loaded from localStorage)
    let orders = JSON.parse(localStorage.getItem('porscheOrders')) || [
        {
            id: 'order1',
            date: '2024-07-20',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            modelName: 'Porsche 911',
            totalAmount: 120000,
            status: 'Pending'
        },
        {
            id: 'order2',
            date: '2024-07-20',
            userName: 'Jane Smith',
            userEmail: 'jane.smith@example.com',
            modelName: 'Porsche Taycan',
            totalAmount: 150000,
            status: 'Confirmed'
        },
        {
            id: 'order3',
            date: '2024-07-21',
            userName: 'Omar Hossam',
            userEmail: 'omar.hossam@example.com',
            modelName: 'Porsche Cayenne',
            totalAmount: 180000,
            status: 'Cancelled'
        }
    ];

    async function showOrdersManagement(contentDiv) {
        const token = localStorage.getItem('token');

        if (!token) {
            contentDiv.innerHTML = '<p>Error: Admin not authenticated. Please log in again.</p>';
            return;
        }

        try {
            // First fetch all models to get their images
            const modelsResponse = await fetch('http://localhost:3001/api/models?limit=10000', { // Request a large number of models
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const modelsData = await modelsResponse.json();
            const models = Array.isArray(modelsData) ? modelsData : (modelsData.models || []);

            console.log('Fetched models:', models); // Log the fetched models

            // Then fetch orders
            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const orders = await response.json();

            if (response.ok) {
                if (!orders || orders.length === 0) {
                    contentDiv.innerHTML = `
                        <h3>Manage Orders</h3>
                        <p>No orders found in the system.</p>
                    `;
                    return;
                }

                contentDiv.innerHTML = `
                    <h3>Manage Orders</h3>
                    <div class="orders-table-container" style="overflow-x:auto;">
                        <table class="admin-table" style="width:1200px;min-width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="padding:10px 8px;">ID</th>
                                    <th style="padding:10px 8px;">Date</th>
                                    <th style="padding:10px 8px;">User Name</th>
                                    <th style="padding:10px 8px;">User Email</th>
                                    <th style="padding:10px 8px;">Image</th>
                                    <th style="padding:10px 8px;">Model</th>
                                    <th style="padding:10px 8px;">Total Amount</th>
                                    <th style="padding:10px 8px;">Status</th>
                                    <th style="padding:10px 8px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.map(order => {
                                    const item = order.items && order.items[0] ? order.items[0] : {};
                                    let modelImage = '';
                                    if (models && models.length > 0) {
                                        const modelObj = models.find(m => m.name === item.modelName);
                                        console.log(`Order item modelName: ${item.modelName}, Found model object:`, modelObj); // Log model name and found object
                                        if (modelObj && modelObj.imageUrl) {
                                            modelImage = modelObj.imageUrl;
                                        }
                                    }
                                    if (!modelImage) {
                                        modelImage = 'empty.png'; // fallback placeholder
                                    }
                                    return `<tr>
                                        <td style="padding:10px 8px;vertical-align:middle;">${order._id}</td>
                                        <td style="padding:10px 8px;vertical-align:middle;">${new Date(order.createdAt).toLocaleString()}</td>
                                        <td style="padding:10px 8px;vertical-align:middle;">${order.userName}</td>
                                        <td style="padding:10px 8px;vertical-align:middle;">${order.userEmail}</td>
                                        <td style="padding:10px 8px;vertical-align:middle;">
                                            <img src="${modelImage}" alt="${item.modelName || ''}" style="width:60px;height:auto;border-radius:8px;box-shadow:0 2px 8px #0002;">
                                        </td>
                                        <td style="padding:10px 8px;vertical-align:middle;">${item.modelName || ''}</td>
                                        <td style="padding:10px 8px;vertical-align:middle;">$${order.totalAmount.toLocaleString()}</td>
                                        <td style="padding:10px 8px;vertical-align:middle;">
                                            <span class="status-badge status-${order.status ? order.status.toLowerCase() : 'unknown'}">${order.status || 'Unknown'}</span>
                                        </td>
                                        <td style="padding:10px 8px;vertical-align:middle;text-align:center;min-width:120px;">
                                            <button class="admin-action-btn edit-btn" onclick="editOrderStatus('${order._id}')">
                                                <i class="fas fa-edit"></i> Change Status
                                            </button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                contentDiv.innerHTML = `<p>Error fetching orders: ${orders.message || 'Unknown error'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            contentDiv.innerHTML = '<p>Network error or server unavailable. Could not load orders.</p>';
        }
    }

    async function editOrderStatus(orderId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error fetching order: ${errorData.message || 'Unknown error'}`);
                return;
            }

            const order = await response.json();

        const contentDiv = document.getElementById('admin-section-content');

        if (!order || !contentDiv) return;

        contentDiv.innerHTML = `
            <h3>Change Order Status for ${order.userName} (${order.modelName})</h3>
                <form class="admin-form" onsubmit="updateOrderStatus(event, '${order._id}')">
                <div class="form-group">
                    <label for="currentStatus">Current Status:</label>
                    <input type="text" id="currentStatus" value="${order.status}" disabled>
                </div>
                <div class="form-group">
                    <label for="newStatus">New Status:</label>
                    <select id="newStatus" required>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="admin-action-btn save-btn">
                        <i class="fas fa-save"></i> Update Status
                    </button>
                    <button type="button" class="admin-action-btn cancel-btn" onclick="showAdminSection('orders')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
        } catch (error) {
            console.error('Error fetching order for editing:', error);
            alert('Network error or server unavailable. Could not fetch order for editing.');
        }
    }

    async function updateOrderStatus(event, orderId) {
        event.preventDefault();
        const newStatus = document.getElementById('newStatus').value;
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
            alert('Order status updated successfully!');
                showAdminSection('orders');
        } else {
                alert(`Error updating order status: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Network error or server unavailable. Could not update order status.');
        }
    }

    function showAddDiscountForm() {
        const contentDiv = document.getElementById('admin-section-content');
        contentDiv.innerHTML = `
            <h3>Add New Discount Code</h3>
            <form class="admin-form" onsubmit="addNewDiscount(event)">
                <div class="form-group">
                    <label for="newDiscountCode">Discount Code:</label>
                    <input type="text" id="newDiscountCode" required>
                </div>
                <div class="form-group">
                    <label for="newDiscountPercentage">Percentage (%):</label>
                    <input type="number" id="newDiscountPercentage" min="1" max="100" required>
                </div>
                <div class="form-group">
                    <label for="newDiscountDescription">Description:</label>
                    <input type="text" id="newDiscountDescription" required>
                </div>
                <div class="form-group">
                    <label for="newDiscountActive">Active:</label>
                    <input type="checkbox" id="newDiscountActive" checked>
                </div>
                <div class="form-actions">
                    <button type="submit" class="admin-action-btn save-btn">
                        <i class="fas fa-save"></i> Create Discount
                    </button>
                    <button type="button" class="admin-action-btn cancel-btn" onclick="showAdminSection('discounts')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        `;
    }

    async function addNewDiscount(event) {
        event.preventDefault();
        
        const code = document.getElementById('newDiscountCode').value.trim().toUpperCase();
        const percentage = parseInt(document.getElementById('newDiscountPercentage').value);
        const description = document.getElementById('newDiscountDescription').value.trim();
        const active = document.getElementById('newDiscountActive').checked;
        const token = localStorage.getItem('token');

        if (!code || isNaN(percentage) || percentage < 1 || percentage > 100 || !description) {
            alert('Please fill in all fields with valid data. Percentage must be between 1 and 100.');
            return;
        }

        if (!token) {
            alert('Admin not authenticated. Please log in again.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/discounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code, percentage, description, active })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Discount code added successfully!');
                showAdminSection('discounts');
            } else {
                alert(`Error adding discount code: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding discount code:', error);
            alert('Network error or server unavailable. Could not add discount code.');
        }
    }

    function renderOrderSummaryWithDiscount() {
        let totalPrice = 0;
        cartItems.forEach(item => {
            totalPrice += parseFloat(item.price);
        });
        let discountAmount = 0;
        let discountMsg = '';
        const paymentSection = document.getElementById('payment');
        if (paymentSection && paymentSection.style.display === 'block' && appliedDiscount && appliedDiscount.percentage) {
            discountAmount = Math.round(totalPrice * (appliedDiscount.percentage / 100));
            totalPrice -= discountAmount;
            discountMsg = `Discount applied: ${appliedDiscount.percentage}% off (${appliedDiscount.description})`;
        }
        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            let html = '';
            if (cartItems.length === 0) {
                html = '<p>Your cart is empty.</p>';
            } else {
                html = '<h3>Order Summary</h3>';
                cartItems.forEach(item => {
                    const model = models.find(m => m.id === item.modelId);
                    html += `<div class="order-summary-box" style="background: rgba(0,0,0,0.7); border-radius: 12px; padding: 1.5rem; color: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.18); max-width: 600px; margin: 0 auto 2rem auto; position: relative;">
                <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; justify-content: center;">
                        <img src="${model?.image || ''}" alt="${model?.name || ''}" style="max-width: 180px; border-radius: 8px; background: #222;">
                    <div>
                            <h3 style="margin: 0 0 0.5rem 0;">${model?.name || ''}</h3>
                        <ul style="list-style:none; padding:0; margin:0 0 0.5rem 0;">
                                <li><strong>Color:</strong> ${item.color}</li>
                        </ul>
                    </div>
                </div>
                <div style="margin-top: 1.2rem;">
                    <h4 style="margin-bottom: 0.5rem;">Selected Modifications:</h4>
                        ${Object.keys(item.modifications).length > 0 ? `<ul style='list-style:none; padding:0;'>${Object.entries(item.modifications).map(([id, name]) => {
                            const modValue = parseFloat(document.getElementById(id)?.value || 0);
                            return `<li>• ${name} <span style='color: #FFD700;'>+$${modValue.toLocaleString()}</span></li>`;
                        }).join('')}</ul>` : '<span style="color:#aaa;">None</span>'}
                </div>
                <div style="margin-top: 1.2rem; font-size: 1.2em; text-align: right;">
                        <strong>Price: </strong> <span style="color: #FFD700;">$${parseFloat(item.price).toLocaleString()}</span>
                </div>
                    <button onclick="removeFromCartAndRerender(${item.id})" style="position: absolute; top: 1.5rem; right: 1.5rem; background: #c00; color: #fff; border: none; border-radius: 4px; padding: 0.4em 1em; cursor: pointer; font-size: 1em;">Remove</button>
                </div>`;
                });
            }
            html += `<div class='price-breakdown'>`;
            html += `<div class='price-item'><span>Cart Total:</span><span>$${(totalPrice + discountAmount).toLocaleString()}</span></div>`;
            if (discountAmount > 0) {
                html += `<div class='price-item discount'><span>Discount:</span><span>-$${discountAmount.toLocaleString()} (${appliedDiscount.percentage}%)</span></div>`;
            }
            html += `<div class='price-item total'><span>Total to Pay:</span><span>$${totalPrice.toLocaleString()}</span></div>`;
            html += `</div>`;
            if (discountMsg) {
                html += `<div style='color:#4CAF50;margin-top:10px;'>${discountMsg}</div>`;
            }
            orderSummary.innerHTML = html;
        }
    }

    // Helper for payment page remove
    window.removeFromCartAndRerender = function(itemId) {
        removeFromCart(itemId);
        renderOrderSummaryWithDiscount();
    }
    // ... existing code ...

    // Cart Management Functions
    // Utility to get current user ID for cart key
    function getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        return user && user.id ? user.id : null;
    }

    // Update cart button visibility based on login status
    function updateCartButtonVisibility() {
        const cartBtn = document.querySelector('.auth-button.cart-btn');
        if (cartBtn) {
            if (localStorage.getItem('isUserLoggedIn') === 'true') {
                cartBtn.style.display = 'flex';
            } else {
                cartBtn.style.display = 'none';
            }
        }
    }

    // Call this on page load and after login/logout
    updateCartButtonVisibility();

    // Block cart modal for logged-out users
    function showCart() {
        if (localStorage.getItem('isUserLoggedIn') !== 'true') {
            alert('You must be logged in to view your cart.');
            return;
            }
        if (cartModal) {
            cartModal.style.display = 'flex';
            renderCartItems();
            calculateCartTotal();
        }
    }

    // Per-user cart storage
    function getCartKey() {
        const userId = getCurrentUserId();
        return userId ? `cartItems_${userId}` : 'cartItems_guest';
    }

    function saveCartToStorage() {
        localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
                }

    function restoreCartFromStorage() {
        const savedItems = localStorage.getItem(getCartKey());
        cartItems = savedItems ? JSON.parse(savedItems) : [];
                updateCartCount();
        calculateCartTotal();
    }

    // On login, restore user's cart
    function onUserLogin() {
        restoreCartFromStorage();
        updateCartButtonVisibility();
        calculateCartTotal();
    }
    // On logout, clear cart UI but keep in storage
    function onUserLogout() {
        cartItems = [];
        updateCartCount();
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = '0';
            cartCountElement.style.display = 'inline-block';
        }
        // Clear guest cart from localStorage
        localStorage.setItem('cartItems_guest', '[]');
        updateCartButtonVisibility();
        if (cartModal) cartModal.style.display = 'none';
    }

    // Update the signout button click handlers
    if (signoutBtn) {
        signoutBtn.addEventListener('click', () => {
            saveCartToStorage(); // Save cart before logout
            localStorage.removeItem('isAdminLoggedIn'); // Clear login state
            updateAuthDisplay(); // Update display
            // Hide admin dashboard section
            const adminDashboard = document.getElementById('admin-dashboard');
            if (adminDashboard) {
                adminDashboard.style.display = 'none';
            }
            // Hide update info section
            const updateInfo = document.getElementById('update-info');
            if (updateInfo) {
                updateInfo.style.display = 'none';
            }
            // Show home section
            showSection('home');
            alert('Signed out as Admin.');
        });
    }

    if (userSignoutBtn) {
        userSignoutBtn.addEventListener('click', () => {
            saveCartToStorage(); // Save cart before logout
            localStorage.removeItem('isUserLoggedIn'); // Clear login state
            updateAuthDisplay(); // Update display
            // Hide update info section
            const updateInfo = document.getElementById('update-info');
            if (updateInfo) {
                updateInfo.style.display = 'none';
            }
            // Show home section
            showSection('home');
            alert('Signed out as User.');
        });
    }

    // Update the user login success handler
    if (userLoginSubmit) {
        userLoginSubmit.addEventListener('click', async (event) => {
            event.preventDefault();

            const email = userEmailInput.value;
            const password = userPasswordInput.value;
            const userLoginError = document.getElementById('userLoginError');

            userLoginError.textContent = ''; // Clear any previous errors
            console.log('Attempting user login with backend...');

            try {
                const response = await fetch('http://localhost:3001/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Login successful
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    localStorage.setItem('isUserLoggedIn', 'true'); // <-- Add this line
                    updateAuthDisplay();
                    forceMenuRerender();
                    userLoginError.textContent = ''; // Clear any previous error
                    userLoginForm.style.display = 'none'; // Hide user form
                    loginModal.style.display = 'none'; // Hide the login modal
                    
                    // Restore cart after successful login
                    restoreCartFromStorage();
                    console.log('currentUser after login and before processPayment:', JSON.parse(localStorage.getItem('currentUser')));
                    console.log('currentUser.id after login:', JSON.parse(localStorage.getItem('currentUser')).id);
                    // Show home page after login
                    localStorage.setItem('activeSection', 'home');
                    showSection('home');
                } else {
                    userLoginError.textContent = data.message || 'Invalid credentials.';
                }
            } catch (error) {
                console.error('Error during user login:', error);
                userLoginError.textContent = 'Network error or server unavailable. Please try again.';
            }
        });
    }

    // Cart Management
    let cartItems = [];
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCountElement = document.getElementById('cartCount');
    const cartTotalElement = document.getElementById('cartTotal');

    function updateCartCount() {
        const count = cartItems.length;
        if (cartCountElement) {
            cartCountElement.textContent = count;
            cartCountElement.style.display = count > 0 ? 'inline-block' : 'none';
            console.log('Cart count updated to:', count);
        }
    }

    // Unified Add to Cart function
    async function addToCart() {
        const selectedModelId = localStorage.getItem('selectedModel');
        const selectedColor = localStorage.getItem('selectedColor');
        const selectedModifications = JSON.parse(localStorage.getItem('selectedModifications') || '{}');
        const model = models.find(m => m.id === selectedModelId);
        if (!selectedModelId) {
            alert('Please select a model first!');
            showSection('models');
            return;
        }
        if (!model) {
            alert('Selected model not found!');
            return;
        }
        if (model.stock === 0) {
            alert('This model is out of stock and cannot be added to the cart.');
            return;
        }
        // Calculate base price + modifications
        let basePrice = parseFloat(model.price.replace(/[^0-9.]/g, '')) || 0;
        let modsTotal = 0;
        Object.keys(selectedModifications).forEach(id => {
            const modValue = parseFloat(document.getElementById(id)?.value || 0);
            modsTotal += modValue;
        });
        const finalPrice = basePrice + modsTotal;
        const cartItem = {
            id: Date.now(),
            modelId: selectedModelId,
            modelName: model.name,
            color: selectedColor || 'Default',
            modifications: selectedModifications,
            price: finalPrice
        };
        if (localStorage.getItem('isUserLoggedIn') === 'true') {
            // Backend cart
        cartItems.push(cartItem);
            await saveCartToBackend();
            await fetchCartFromBackend();
        } else {
            // Guest cart (localStorage)
            cartItems.push(cartItem);
            saveCartToStorage();
        }
        updateCartCount();
        renderCartItems();
        calculateCartTotal();
        if (cartModal) {
            cartModal.style.display = 'flex';
            cartModal.style.opacity = '1';
            cartModal.style.visibility = 'visible';
            cartModal.style.zIndex = '1000';
        }
    }

    function renderCartItems() {
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cartItems.map(item => {
            const modelImage = models.find(m => m.id === item.modelId)?.image || '';
            const modificationsHtml = Object.entries(item.modifications).map(([id, name]) => {
                const modValue = parseFloat(document.getElementById(id)?.value || 0);
                return `<span class="mod-detail">${name} (+$${modValue.toLocaleString()})</span>`;
            }).join('');

            return `
                <div class="cart-item">
                    <img src="${modelImage}" alt="${item.modelName}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.modelName}</h4>
                        <p>Color: ${item.color}</p>
                        <div class="cart-modifications">
                            ${modificationsHtml}
                        </div>
                        <p class="cart-item-price">$${parseFloat(item.price).toLocaleString()}</p>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
        }).join('');
    }

    function calculateCartTotal() {
        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
        cartTotalElement.textContent = `$${total.toLocaleString()}`;
    }

    // Unified Remove from Cart
    async function removeFromCart(itemId) {
        cartItems = cartItems.filter(item => item.id !== itemId);
        if (localStorage.getItem('isUserLoggedIn') === 'true') {
            await saveCartToBackend();
            await fetchCartFromBackend();
        } else {
            saveCartToStorage();
        }
        updateCartCount();
        renderCartItems();
        calculateCartTotal();
        showCart();
    }

    function proceedToPayment() {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        // Set selected model and price for payment
        const firstCartItem = cartItems[0];
        if (firstCartItem) {
            localStorage.setItem('selectedModel', firstCartItem.modelId);
            // Set the price for the selected model in the customize section
            const finalPriceElement = document.getElementById('finalPrice');
            if (finalPriceElement) {
                finalPriceElement.setAttribute('data-total-price', firstCartItem.price);
            }
        }
        // Save the current cart state
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        // Close the cart modal
        cartModal.style.display = 'none';
        // Navigate to payment section
        showSection('payment');
    }

    // Unified Clear Cart
    async function clearCart() {
        cartItems = [];
        if (localStorage.getItem('isUserLoggedIn') === 'true') {
            await clearCartInBackend();
            await fetchCartFromBackend();
        } else {
            saveCartToStorage();
        }
        updateCartCount();
        renderCartItems();
        calculateCartTotal();
        alert('Your cart has been cleared!');
        showCart();
    }

    // Initialize cart from localStorage on page load
    document.addEventListener('DOMContentLoaded', () => {
        // The cartModal is already declared and hidden globally, no need to re-declare or hide here.

        if (localStorage.getItem('isUserLoggedIn') !== 'true') {
            cartItems = [];
            localStorage.setItem('cartItems_guest', '[]');
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = '0';
                cartCountElement.style.display = 'inline-block';
            }
            calculateCartTotal();
        } else {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            updateCartCount();
                calculateCartTotal();
            }
        }
        // We don't call showCart() here to avoid automatic popup on refresh.
    });

    // PIN Verification Modal Logic
    const pinModal = document.getElementById('pinModal');
    const pinInput = document.getElementById('pinInput');
    const submitPinBtn = document.getElementById('submitPinBtn');
    const resendPinBtn = document.getElementById('resendPinBtn');
    const cancelPinBtn = document.getElementById('cancelPinBtn');
    const pinError = document.getElementById('pinError');
    const pinSuccess = document.getElementById('pinSuccess');
    const closePinModal = document.getElementById('closePinModal');

    let pendingVerificationEmail = null;

    function showPinModal(email) {
        pendingVerificationEmail = email;
        pinInput.value = '';
        pinError.textContent = '';
        pinSuccess.textContent = '';
        pinModal.style.display = 'flex';
    }

    function hidePinModal() {
        pinModal.style.display = 'none';
        pendingVerificationEmail = null;
    }

    if (closePinModal) {
        closePinModal.onclick = hidePinModal;
    }
    if (cancelPinBtn) {
        cancelPinBtn.onclick = hidePinModal;
    }
    if (submitPinBtn) {
        submitPinBtn.onclick = function() {
            pinError.textContent = '';
            pinSuccess.textContent = '';
            const pin = pinInput.value.trim();
            if (!pin || !pendingVerificationEmail) {
                pinError.textContent = 'Please enter the PIN.';
                return;
            }
            fetch('http://localhost:3001/api/auth/verify-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail, pin })
            })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    pinSuccess.textContent = 'Verification successful! Logging you in...';
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    localStorage.setItem('isUserLoggedIn', 'true');
                    localStorage.removeItem('isAdminLoggedIn');
                    updateAuthDisplay();
                    hidePinModal();
                    if (registerModal) registerModal.style.display = 'none';
                    showSection('home'); // Redirect to home page (original behavior)
                    updateAuthDisplay(); // Ensure UI is updated
                    // Optionally, show a welcome message or notification here
                    // No setTimeout or alert, so the UI updates instantly
                } else if (data.message) {
                    pinError.textContent = data.message;
                } else {
                    pinError.textContent = 'Verification failed. Please try again.';
                }
            })
            .catch(() => {
                pinError.textContent = 'Network error. Please try again.';
            });
        };
    }
    if (resendPinBtn) {
        resendPinBtn.onclick = function() {
            pinError.textContent = '';
            pinSuccess.textContent = '';
            if (!pendingVerificationEmail) {
                pinError.textContent = 'No email to resend PIN to.';
                return;
            }
            fetch('http://localhost:3001/api/auth/resend-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail })
            })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    pinSuccess.textContent = data.message;
                } else {
                    pinError.textContent = 'Could not resend PIN. Please try again.';
                }
            })
            .catch(() => {
                pinError.textContent = 'Network error. Please try again.';
            });
        };
    }

    // Render price summary and action buttons
    let priceSummaryDiv = document.querySelector('.price-summary');
    if (priceSummaryDiv) {
        priceSummaryDiv.innerHTML = `
            <button onclick="calculatePrice()" class="action-button"><i class="fas fa-calculator"></i> Calculate Final Price</button>
            <div id="finalPrice" class="final-price"></div>
            <div class="cart-actions">
                <button id="addToCartBtn" class="action-button">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button onclick="showSection('payment')" class="proceed-button"><i class="fas fa-shopping-cart"></i> Proceed to Payment</button>
            </div>
            <div id="addToCartSuccess" style="color: #4CAF50; margin-top: 10px; display: none;">Added to cart!</div>
        `;
        // Attach event handler after rendering
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.onclick = async function() {
                await addToCart();
                const successMsg = document.getElementById('addToCartSuccess');
                if (successMsg) {
                    successMsg.style.display = 'block';
                    setTimeout(() => { successMsg.style.display = 'none'; }, 1500);
                }
            };
        }
    }

    // Helper: get auth token
    function getAuthToken() {
        return localStorage.getItem('token');
    }

    // Fetch cart from backend
    async function fetchCartFromBackend() {
        try {
            const res = await fetch('http://localhost:3001/api/auth/cart', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                cartItems = data.cart || [];
                updateCartCount();
                calculateCartTotal();
            }
        } catch (e) { console.error('Failed to fetch cart from backend', e); }
    }

    // Save cart to backend
    async function saveCartToBackend() {
        try {
            await fetch('http://localhost:3001/api/auth/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ cart: cartItems })
            });
        } catch (e) { console.error('Failed to save cart to backend', e); }
    }

    // Clear cart in backend
    async function clearCartInBackend() {
        try {
            await fetch('http://localhost:3001/api/auth/cart', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
        } catch (e) { console.error('Failed to clear cart in backend', e); }
    }

    // On login, fetch cart from backend
    function onUserLogin() {
        fetchCartFromBackend();
        updateCartButtonVisibility();
        calculateCartTotal();
    }

    // On logout, just clear cart in memory/UI (do not clear backend cart)
    function onUserLogout() {
        cartItems = [];
        updateCartCount();
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = '0';
            cartCountElement.style.display = 'inline-block';
        }
        updateCartButtonVisibility();
        if (cartModal) cartModal.style.display = 'none';
        calculateCartTotal();
    }

    // ... existing code ...
    // Validate token and fetch cart on page load
    async function validateSessionAndFetchCart() {
        if (localStorage.getItem('isUserLoggedIn') === 'true') {
            try {
                // Try to fetch cart with token
                const res = await fetch('http://localhost:3001/api/auth/cart', {
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
                });
                if (res.status === 401 || res.status === 403) {
                    // Token invalid/expired, log out
                    localStorage.removeItem('isUserLoggedIn');
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    onUserLogout();
                    updateAuthDisplay();
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    cartItems = data.cart || [];
                    updateCartCount();
                    calculateCartTotal();
                    updateAuthDisplay();
                }
            } catch (e) {
                // On error, log out
                localStorage.removeItem('isUserLoggedIn');
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                onUserLogout();
                updateAuthDisplay();
            }
        } else {
            cartItems = [];
            updateCartCount();
            calculateCartTotal();
            updateAuthDisplay();
        }
    }

    document.addEventListener('DOMContentLoaded', validateSessionAndFetchCart);
    // or
    document.addEventListener('DOMContentLoaded', checkAuthAndUpdateUI);
    // ... existing code ...

    // On page load, always check login state and user info from backend
    async function checkAuthAndUpdateUI() {
        let isLoggedIn = false;
        let userData = null;
        let cartData = [];
        let token = localStorage.getItem('token');
        if (token) {
            try {
                // Check user info
                const userRes = await fetch('http://localhost:3001/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    userData = await userRes.json();
                    isLoggedIn = true;
                }
                // Fetch cart if logged in
                if (isLoggedIn) {
                    const cartRes = await fetch('http://localhost:3001/api/auth/cart', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (cartRes.ok) {
                        const cartJson = await cartRes.json();
                        cartData = cartJson.cart || [];
                    }
                }
            } catch (e) {
                isLoggedIn = false;
                userData = null;
                cartData = [];
            }
        }
        // Update UI
        if (isLoggedIn && userData) {
            cartItems = cartData;
            updateCartCount();
            calculateCartTotal();
            renderCartItems(); // Always update cart modal if open
            updateAuthDisplayWithUser(userData);
        } else {
            cartItems = [];
            updateCartCount();
            calculateCartTotal();
            renderCartItems();
            updateAuthDisplayWithUser(null);
        }
    }

    // Update UI with backend user info
    function updateAuthDisplayWithUser(user) {
        const adminDashboardMenuItem = document.getElementById('adminDashboardMenuItem');
        const updateInfoMenuItem = document.getElementById('updateInfoMenuItem');
        const adminControls = document.getElementById('adminControls');
        const userControls = document.getElementById('userControls');
        const authButtons = document.getElementById('authButtons');
        const loginBtn = document.querySelector('.auth-button.login-btn');
        const registerBtn = document.querySelector('.auth-button.register-btn');
        const cartBtn = document.querySelector('.auth-button.cart-btn');
        const verifyEmailBtn = document.querySelector('.auth-button.verify-email-btn');
        if (user && user.role === 'admin') {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (cartBtn) cartBtn.style.display = 'flex';
            if (adminControls) {
                adminControls.style.display = 'flex';
                const welcomeMessage = adminControls.querySelector('.welcome-message');
                if (welcomeMessage && user.firstName) {
                    welcomeMessage.textContent = `Welcome, ${user.firstName}!`;
                } else if (welcomeMessage) {
                    welcomeMessage.textContent = 'Welcome, Admin';
                }
            }
            if (userControls) userControls.style.display = 'none';
            if (adminDashboardMenuItem) adminDashboardMenuItem.style.display = 'block';
            if (updateInfoMenuItem) updateInfoMenuItem.style.display = 'block';
            if (verifyEmailBtn) verifyEmailBtn.style.display = 'none';
        } else if (user && user.role === 'user') {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (cartBtn) cartBtn.style.display = 'flex';
            if (adminControls) adminControls.style.display = 'none';
            if (userControls) {
                userControls.style.display = 'flex';
                const welcomeMessage = userControls.querySelector('.welcome-message');
                if (welcomeMessage && currentUser && currentUser.firstName) {
                    welcomeMessage.textContent = `Welcome, ${currentUser.firstName}!`;
                } else if (welcomeMessage) {
                    welcomeMessage.textContent = 'Logged in';
                }
            }
            if (adminDashboardMenuItem) adminDashboardMenuItem.style.display = 'none';
            if (updateInfoMenuItem) updateInfoMenuItem.style.display = 'block';
            if (verifyEmailBtn) verifyEmailBtn.style.display = 'none';
        } else {
            // Guest/default state
            if (loginBtn) loginBtn.style.display = 'flex';
            if (registerBtn) registerBtn.style.display = 'flex';
            if (cartBtn) cartBtn.style.display = 'flex';
            if (adminControls) adminControls.style.display = 'none';
            if (userControls) userControls.style.display = 'none';
            if (adminDashboardMenuItem) adminDashboardMenuItem.style.display = 'none';
            if (updateInfoMenuItem) updateInfoMenuItem.style.display = 'none';
            if (verifyEmailBtn) verifyEmailBtn.style.display = 'flex';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        checkAuthAndUpdateUI();
        // We don't call showCart() here to avoid automatic popup on refresh.
    });

    if (cancelPinBtn) {
        cancelPinBtn.onclick = function() {
            // Remove any user data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isUserLoggedIn');
            // Notify backend to delete unverified user
            if (pendingVerificationEmail) {
                fetch('http://localhost:3001/api/auth/cancel-registration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: pendingVerificationEmail })
                });
            }
            // Hide the PIN modal
            hidePinModal();
            // Redirect to home page as guest
            showSection('home');
            updateAuthDisplay();
        };
    }

    // --- Verify Email Modal Logic ---
    const verifyEmailBtn = document.querySelector('.auth-button.verify-email-btn');
    const verifyEmailModal = document.getElementById('verifyEmailModal');
    const closeVerifyEmailModal = document.getElementById('closeVerifyEmailModal');
    const submitVerifyEmailBtn = document.getElementById('submitVerifyEmailBtn');
    const resendVerifyPinBtn = document.getElementById('resendVerifyPinBtn');
    const cancelVerifyEmailBtn = document.getElementById('cancelVerifyEmailBtn');
    const verifyEmailInput = document.getElementById('verifyEmailInput');
    const verifyPinInput = document.getElementById('verifyPinInput');
    const verifyEmailError = document.getElementById('verifyEmailError');
    const verifyEmailSuccess = document.getElementById('verifyEmailSuccess');

    if (verifyEmailBtn && verifyEmailModal) {
        verifyEmailBtn.addEventListener('click', () => {
            verifyEmailModal.style.display = 'flex';
            verifyEmailInput.value = '';
            verifyPinInput.value = '';
            verifyEmailError.textContent = '';
            verifyEmailSuccess.textContent = '';
        });
    }
    if (closeVerifyEmailModal) {
        closeVerifyEmailModal.onclick = function() {
            verifyEmailModal.style.display = 'none';
        };
    }
    if (cancelVerifyEmailBtn) {
        cancelVerifyEmailBtn.onclick = function() {
            verifyEmailModal.style.display = 'none';
        };
    }
    if (submitVerifyEmailBtn) {
        submitVerifyEmailBtn.onclick = async function() {
            verifyEmailError.textContent = '';
            verifyEmailSuccess.textContent = '';
            const email = verifyEmailInput.value.trim();
            const pin = verifyPinInput.value.trim();
            if (!email || !pin) {
                verifyEmailError.textContent = 'Please enter both email and PIN.';
                return;
            }
            try {
                const res = await fetch('http://localhost:3001/api/auth/verify-pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, pin })
                });
                const data = await res.json();
                if (res.ok && data.token) {
                    verifyEmailSuccess.textContent = 'Verification successful! Logging you in...';
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    localStorage.setItem('isUserLoggedIn', 'true');
                    localStorage.removeItem('isAdminLoggedIn');
                    updateAuthDisplay();
                    setTimeout(() => {
                        verifyEmailModal.style.display = 'none';
                        showSection('home');
                    }, 1000);
                } else {
                    verifyEmailError.textContent = data.message || 'Verification failed. Please try again.';
                }
            } catch (e) {
                verifyEmailError.textContent = 'Network error. Please try again.';
            }
        };
    }
    if (resendVerifyPinBtn) {
        resendVerifyPinBtn.onclick = async function() {
            verifyEmailError.textContent = '';
            verifyEmailSuccess.textContent = '';
            const email = verifyEmailInput.value.trim();
            if (!email) {
                verifyEmailError.textContent = 'Please enter your email to resend PIN.';
                return;
            }
            try {
                const res = await fetch('http://localhost:3001/api/auth/resend-pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: pendingVerificationEmail })
                });
                const data = await res.json();
                if (res.ok && data.message) {
                    verifyEmailSuccess.textContent = data.message;
                } else {
                    verifyEmailError.textContent = data.message || 'Could not resend PIN. Please try again.';
                }
            } catch (e) {
                verifyEmailError.textContent = 'Network error. Please try again.';
            }
        };
    }

    // Forgot Password Logic
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
    const sendForgotPinBtn = document.getElementById('sendForgotPinBtn');
    const verifyForgotPinBtn = document.getElementById('verifyForgotPinBtn');
    const changeForgotPasswordBtn = document.getElementById('changeForgotPasswordBtn');
    const forgotStepEmail = document.getElementById('forgotStepEmail');
    const forgotStepPin = document.getElementById('forgotStepPin');
    const forgotStepNewPassword = document.getElementById('forgotStepNewPassword');
    const forgotEmailInput = document.getElementById('forgotEmailInput');
    const forgotPinInput = document.getElementById('forgotPinInput');
    const forgotNewPassword = document.getElementById('forgotNewPassword');
    const forgotConfirmPassword = document.getElementById('forgotConfirmPassword');
    const forgotPasswordError = document.getElementById('forgotPasswordError');
    const forgotPasswordSuccess = document.getElementById('forgotPasswordSuccess');
    let forgotEmail = '';
    let forgotPin = '';
    if (forgotPasswordLink) {
      forgotPasswordLink.onclick = () => {
        forgotPasswordModal.style.display = 'flex';
        forgotStepEmail.style.display = '';
        forgotStepPin.style.display = 'none';
        forgotStepNewPassword.style.display = 'none';
        forgotPasswordError.textContent = '';
        forgotPasswordSuccess.textContent = '';
        forgotEmailInput.value = '';
        forgotPinInput.value = '';
        forgotNewPassword.value = '';
        forgotConfirmPassword.value = '';
      };
    }
    if (closeForgotPasswordModal) {
      closeForgotPasswordModal.onclick = () => {
        forgotPasswordModal.style.display = 'none';
      };
    }
    if (sendForgotPinBtn) {
      sendForgotPinBtn.onclick = async () => {
        const email = forgotEmailInput.value.trim();
        if (!email) {
          forgotPasswordError.textContent = 'Please enter your email.';
          return;
        }
        forgotPasswordError.textContent = '';
        forgotPasswordSuccess.textContent = '';
        try {
          const res = await fetch('http://localhost:3001/api/auth/send-reset-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (!res.ok) {
            forgotPasswordError.textContent = data.message || 'Failed to send PIN.';
            return;
          }
          forgotEmail = email;
          forgotStepEmail.style.display = 'none';
          forgotStepPin.style.display = '';
          forgotStepNewPassword.style.display = 'none';
          forgotPasswordSuccess.textContent = 'PIN sent to your email.';
        } catch (err) {
          forgotPasswordError.textContent = 'Network error.';
        }
      };
    }
    if (verifyForgotPinBtn) {
      verifyForgotPinBtn.onclick = async () => {
        const pin = forgotPinInput.value.trim();
        if (!pin) {
          forgotPasswordError.textContent = 'Please enter the PIN.';
          return;
        }
        forgotPasswordError.textContent = '';
        forgotPasswordSuccess.textContent = '';
        try {
          const res = await fetch('http://localhost:3001/api/auth/verify-reset-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: forgotEmail, pin })
          });
          const data = await res.json();
          if (!res.ok) {
            forgotPasswordError.textContent = data.message || 'Invalid or expired PIN.';
            return;
          }
          forgotPin = pin;
          forgotStepEmail.style.display = 'none';
          forgotStepPin.style.display = 'none';
          forgotStepNewPassword.style.display = '';
          forgotPasswordSuccess.textContent = 'PIN verified. Enter your new password.';
        } catch (err) {
          forgotPasswordError.textContent = 'Network error.';
        }
      };
    }
    if (changeForgotPasswordBtn) {
      changeForgotPasswordBtn.onclick = async () => {
        const newPassword = forgotNewPassword.value.trim();
        const confirmPassword = forgotConfirmPassword.value.trim();
        if (!newPassword || !confirmPassword) {
          forgotPasswordError.textContent = 'Please fill in both password fields.';
          return;
        }
        if (newPassword !== confirmPassword) {
          forgotPasswordError.textContent = 'Passwords do not match.';
          return;
        }
        if (newPassword.length < 6) {
          forgotPasswordError.textContent = 'Password must be at least 6 characters.';
          return;
        }
        forgotPasswordError.textContent = '';
        forgotPasswordSuccess.textContent = '';
        try {
          const res = await fetch('http://localhost:3001/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: forgotEmail, pin: forgotPin, newPassword })
          });
          const data = await res.json();
          if (!res.ok) {
            forgotPasswordError.textContent = data.message || 'Failed to change password.';
            return;
          }
          forgotPasswordSuccess.textContent = 'Password changed successfully! You can now log in.';
          setTimeout(() => { forgotPasswordModal.style.display = 'none'; }, 1500);
        } catch (err) {
          forgotPasswordError.textContent = 'Network error.';
        }
      };
    }

    // Reset appliedDiscount after payment or when leaving payment section
    function resetDiscountAfterPayment() {
        appliedDiscount = null;
        const codeInput = document.getElementById('discountCodeInput');
        if (codeInput) codeInput.value = '';
        const messageDiv = document.getElementById('discountCodeMessage');
        if (messageDiv) messageDiv.textContent = '';
    }
    // Call resetDiscountAfterPayment after successful payment or when navigating away from payment section

    // --- Purchase PIN Modal Logic ---
    let currentOrderIdForPin = null;

    async function showPurchasePinModal(orderId) {
        currentOrderIdForPin = orderId;
        document.getElementById('purchasePinInput').value = '';
        document.getElementById('purchasePinMessage').textContent = '';
        document.getElementById('purchasePinModal').style.display = 'flex';
    }

    function hidePurchasePinModal() {
        document.getElementById('purchasePinModal').style.display = 'none';
        currentOrderIdForPin = null;
    }

    document.getElementById('closePurchasePinModal').onclick = hidePurchasePinModal;
    document.getElementById('purchasePinModal').onclick = function(e) {
        if (e.target === this) hidePurchasePinModal();
    };

    function showOrderSummary(orderData) {
        let html = '<div style="display:flex;align-items:center;justify-content:space-between;"><h2 style=\"color:#4CAF50;margin:0;\">ORDER CONFIRMED!</h2>' +
            '<span id="closeOrderSummaryModal" style="font-size:2em;cursor:pointer;color:#fff;margin-left:1em;">&times;</span></div>';
        html += '<p>Thank you for your purchase. Here is your order summary:</p>';
        orderData.items.forEach((item, idx) => {
            const model = models.find(m => m.id === item.modelId);
            let mods = item.modifications && Object.values(item.modifications).length
                ? Object.values(item.modifications).join(', ')
                : 'None';
            html += `<div style=\"margin-bottom:1em;display:flex;align-items:center;gap:1.5em;\">\n            <img src=\"${model?.image || ''}\" alt=\"${item.modelName}\" style=\"width:120px;height:auto;border-radius:8px;background:#222;\">\n            <div>\n                <strong>Car #${idx + 1}:</strong><br>\n                Model: ${item.modelName}<br>\n                Color: ${item.color}<br>\n                Modifications: ${mods}<br>\n                Price: $${Number(item.price).toLocaleString()}\n            </div>\n        </div>`;
        });
        html += `<h3>Total Paid: $${orderData.discountedTotal ? Number(orderData.discountedTotal).toLocaleString() : Number(orderData.totalAmount).toLocaleString()}</h3>`;
        if (orderData.discount && orderData.discount.percentage) {
            html += `<p>Discount applied: -${orderData.discount.percentage}% (${orderData.discount.description})</p>`;
        }
        html += `<p style=\"margin-top:1.5em;\">We will contact you soon to confirm your order and arrange delivery. If you have any questions, please contact us.</p>`;
        document.getElementById('orderSummaryModalContent').innerHTML = html;
        document.getElementById('orderSummaryModal').style.display = 'flex';
        // Add close handler
        document.getElementById('closeOrderSummaryModal').onclick = function() {
            document.getElementById('orderSummaryModal').style.display = 'none';
        };
    }

    document.getElementById('confirmPurchasePinBtn').onclick = async function() {
        const pin = document.getElementById('purchasePinInput').value.trim();
        const msg = document.getElementById('purchasePinMessage');
        if (!pin || pin.length !== 6) {
            msg.textContent = 'Please enter the 6-digit PIN.';
            return;
        }
        msg.textContent = 'Verifying...';
        try {
            const res = await fetch('http://localhost:3001/api/orders/verify-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ...pendingOrderData, pin })
            });
            const data = await res.json();
            if (res.ok) {
                msg.style.color = '#4CAF50';
                msg.textContent = 'Order confirmed!';
                setTimeout(() => {
                    hidePurchasePinModal();
                    showOrderSummary({ ...pendingOrderData, discountedTotal: data.discountedTotal });
                    clearCart();
                    showSection('home');
                    fetchModels(); // Update frontend stock after purchase
                }, 1200);
            } else {
                msg.style.color = '#d5001c';
                msg.textContent = data.message || 'Invalid or expired PIN.';
            }
        } catch (err) {
            msg.style.color = '#d5001c';
            msg.textContent = 'Network error.';
        }
    };

    document.getElementById('resendPurchasePinBtn').onclick = async function() {
        const msg = document.getElementById('purchasePinMessage');
        msg.textContent = 'Resending PIN...';
        const token = localStorage.getItem('token');
        console.log('Token before resend PIN:', token);
        if (!token) {
            msg.style.color = '#d5001c';
            msg.textContent = 'You are not authenticated. Please log in again.';
            return;
        }
        try {
            const res = await fetch('http://localhost:3001/api/orders/request-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId: currentOrderIdForPin })
            });
            const data = await res.json();
            if (res.ok) {
                msg.style.color = '#4CAF50';
                msg.textContent = 'A new PIN has been sent to your email.';
            } else {
                msg.style.color = '#d5001c';
                msg.textContent = data.message || 'Failed to resend PIN.';
            }
        } catch (err) {
            msg.style.color = '#d5001c';
            msg.textContent = 'Network error.';
        }
    };

    // --- Update processPayment to use PIN confirmation ---
    async function processPayment(event) {
        event.preventDefault();
        console.log('processPayment called!');
        // Check if the user is logged in (either admin or regular user)
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        const isUserLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('currentUser at start of processPayment:', currentUser);
        if (!models || models.length === 0) {
            alert('Error: Product information not loaded. Please try again later.');
            return false;
        }
        if (!isAdminLoggedIn && !isUserLoggedIn) {
            alert('You must be logged in to make a purchase!');
            return false;
        }
        const form = event.target;
        const paymentType = form.closest('.payment-form-section').getAttribute('data-payment');
        const paymentStatus = document.getElementById('paymentStatus');
        paymentStatus.innerHTML = '';
        paymentStatus.className = 'payment-status';
        let isValid = true;
        const errors = [];
        // --- RELAXED VALIDATION FOR DEMO ---
        if (paymentType === 'card') {
            const cardNumber = form.querySelector('#cardNumber').value.replace(/\s/g, '');
            const expiry = form.querySelector('#expiryDate').value;
            const cvv = form.querySelector('#cvv').value;
            if (!/^\d{12,19}$/.test(cardNumber)) {
                errors.push('Card number must be 12-19 digits');
                isValid = false;
            }
            if (!/^\d{2}\/\d{2}$/.test(expiry)) {
                errors.push('Expiry must be MM/YY');
                isValid = false;
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                errors.push('CVV must be 3 or 4 digits');
                isValid = false;
            }
        } else if (paymentType === 'paypal') {
            const email = form.querySelector('#paypalEmail').value;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.push('Invalid PayPal email');
                isValid = false;
            }
        }
        if (!isValid) {
            paymentStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors.join(', ')}`;
            paymentStatus.classList.add('error');
            console.log('Validation failed:', errors);
            return false;
        }
        console.log('Validation passed, proceeding to fetch...');
        try {
            const selectedModelId = localStorage.getItem("selectedModel");
            if (!selectedModelId) {
                alert('Please select a model before paying!');
                return false;
            }
            const finalPriceElement = document.getElementById("finalPrice");
            const totalAmount = parseFloat(finalPriceElement ? finalPriceElement.getAttribute('data-total-price') : '0');
            if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
                alert('Please calculate the final price before paying!');
                return false;
            }
            const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUserData || !currentUserData.id || !currentUserData.email) {
                alert('User information is incomplete. Please log in again or update your profile.');
                paymentStatus.innerHTML = '';
                return false;
            }
            const orderData = {
                user: currentUserData.id,
                items: cartItems.map(item => ({
                    modelId: item.modelId,
                    modelName: item.modelName,
                    color: item.color,
                    modifications: item.modifications,
                    price: item.price
                })),
                totalAmount: cartItems.reduce((sum, item) => sum + Number(item.price), 0),
                discount: appliedDiscount ? { percentage: appliedDiscount.percentage, code: appliedDiscount.code, description: appliedDiscount.description } : null,
                status: 'Pending'
            };
            pendingOrderData = orderData;
            try {
                const response = await fetch('http://localhost:3001/api/orders/request-pin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(orderData)
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    showPurchasePinModal();
                } else {
                    alert(data.message || 'Failed to send confirmation PIN.');
                }
            } catch (error) {
                alert('Network error or server unavailable. Could not send confirmation PIN.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            paymentStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error or server unavailable. Could not place order.';
            paymentStatus.classList.add('error');
            alert('Network error or server unavailable. Could not place order.');
        }
        return false;
    }

    //alert('processPayment called!');

    // ... existing code ...
    function showOrderHistory() {
        const section = document.getElementById('order-history');
        const content = document.getElementById('orderHistoryContent');
        section.style.display = 'block';
        // Hide other sections
        document.querySelectorAll('.section').forEach(sec => {
            if (sec.id !== 'order-history') sec.style.display = 'none';
        });
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.email) {
            content.innerHTML = '<p>Please log in to view your order history.</p>';
            return;
        }
        // Fetch orders for this user (from backend or localStorage)
        fetch(`http://localhost:3001/api/orders/user/${encodeURIComponent(currentUser.email)}`)
            .then(res => res.json())
            .then(orders => {
                if (!orders || orders.length === 0) {
                    content.innerHTML = '<p>Start your first order now: <a href="#models" onclick="showSection(\'models\')">Select Model</a></p>';
                    return;
                }
                let html = '<table class="order-history-table" style="width:100%;border-collapse:collapse;margin-top:2em;">'
    + '<thead><tr>'
    + '<th style="padding:10px 8px;text-align:left;">Date</th>'
    + '<th style="padding:10px 8px;text-align:left;">Image</th>'
    + '<th style="padding:10px 8px;text-align:left;">Model</th>'
    + '<th style="padding:10px 8px;text-align:left;">Color</th>'
    + '<th style="padding:10px 8px;text-align:left;">Mods</th>'
    + '<th style="padding:10px 8px;text-align:left;">Total</th>'
    + '<th style="padding:10px 8px;text-align:left;">Status</th>'
    + '</tr></thead><tbody>';
orders.forEach(order => {
    const item = order.items && order.items[0] ? order.items[0] : {};
    const mods = item.modifications
        ? Object.values(item.modifications).join(', ')
        : '';
    // Try to get the model image from the models array
    let modelImage = '';
    if (window.models && Array.isArray(window.models)) {
        const modelObj = window.models.find(m => m.name === item.modelName);
        if (modelObj && modelObj.image) modelImage = modelObj.image;
    }
    html += `<tr>
        <td style="padding:10px 8px;vertical-align:middle;">${new Date(order.createdAt).toLocaleDateString()}</td>
        <td style="padding:10px 8px;vertical-align:middle;">
            ${modelImage ? `<img src="${modelImage}" alt="${item.modelName}" style="width:80px;height:auto;border-radius:8px;box-shadow:0 2px 8px #0002;">` : ''}
        </td>
        <td style="padding:10px 8px;vertical-align:middle;">${item.modelName || ''}</td>
        <td style="padding:10px 8px;vertical-align:middle;">${item.color || ''}</td>
        <td style="padding:10px 8px;vertical-align:middle;">${mods}</td>
        <td style="padding:10px 8px;vertical-align:middle;">$${order.totalAmount ? order.totalAmount.toLocaleString() : ''}</td>
        <td style="padding:10px 8px;vertical-align:middle;">${order.status}</td>
    </tr>`;
});
html += '</tbody></table>';
                content.innerHTML = html;
            })
            .catch(() => {
                content.innerHTML = '<p>Could not load order history. Please try again later.</p>';
            });
    }
    // Show menu item for logged-in users
    function updateOrderHistoryMenuVisibility() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const menuItem = document.getElementById('orderHistoryMenuItem');
        if (!menuItem) return;
        // Only show for regular users (not admins)
        if (currentUser && !currentUser.isAdmin && currentUser.email) {
            menuItem.style.display = '';
        } else {
            menuItem.style.display = 'none';
        }
    }
    // ... existing code ...
    // Ensure this is called on login/logout and DOMContentLoaded
    window.addEventListener('DOMContentLoaded', updateOrderHistoryMenuVisibility);
    // ... existing code ...
    function onUserLogin() {
        // ... existing code ...
        updateOrderHistoryMenuVisibility();
    }
    function onUserLogout() {
        // ... existing code ...
        updateOrderHistoryMenuVisibility();
    }
    // ... existing code ...
    // Remove or update showOrderHistoryMenuItemIfLoggedIn if redundant

    // ... existing code ...
    // Call updateOrderHistoryMenuVisibility on page load and after login/logout
    window.addEventListener('DOMContentLoaded', updateOrderHistoryMenuVisibility);
    // ... existing code ...
    function onUserLogin() {
        // ... existing code ...
        updateOrderHistoryMenuVisibility();
    }
    function onUserLogout() {
        // ... existing code ...
        updateOrderHistoryMenuVisibility();
    }
    // ... existing code ...
    window.toggleMenu = toggleMenu;
    window.models = models;

    // ... existing code ...
    function showOrderHistoryMenuItemIfLoggedIn() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const orderHistoryMenuItem = document.getElementById('orderHistoryMenuItem');
        // Hide for admin users
        if (currentUser && (currentUser.isAdmin || currentUser.role === 'admin')) {
            orderHistoryMenuItem.style.display = 'none';
            return;
        }
        if (currentUser && currentUser.email) {
            orderHistoryMenuItem.style.display = '';
        } else {
            orderHistoryMenuItem.style.display = 'none';
        }
    }

    // Call this on page load
    window.addEventListener('DOMContentLoaded', showOrderHistoryMenuItemIfLoggedIn);

    // ... existing code ...
    // Add this helper function near the top or after updateAuthDisplay
    function forceMenuRerender() {
        const menu = document.getElementById('menu');
        if (menu) {
            menu.style.display = 'none';
            // Force reflow
            void menu.offsetWidth;
            menu.style.display = '';
        }
    }
    // ... existing code ...
    // In every login/logout handler (user and admin), after updateAuthDisplay(), add:
    // forceMenuRerender();
    // Example for user login:
    // updateAuthDisplay();
    // forceMenuRerender();
    // ... existing code ...