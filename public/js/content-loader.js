import { supabase } from '../lib/supabase.js';

// Load and apply site content from database
export async function loadSiteContent() {
    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .single();

        if (error) {
            console.log('No custom content found, using defaults');
            // Still call these to apply hardcoded fallbacks
            updateWhyChooseUs({});
            updateStatsSection({});
            return;
        }

        if (data && data.content) {
            const content = data.content;

            // Apply SEO Meta Tags
            if (content.seo) updateMetaTags(content.seo);

            // Apply Hero Section
            if (content.hero) updateHeroSection(content.hero);

            // Apply About Section
            if (content.about) updateAboutSection(content.about);

            // Apply Contact Information
            if (content.contact) updateContactSection(content.contact);

            // Apply Social Media Links
            if (content.social) updateSocialLinks(content.social);

            // Apply Branding (Logo)
            if (content.branding && content.branding.logoUrl) updateLogo(content.branding.logoUrl);

            // Apply Footer
            if (content.footer) updateFooter(content.footer);

            // Apply Homepage Specific Sections
            updateWhyChooseUs(content.whyChooseUs || {});
            updateStatsSection(content.stats || {});

            if (content.newsletter) {
                updateNewsletterSection(content.newsletter);
            }

            // Apply new dynamic sections
            if (content.himalayanSlider) {
                updateHimalayanSlider(content.himalayanSlider);
            }
            if (content.categories) {
                updateCategories(content.categories);
            }
            if (content.testimonials) {
                updateTestimonials(content.testimonials);
            }
            if (content.blogStories) {
                updateBlogStories(content.blogStories);
            }
        }
    } catch (error) {
        console.error('Error loading site content:', error);
    }
}

function updateMetaTags(seo) {
    if (seo.metaTitle) {
        document.title = seo.metaTitle;
        updateMetaTag('og:title', seo.metaTitle);
        updateMetaTag('twitter:title', seo.metaTitle);
    }

    if (seo.metaDescription) {
        updateMetaTag('description', seo.metaDescription, 'name');
        updateMetaTag('og:description', seo.metaDescription);
        updateMetaTag('twitter:description', seo.metaDescription);
    }

    if (seo.keywords) {
        updateMetaTag('keywords', seo.keywords, 'name');
    }
}

function updateMetaTag(property, content, attribute = 'property') {
    let meta = document.querySelector(`meta[${attribute}="${property}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

function updateHeroSection(hero) {
    const titleEl = document.querySelector('.hero-title');
    const subtitleEl = document.querySelector('.hero-subtitle');
    const buttonEl = document.querySelector('.hero-button');
    const imageEl = document.querySelector('.hero-image');

    if (titleEl && hero.title) titleEl.textContent = hero.title;
    if (subtitleEl && hero.subtitle) subtitleEl.textContent = hero.subtitle;
    if (buttonEl && hero.buttonText) buttonEl.textContent = hero.buttonText;
    if (imageEl && hero.imageUrl) imageEl.src = hero.imageUrl;
}

function updateAboutSection(about) {
    const titleEl = document.querySelector('.about-title');
    const descEl = document.querySelector('.about-description');

    if (titleEl && about.title) titleEl.textContent = about.title;
    if (descEl && about.description) descEl.textContent = about.description;
}

function updateContactSection(contact) {
    const emailEl = document.querySelector('.contact-email') || document.getElementById('contact-email-link');
    const phoneEl = document.querySelector('.contact-phone');
    const addressEl = document.querySelector('.contact-address') || document.getElementById('contact-address-text');
    const hoursEl = document.querySelector('.contact-hours') || document.getElementById('contact-hours-text');

    if (emailEl && contact.email) {
        emailEl.textContent = contact.email;
        emailEl.href = `mailto:${contact.email}`;
    }
    if (phoneEl && contact.phone) {
        phoneEl.textContent = contact.phone;
        phoneEl.href = `tel:${contact.phone}`;
    }
    if (addressEl && contact.address) addressEl.textContent = contact.address;
    if (hoursEl && contact.businessHours) hoursEl.textContent = contact.businessHours;
}

function updateSocialLinks(social) {
    const facebookEl = document.querySelector('.social-facebook');
    const instagramEl = document.querySelector('.social-instagram');
    const whatsappEl = document.querySelector('.social-whatsapp');
    const twitterEl = document.querySelector('.social-twitter');
    const footerSocialContainer = document.getElementById('footer-social-links');

    if (facebookEl && social.facebook) {
        facebookEl.href = social.facebook;
        facebookEl.classList.remove('hidden');
    }
    if (instagramEl && social.instagram) {
        instagramEl.href = social.instagram;
        instagramEl.classList.remove('hidden');
    }
    if (whatsappEl && social.whatsapp) {
        const cleanNumber = social.whatsapp.replace(/\D/g, '');
        whatsappEl.href = `https://wa.me/${cleanNumber}`;
        whatsappEl.classList.remove('hidden');
    }
    if (twitterEl && social.twitter) {
        twitterEl.href = social.twitter;
        twitterEl.classList.remove('hidden');
    }

    // Dynamic Footer Social Links
    if (footerSocialContainer) {
        let html = '';
        if (social.facebook) html += `<a href="${social.facebook}" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition">FB</a>`;
        if (social.instagram) html += `<a href="${social.instagram}" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition">IG</a>`;
        if (social.whatsapp) {
            const cleanNumber = social.whatsapp.replace(/\D/g, '');
            html += `<a href="https://wa.me/${cleanNumber}" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition">WA</a>`;
        }
        if (social.twitter) html += `<a href="${social.twitter}" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition">TW</a>`;
        footerSocialContainer.innerHTML = html;
    }
}

