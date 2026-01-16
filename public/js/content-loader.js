import { supabase } from '../lib/supabase.js';

/**
 * Content Loader Module
 * 
 * This module loads content from Supabase database (primary) or localStorage (fallback)
 * and applies it to the homepage sections dynamically.
 * 
 * Flow:
 * 1. Try to load from Supabase site_content table
 * 2. If database fails, fall back to localStorage
 * 3. Apply content to DOM elements on the page
 */

// Global content data variable
let contentData = {};

/**
 * Main entry point - loads and applies site content
 */
export async function loadSiteContent() {
    console.log('=== loadSiteContent START ===');

    try {
        let content = null;

        // Step 1: Try to load from Supabase database
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .single();

        if (error) {
            console.log('Database not available, checking localStorage:', error.message);
            // Fall back to localStorage
            const localData = localStorage.getItem('site_content');
            console.log('localStorage data found:', !!localData);

            if (localData) {
                content = JSON.parse(localData);
                console.log('Loaded content from localStorage');
            } else {
                console.log('No custom content found, using defaults');
                content = {};
            }
        } else {
            // Successfully loaded from database
            content = data?.content || {};
            console.log('Loaded content from database');
        }

        // Clean the content object (remove any prototype pollution)
        const cleanContent = {};
        if (content && typeof content === 'object') {
            Object.keys(content).forEach(key => {
                if (content.hasOwnProperty(key)) {
                    cleanContent[key] = content[key];
                }
            });
        }
        content = cleanContent;
        contentData = content;

        console.log('Content to apply:', JSON.stringify(content, null, 2));

        // Step 2: Wait for DOM to be ready
        if (document.readyState === 'loading') {
            console.log('DOM still loading, waiting...');
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
            });
        }

        console.log('DOM is ready, applying updates...');

        // Step 3: Apply content to all sections
        if (content.hero) {
            console.log('Updating hero section...');
            updateHeroSection(content.hero);
        }

        if (content.whyChooseUs) {
            console.log('Updating why-choose-us section...');
            updateWhyChooseUs(content.whyChooseUs);
        }

        if (content.stats) {
            console.log('Updating stats section with:', content.stats);
            updateStatsSection(content.stats);
        }

        if (content.seo) {
            console.log('Updating SEO meta tags...');
            updateMetaTags(content.seo);
        }

        if (content.testimonials) {
            console.log('Updating testimonials...');
            updateTestimonials(content.testimonials);
        }

        if (content.blogStories) {
            console.log('Updating blog stories...');
            updateBlogStories(content.blogStories);
        }

        if (content.social) {
            console.log('Updating social links...');
            updateSocialLinks(content.social);
        }

        if (content.footer) {
            console.log('Updating footer...');
            updateFooter(content.footer);
        }

        if (content.branding && content.branding.logoUrl) {
            console.log('Updating logo...');
            updateLogo(content.branding.logoUrl);
        }

        if (content.himalayanSlider) {
            console.log('Updating Himalayan slider...');
            updateHimalayanSlider(content.himalayanSlider);
        }

        if (content.categories) {
            console.log('Updating categories...');
            updateCategories(content.categories);
        }

        console.log('=== loadSiteContent END ===');

    } catch (error) {
        console.error('Error loading content:', error);
        console.log('=== loadSiteContent ERROR ===');
    }
}

// ============================================
// SECTION UPDATE FUNCTIONS
// ============================================

/**
 * Updates SEO meta tags
 */
