// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  // Add initial animation styles
  const animatedElements = document.querySelectorAll(
    ".feature-item, .vendor-card, .supplier-card"
  );
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  // Counter animation for stats
  const counters = document.querySelectorAll(".stat-number");
  const animateCounter = (counter) => {
    const target = parseInt(counter.textContent.replace(/[^\d]/g, ""));
    const increment = target / 100;
    let current = 0;

    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.textContent = Math.ceil(current).toLocaleString() + "+";
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString() + "+";
      }
    };

    updateCounter();
  };

  // Trigger counter animation when stats section is visible
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach((counter) => animateCounter(counter));
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsSection = document.querySelector(".hero-stats");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});

// Add navbar background on scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "none";
  }
});

// Button click handlers
document.addEventListener("DOMContentLoaded", () => {
  // Start Selling button
  const startSellingBtn = document.querySelector(".hero-buttons .btn-primary");
  if (startSellingBtn) {
    startSellingBtn.addEventListener("click", () => {
      // Add your vendor registration logic here
      console.log("Redirecting to vendor registration...");
      // window.location.href = '/vendor-signup';
    });
  }

  // Become a Supplier button
  const supplierBtn = document.querySelector(".hero-buttons .btn-secondary");
  if (supplierBtn) {
    supplierBtn.addEventListener("click", () => {
      // Add your supplier registration logic here
      console.log("Redirecting to supplier registration...");
      // window.location.href = '/supplier-signup';
    });
  }

  // Navigation buttons
  const navGetStarted = document.querySelector(".nav-menu .btn-primary");
  const navLogin = document.querySelector(".nav-menu .btn-secondary");

  if (navGetStarted) {
    navGetStarted.addEventListener("click", () => {
      console.log("Redirecting to registration...");
      // window.location.href = '/signup';
    });
  }

  if (navLogin) {
    navLogin.addEventListener("click", () => {
      console.log("Redirecting to login...");
      // window.location.href = '/login';
    });
  }
});

// Add CSS for mobile menu animation
const style = document.createElement("style");
style.textContent = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 20px 0;
        }

        .nav-menu.active {
            left: 0;
        }

        .nav-menu a, .nav-menu button {
            margin: 10px 0;
        }

        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active span:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }

        .hamburger.active span:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;
document.head.appendChild(style);
