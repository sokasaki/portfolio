document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle?.querySelector(".theme-icon");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const body = document.body;
  const contactEmail = "";

  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  body.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (themeIcon) {
      themeIcon.className =
        theme === "light" ? "fas fa-moon theme-icon" : "fas fa-sun theme-icon";
    }
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("open") || false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation",
    );
    menuToggle.innerHTML = isOpen
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  // Intersection Observer for Scroll Reveals
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Once visible, stop observing
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections and videos
  document.querySelectorAll("section").forEach((section) => {
    observer.observe(section);
  });

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Browser might block autoplay without interaction
          });
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.5 },
  );

  document.querySelectorAll(".video-container video").forEach((video) => {
    videoObserver.observe(video);
  });

  // Gallery Preview
  const previewModal = document.createElement("div");
  previewModal.className = "preview-modal";
  previewModal.setAttribute("role", "dialog");
  previewModal.setAttribute("aria-modal", "true");
  previewModal.setAttribute("aria-hidden", "true");
  previewModal.innerHTML = `
    <div class="preview-dialog" role="document">
      <div class="preview-header">
        <div>
          <span class="preview-title"></span>
          <small class="preview-meta"></small>
        </div>
        <button class="preview-close" type="button" aria-label="Close preview">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="preview-media"></div>
    </div>
  `;
  document.body.appendChild(previewModal);

  const previewTitle = previewModal.querySelector(".preview-title");
  const previewMeta = previewModal.querySelector(".preview-meta");
  const previewMedia = previewModal.querySelector(".preview-media");
  const previewClose = previewModal.querySelector(".preview-close");

  document.querySelectorAll(".media-container").forEach((container) => {
    const videoSrc = container.dataset.videoSrc;
    const image = container.querySelector("img");
    const video = container.querySelector("video");
    const source = image || video;
    if (!source && !videoSrc) return;

    const title =
      container.querySelector(".media-caption span")?.textContent.trim() ||
      container.querySelector(".video-overlay span")?.textContent.trim() ||
      source?.alt ||
      "Portfolio preview";
    const meta =
      container.querySelector(".media-caption small")?.textContent.trim() ||
      (video || videoSrc ? "Motion Design" : "Static Design");
    const previewData = {
      type: video || videoSrc ? "video" : "image",
      src: videoSrc || source.getAttribute("src"),
      title,
      meta,
      alt: image?.alt || title,
    };

    const viewButton = document.createElement("button");
    viewButton.className = "media-view-button";
    viewButton.type = "button";
    viewButton.innerHTML = '<i class="fas fa-expand"></i><span>View</span>';
    viewButton.setAttribute("aria-label", `View ${title}`);
    container.appendChild(viewButton);

    container.setAttribute("tabindex", "0");
    container.setAttribute("role", "button");
    container.setAttribute("aria-label", `View ${title}`);

    container.addEventListener("click", () => openPreview(previewData));
    container.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPreview(previewData);
      }
    });

    viewButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openPreview(previewData);
    });
  });

  function openPreview({ type, src, title, meta, alt }) {
    if (!previewMedia || !src) return;

    previewMedia.innerHTML = "";
    const media = document.createElement(type === "video" ? "video" : "img");
    media.src = src;

    if (type === "video") {
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
    } else {
      media.alt = alt;
    }

    previewMedia.appendChild(media);

    if (previewTitle) previewTitle.textContent = title;
    if (previewMeta) previewMeta.textContent = meta;

    previewModal.classList.add("open");
    previewModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    previewClose?.focus();
  }

  function closePreview() {
    previewModal.classList.remove("open");
    previewModal.setAttribute("aria-hidden", "true");
    previewMedia.innerHTML = "";
    document.body.style.overflow = "";
  }

  previewClose?.addEventListener("click", closePreview);

  previewModal.addEventListener("click", (event) => {
    if (event.target === previewModal) {
      closePreview();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && previewModal.classList.contains("open")) {
      closePreview();
    }
  });

  // Form Handling
  const contactForm = document.querySelector("#contact-form");
  const responseText = document.querySelector("#form-response");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#name")?.value.trim();
    const email = document.querySelector("#email")?.value.trim();
    const message = document.querySelector("#message")?.value.trim() || "";

    if (!name || !email) {
      showResponse("Please enter your name and email.", "error");
      return;
    }

    if (!contactEmail) {
      showResponse(
        "Add your contact email in js/main.js to activate this form.",
        "error",
      );
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    showResponse("Opening your email app with the message ready.", "success");
    contactForm.reset();
  });

  function showResponse(message, type) {
    if (!responseText) return;

    responseText.textContent = message;
    responseText.style.opacity = "1";
    responseText.style.color = type === "success" ? "var(--accent)" : "#ef4444";

    setTimeout(() => {
      responseText.style.opacity = "0";
    }, 5000);
  }

  // Smooth Scroll for Navigation Links (if any)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        navLinks?.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Open navigation");
        if (menuToggle) {
          menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }

        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Mouse Move Effect for Cards (Optional Glass Effect)
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
});