function updateMetaTags(seo) {
    if (!seo) return;

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

/**
 * Updates the hero section (main banner)
 */
function updateHeroSection(hero) {
    if (!hero) return;

    const titleEl = document.querySelector('.hero-title');
    const subtitleEl = document.querySelector('.hero-subtitle');
    const buttonEl = document.querySelector('.hero-button span.relative');
    const buttonContainer = document.querySelector('.hero-button');

    if (titleEl && hero.title) {
        // Preserve the existing animation structure if possible
        titleEl.innerHTML = hero.title;
    }

    if (subtitleEl && hero.subtitle) {
        subtitleEl.textContent = hero.subtitle;
    }

    if (buttonEl && hero.buttonText) {
        buttonEl.textContent = hero.buttonText;
    } else if (buttonContainer && hero.buttonText) {
        // Fall back to button container if span not found
        const span = buttonContainer.querySelector('span.relative');
        if (span) span.textContent = hero.buttonText;
    }

    // Update hero image if provided
    const heroImage = document.querySelector('.hero-image');
    if (heroImage && hero.imageUrl) {
        heroImage.src = hero.imageUrl;
    }
}

/**
 * Updates the "Why Choose Us" section
 */
function updateWhyChooseUs(data) {
    const container = document.getElementById('why-choose-us-items');
    if (!container) return;

    if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
        container.innerHTML = data.items.map((item, index) => `
            <div class="group p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-amber-100 transition-all duration-500 hover:-translate-y-2 scroll-reveal" style="transition-delay: ${index * 100}ms">
                <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-amber-100 transition-all">${item.icon || '✨'}</div>
                <h3 class="text-2xl font-light text-gray-900 mb-4">${item.title || 'Benefit'}</h3>
                <p class="text-gray-600 font-light leading-relaxed">${item.description || 'Description'}</p>
            </div>
        `).join('');

        // Re-initialize scroll reveal if available
        if (window.initScrollReveal) window.initScrollReveal();
    }
}

/**
 * Updates the impact stats section
 */
function updateStatsSection(stats) {
    console.log('=== updateStatsSection START ===');
    console.log('Stats received:', stats);

    if (!stats) {
        console.log('No stats provided, skipping update');
        return;
    }

    const updateStat = (elementId, value) => {
        const el = document.getElementById(elementId);
        if (!el) {
            console.warn(`Element ${elementId} not found`);
            return;
        }

        const suffix = el.getAttribute('data-suffix') || '+';
        el.textContent = value + suffix;
        el.setAttribute('data-target', value);
        console.log(`✅ Updated ${elementId} to: ${value}${suffix}`);
    };

    // Update all stats
    if (stats.happyCustomers !== undefined) updateStat('stat-happy-customers', stats.happyCustomers);
    if (stats.productsSold !== undefined) updateStat('stat-products-sold', stats.productsSold);
    if (stats.yearsInBusiness !== undefined) updateStat('stat-years-business', stats.yearsInBusiness);
    if (stats.averageRating !== undefined) updateStat('stat-avg-rating', stats.averageRating);

    console.log('=== updateStatsSection END ===');
}

/**
 * Updates social media links
 */