function updateLogo(logoUrl) {
    const logoContainer = document.querySelector('.site-logo-container');
    if (logoContainer) {
        logoContainer.innerHTML = `<img src="${logoUrl}" alt="Logo" class="h-8 sm:h-10 w-auto">`;
    }
}

function updateFooter(footer) {
    const copyrightEl = document.querySelector('.footer-copyright') || document.getElementById('footer-copyright-text');
    if (copyrightEl && footer.copyright) {
        copyrightEl.textContent = footer.copyright;
    }
}

function updateWhyChooseUs(data) {
    const titleEl = document.getElementById('why-choose-us-title');
    const container = document.getElementById('why-choose-us-items');

    if (titleEl && data.title) titleEl.textContent = data.title;
    if (container && data.items) {
        container.innerHTML = data.items.map((item, index) => `
            <div class="group p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-amber-100 transition-all duration-500 hover:-translate-y-2 scroll-reveal" style="transition-delay: ${index * 100}ms">
                <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-amber-100 transition-all">${item.icon}</div>
                <h3 class="text-2xl font-light text-gray-900 mb-4">${item.title}</h3>
                <p class="text-gray-600 font-light leading-relaxed">${item.description}</p>
            </div>
        `).join('');
        if (window.initScrollReveal) window.initScrollReveal();
    }
}

function updateStatsSection(stats) {
    const mapping = {
        'stat-happy-customers': stats?.happyCustomers,
        'stat-products-sold': stats?.productsSold,
        'stat-years-business': stats?.yearsInBusiness,
        'stat-avg-rating': stats?.averageRating
    };

    for (const [id, value] of Object.entries(mapping)) {
        if (!value) continue;
        const el = document.getElementById(id);
        if (el) el.setAttribute('data-target', value);
    }
}

function updateNewsletterSection(data) {
    const titleEl = document.getElementById('newsletter-title');
    const subEl = document.getElementById('newsletter-subtitle');
    const btnEl = document.getElementById('newsletter-btn');

    if (titleEl && data.title) titleEl.textContent = data.title;
    if (subEl && data.subtitle) subEl.textContent = data.subtitle;
    if (btnEl && data.buttonText) btnEl.textContent = data.buttonText;
}

function updateHimalayanSlider(slider) {
    const container = document.getElementById('anti-gravity-track');
    if (!container || !slider.items || !Array.isArray(slider.items) || slider.items.length === 0) return;

    const slides = slider.items.map((item, index) => `
        <div class="agent-slide ${index === 0 ? 'active-physics' : ''}" data-agent-slide data-agent-index="${index}"
            data-agent-title="${escapeHtml(item.title)}"
            data-agent-description="${escapeHtml(item.description)}">
            <div class="slide-inner">
                <div class="slide-visual">
                    <img src="${escapeHtml(item.imageUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90')}"
                        class="slide-image" alt="${escapeHtml(item.title)}">
                </div>
                <div class="slide-info">
                    <div class="accent-pill">${escapeHtml(item.accentPill || 'Featured')}</div>
                    <h3 class="slide-title">${escapeHtml(item.title)}</h3>
                    <p class="slide-desc">${escapeHtml(item.description)}</p>
                    <a href="${escapeHtml(item.buttonLink || 'products.html')}" class="btn-glow">${escapeHtml(item.buttonText || 'Explore')}</a>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = slides;

    // Update dots
    const dotsContainer = document.getElementById('anti-gravity-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = slider.items.map((_, i) => `
            <div class="dot ${i === 0 ? 'active' : ''}" onclick="gravSlide(${i})"></div>
        `).join('');
    }

    // Reinitialize slider if function exists
    if (window.gravSlide && slider.items.length > 0) {
        window.gravSlide(0);
    }
}

function updateCategories(categories) {
    if (!Array.isArray(categories) || categories.length === 0) return;
    
    // Store in window for home.js to use
    window.contentCategories = categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

function updateTestimonials(testimonials) {
    if (!Array.isArray(testimonials) || testimonials.length === 0) return;
    
    // Store in window for home.js to use
    window.contentTestimonials = testimonials.filter(t => t.isFeatured).slice(0, 2);
}

function updateBlogStories(stories) {
    if (!Array.isArray(stories) || stories.length === 0) return;

    // Find the blog section grid
    const blogGrid = document.getElementById('blog-stories-grid');
    if (!blogGrid) return;

    blogGrid.innerHTML = stories.slice(0, 3).map(story => `
        <article class="group">
            <div class="aspect-[4/5] overflow-hidden rounded-2xl mb-6 shadow-md group-hover:shadow-xl transition-all duration-500">
                <img src="${escapeHtml(story.imageUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=100')}"
                    alt="${escapeHtml(story.title)}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=100'">
            </div>
            <p class="text-xs tracking-widest uppercase text-gray-400 mb-2">${escapeHtml(story.category || 'Story')}</p>
            <h3 class="text-2xl font-light text-gray-900 mb-3 group-hover:text-amber-800 transition-colors leading-tight">
                ${escapeHtml(story.title)}
            </h3>
            <p class="text-gray-600 font-light text-sm line-clamp-2">${escapeHtml(story.description || '')}</p>
        </article>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
