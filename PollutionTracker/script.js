
// ==========================================
// POLLUTION TRACKER - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = this.getAttribute("href");
            const target = targetId && targetId !== "#"
                ? document.querySelector(targetId)
                : null;

            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Explore feature links
    document.querySelectorAll(".explore-features").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const features = document.querySelector("#features") ||
                document.querySelector(".features-section");

            if (features) {
                features.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", function () {
        if (navbar) {
            navbar.classList.toggle("scrolled", window.scrollY > 50);
        }
    });

    // Reveal sections while scrolling
    if ("IntersectionObserver" in window) {
        const sections = document.querySelectorAll(
            ".feature-card, .mini-card, .about-section"
        );

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        }, { threshold: 0.15 });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    // Mobile navigation
    const menuButton = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });

        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("active");
            });
        });
    }

    // Button hover effect
    document.querySelectorAll(
        ".nav-button, .primary-button, .secondary-button, button"
    ).forEach(function (button) {
        button.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-2px)";
        });

        button.addEventListener("mouseleave", function () {
            this.style.transform = "";
        });
    });

    // Sign-up and login form
    const popup = document.getElementById("signupModal");
    const form = document.getElementById("signupForm");

    if (form && popup) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const nameField = popup.querySelector("#signupNameField");
            const nameInput = popup.querySelector("#authName");
            const emailInput = popup.querySelector("#authEmail");
            const passwordInput = popup.querySelector("#authPassword");
            const message = popup.querySelector("#signupMessage");

            const isSignup = nameField
                ? !nameField.hidden
                : nameInput.required;

            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            if (isSignup && !name) {
                message.textContent = "Please enter your full name.";
                return;
            }

            if (!emailInput.checkValidity()) {
                message.textContent = "Please enter a valid email address.";
                return;
            }

            if (password.length < 6) {
                message.textContent =
                    "Password must contain at least 6 characters.";
                return;
            }

            let users = [];

            try {
                users = JSON.parse(
                    localStorage.getItem("pollutionTrackerUsers") || "[]"
                );

                if (!Array.isArray(users)) users = [];
            } catch (error) {
                users = [];
            }

            if (isSignup) {
                const existingUser = users.find(function (user) {
                    return user.email === email;
                });

                if (existingUser) {
                    message.textContent =
                        "This email is already registered. Please log in.";
                    return;
                }

                users.push({
                    name: name,
                    email: email,
                    password: password
                });

                try {
                    localStorage.setItem(
                        "pollutionTrackerUsers",
                        JSON.stringify(users)
                    );
                } catch (error) {
                    message.textContent =
                        "Unable to save your account in this browser.";
                    return;
                }

                // Switch to login after successful registration
                switchAuth("login");

                popup.querySelector("#authEmail").value = email;
                popup.querySelector("#authMessage").textContent =
                    "Account created successfully! Please log in.";

                return;
            }

            // Login: check the account created in this browser
            const matchedUser = users.find(function (user) {
                return user.email === email &&
                    user.password === password;
            });

            if (!matchedUser) {
                message.textContent =
                    "Incorrect email or password. Please sign up first if you don't have an account.";
                return;
            }

            // Store the signed-in user for the dashboard
            try {
                sessionStorage.setItem(
                    "pollutionTrackerLoggedIn",
                    JSON.stringify({
                        name: matchedUser.name,
                        email: matchedUser.email
                    })
                );
            } catch (error) {
                message.textContent =
                    "Your browser could not start the login session.";
                return;
            }

            message.textContent = "Login successful! Opening dashboard...";

            window.location.href = "dashboard.html";
        });
    }

    // Close the popup by clicking outside its card
    document.querySelectorAll(".modal").forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    });
});


// ==========================================
// OPEN SIGN-UP POPUP
// ==========================================

function showSignup(event) {
    if (event) event.preventDefault();

    const popup = document.getElementById("signupModal");

    if (popup) {
        switchAuth("signup");
        popup.style.display = "flex";
        popup.classList.add("active");
        popup.setAttribute("aria-hidden", "false");
    }
}


// ==========================================
// OPEN LOGIN POPUP
// ==========================================

function showLogin(event) {
    if (event) event.preventDefault();

    const popup = document.getElementById("signupModal");

    if (popup) {
        switchAuth("login");
        popup.style.display = "flex";
        popup.classList.add("active");
        popup.setAttribute("aria-hidden", "false");
    }
}


// ==========================================
// SWITCH BETWEEN SIGN-UP AND LOGIN
// ==========================================

function switchAuth(mode) {
    const popup = document.getElementById("signupModal");
    if (!popup) return;

    const isSignup = mode === "signup";

    const title = popup.querySelector("#authTitle");
    const subtitle = popup.querySelector("#authSubtitle");
    const nameField = popup.querySelector("#signupNameField");
    const nameInput = popup.querySelector("#authName");
    const passwordInput = popup.querySelector("#authPassword");
    const submitButton = popup.querySelector("#authSubmit");
    const signupTab = popup.querySelector("#signupTab");
    const loginTab = popup.querySelector("#loginTab");
    const message = popup.querySelector("#signupMessage");

    // Update popup heading
    if (title) {
        title.textContent = isSignup
            ? "Join Pollution Tracker"
            : "Welcome Back!";
    }

    if (subtitle) {
        subtitle.textContent = isSignup
            ? "Create an account for a cleaner future."
            : "Log in to continue your journey.";
    }

    // Show or hide name field
    if (nameField) {
        nameField.hidden = !isSignup;
        nameField.style.display = isSignup ? "" : "none";
    }

    if (nameInput) {
        nameInput.required = isSignup;
    }

    // Update submit button
    if (submitButton) {
        submitButton.textContent = isSignup
            ? "Create Account →"
            : "Login →";
    }

    // FIX: Move the active green highlight to the selected tab
    if (signupTab) {
        signupTab.classList.toggle("active", isSignup);
        signupTab.setAttribute("aria-pressed", String(isSignup));
    }

    if (loginTab) {
        loginTab.classList.toggle("active", !isSignup);
        loginTab.setAttribute("aria-pressed", String(!isSignup));
    }

    if (passwordInput) {
        passwordInput.value = "";
        passwordInput.autocomplete = isSignup
            ? "new-password"
            : "current-password";
    }

    // Clear previous message
    if (message) {
        message.textContent = "";
    }
}


// ==========================================
// CLOSE AUTH POPUP
// ==========================================

function closeModal() {
    ["signupModal", "authModal"].forEach(function (id) {
        const modal = document.getElementById(id);

        if (modal) {
            modal.classList.remove("active");
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
        }
    });
}


// Close popup with Escape
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal();
    }
});


// Toggle the mobile menu
function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");

    if (navLinks) {
        navLinks.classList.toggle("active");
    }
}