function updateSocialLinks(social) {
    if (!social) return;

    const facebookEl = document.querySelector('.social-facebook');
    const instagramEl = document.querySelector('.social-instagram');
    const whatsappEl = document.querySelector('.social-whatsapp');
    const twitterEl = document.querySelector('.social-twitter');

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
    const footerSocialContainer = document.getElementById('footer-social-links');
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

/**
 * Updates logo
 */
function updateLogo(logoUrl) {
    if (!logoUrl) return;

    const logoContainer = document.querySelector('.site-logo-container');
    if (logoContainer) {
        logoContainer.innerHTML = `<img src="${logoUrl}" alt="Logo" class="h-8 sm:h-10 w-auto">`;
    }
}

/**
 * Updates footer content
 */
function updateFooter(footer) {
    if (!footer) return;

    const copyrightEl = document.querySelector('.footer-copyright') || document.getElementById('footer-copyright-text');
    if (copyrightEl && footer.copyright) {
        copyrightEl.textContent = footer.copyright;
    }

    const aboutEl = document.getElementById('footer-about-text');
    if (aboutEl && footer.aboutText) {
        aboutEl.textContent = footer.aboutText;
    }
}

/**
 * Updates testimonials
 */
function updateTestimonials(testimonials) {
    if (!Array.isArray(testimonials) || testimonials.length === 0) return;

    // Store in window for home.js to use
    window.contentTestimonials = testimonials.filter(t => t.isFeatured !== false).slice(0, 2);

    const container = document.getElementById('testimonials-grid');
    if (!container) return;

    container.innerHTML = testimonials.slice(0, 2).map(t => {
        const initials = (t.customerName || 'CU').split(' ').map(n => n[0]).join('').toUpperCase();
        const stars = '★'.repeat(t.rating || 5);

        return `
            <div class="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <div class="flex text-amber-500 mb-4">${stars}</div>
                <p class="text-gray-700 italic mb-6 leading-relaxed">"${escapeHtml(t.reviewText || '')}"</p>
                <div class="flex items-center gap-4">
                    ${t.customerPhotoUrl
                ? `<img src="${escapeHtml(t.customerPhotoUrl)}" alt="${escapeHtml(t.customerName)}" class="w-12 h-12 rounded-full object-cover">`
                : `<div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold">${initials}</div>`
            }
                    <div>
                        <h4 class="text-gray-900 font-medium">${escapeHtml(t.customerName || '')}</h4>
                        <p class="text-amber-800 text-xs tracking-widest uppercase">Verified Collector</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Updates blog stories section
 */
function updateBlogStories(stories) {
    if (!Array.isArray(stories) || stories.length === 0) return;

    const container = document.getElementById('blog-stories-grid');
    if (!container) return;

    container.innerHTML = stories.slice(0, 3).map(story => `
        <article class="group">
            <div class="aspect-[4/5] overflow-hidden rounded-2xl mb-6 shadow-md group-hover:shadow-xl transition-all duration-500">
                <img src="${escapeHtml(story.imageUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=100')}" 
                     alt="${escapeHtml(story.title || '')}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=100'">
            </div>
            <p class="text-xs tracking-widest uppercase text-gray-400 mb-2">${escapeHtml(story.category || 'Story')}</p>
            <h3 class="text-2xl font-light text-gray-900 mb-3 group-hover:text-amber-800 transition-colors leading-tight">
                ${escapeHtml(story.title || '')}
            </h3>
            <p class="text-gray-600 font-light text-sm line-clamp-2">${escapeHtml(story.description || '')}</p>
        </article>
    `).join('');
}

/**
 * Updates the Himalayan slider
 */
function updateHimalayanSlider(slider) {
    if (!slider || !slider.items || !Array.isArray(slider.items) || slider.items.length === 0) return;

    const container = document.getElementById('anti-gravity-track');
    if (!container) return;

    container.innerHTML = slider.items.map((item, index) => `
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

    // Update dots
    const dotsContainer = document.getElementById('anti-gravity-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = slider.items.map((_, i) => `
            <div class="dot ${i === 0 ? 'active' : ''}" onclick="gravSlide(${i})"></div>
        `).join('');
    }

    // Reinitialize slider if function exists
    if (window.gravSlide) {
        window.gravSlide(0);
    }
}

/**
 * Updates categories for home.js to use
 */
function updateCategories(categories) {
    if (!Array.isArray(categories) || categories.length === 0) return;

    // Store in window for home.js to use
    window.contentCategories = categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Manual update function for debugging (available in browser console)
 */
window.manualUpdateStats = function () {
    const data = localStorage.getItem('site_content');
    if (data) {
        const content = JSON.parse(data);
        console.log('Manually updating stats with:', content.stats);
        updateStatsSection(content.stats);
    } else {
        console.log('No data in localStorage');
    }
};

/**
 * Force reload content (available in browser console)
 */
window.forceReloadContent = function () {
    console.log('Force reloading content...');
    loadSiteContent();
};

// Export for module usage
export { contentData };
