import { supabase } from '../lib/supabase.js';

// Global content data variable
let contentData = {};

// Load and apply site content from database
export async function loadSiteContent() {
    try {
        // First try to load from Supabase
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .single();

        let content = null;

        if (error) {
            console.log('Database not available, checking localStorage:', error.message);
            // Fall back to localStorage
            const localData = localStorage.getItem('site_content');
            console.log('localStorage data:', localData);
            if (localData) {
                content = JSON.parse(localData);
                console.log('Loaded content from localStorage:', content);

                // CRITICAL FIX: Actually call the update functions!
                console.log('Now applying loaded content...');
                if (content.hero) updateHeroSection(content.hero);
                if (content.whyChooseUs) updateWhyChooseUs(content.whyChooseUs);
                if (content.stats) {
                    console.log('Calling updateStatsSection with:', content.stats);
                    updateStatsSection(content.stats);
                }
                if (content.seo) updateMetaTags(content.seo);
                if (content.testimonials) updateTestimonials(content.testimonials);
                if (content.blogStories) updateBlogStories(content.blogStories);

                console.log('Content applied from localStorage!');
                return;
            } else {
                console.log('No custom content found, using defaults');
                // Still call these to apply hardcoded fallbacks
                updateWhyChooseUs({});
                updateStatsSection({});
                return;
            }
        } else {
            content = data.content;
            console.log('Loaded content from database:', content);

            // CRITICAL FIX: Actually call the update functions!
            console.log('Now applying loaded content...');
            if (content.hero) updateHeroSection(content.hero);
            if (content.whyChooseUs) updateWhyChooseUs(content.whyChooseUs);
            if (content.stats) {
                console.log('Calling updateStatsSection with:', content.stats);
                updateStatsSection(content.stats);
            }
            if (content.seo) updateMetaTags(content.seo);
            if (content.testimonials) updateTestimonials(content.testimonials);
            if (content.blogStories) updateBlogStories(content.blogStories);

            console.log('Content applied from database!');
        }

        if (content) {
            contentData = content;

            // Apply SEO Meta Tags
            if (content.seo) updateMetaTags(content.seo);

            // Apply Hero Section
            if (content.hero) updateHeroSection(content.hero);

            // Apply Social Media Links
            if (content.social) updateSocialLinks(content.social);

            // Apply Branding (Logo)
            if (content.branding && content.branding.logoUrl) updateLogo(content.branding.logoUrl);

            // Apply Footer
            if (content.footer) updateFooter(content.footer);

            console.log('Content application complete. Functions were already called during loading.');

            // Apply legacy dynamic sections
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
    if (!hero) return;

    const titleEl = document.querySelector('.hero-title');
    const subtitleEl = document.querySelector('.hero-subtitle');
    const buttonEl = document.querySelector('.hero-button');

    if (titleEl) {
        titleEl.innerHTML = hero.title || 'Handcrafted in the Himalayas';
    }
    if (subtitleEl) {
        subtitleEl.textContent = hero.subtitle || 'Authentic Nepalese crafts made by skilled artisans using centuries-old traditions.';
    }
    if (buttonEl) {
        buttonEl.textContent = hero.buttonText || 'Explore Collection';
    }
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
    const container = document.getElementById('why-choose-us-items');

    if (container && data.items) {
        container.innerHTML = data.items.map((item, index) => `
            <div class="group p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-amber-100 transition-all duration-500 hover:-translate-y-2 scroll-reveal" style="transition-delay: ${index * 100}ms">
                <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-amber-100 transition-all">${item.icon || '✨'}</div>
                <h3 class="text-2xl font-light text-gray-900 mb-4">${item.title || 'Benefit'}</h3>
                <p class="text-gray-600 font-light leading-relaxed">${item.description || 'Description'}</p>
            </div>
        `).join('');
        if (window.initScrollReveal) window.initScrollReveal();
    }
}

function updateStatsSection(stats) {
    console.log('=== updateStatsSection START ===');
    console.log('stats received:', stats);
    console.log('Current page URL:', window.location.href);

    if (!stats) {
        console.log('No stats provided, using defaults');
        stats = { happyCustomers: 20, productsSold: 500, yearsInBusiness: 15, averageRating: '4.8' };
    }

    // Get all elements - check for BOTH possible IDs
    const el1_correct = document.getElementById('stat-happy-customers'); // correct ID
    const el1_typo = document.getElementById('stat-happy-customers'); // typo ID
    const el2 = document.getElementById('stat-products-sold');
    const el3 = document.getElementById('stat-years-business');
    const el4 = document.getElementById('stat-avg-rating');

    console.log('DOM elements found:', {
        'stat-happy-customers (correct)': !!el1_correct,
        'stat-happy-customers (typo)': !!el1_typo,
        'stat-products-sold': !!el2,
        'stat-years-business': !!el3,
        'stat-avg-rating': !!el4
    });

    // Update each element directly with FORCE refresh
    if (el1_correct) {
        const suffix = el1_correct.getAttribute('data-suffix') || '+';
        el1_correct.textContent = stats.happyCustomers + suffix;
        el1_correct.setAttribute('data-target', stats.happyCustomers);
        // Force reflow
        el1_correct.style.display = 'none';
        el1_correct.offsetHeight; // trigger reflow
        el1_correct.style.display = '';
        console.log('✅ Updated stat-happy-customers to:', el1_correct.textContent);
    }
    if (el2) {
        const suffix = el2.getAttribute('data-suffix') || '+';
        el2.textContent = stats.productsSold + suffix;
        el2.setAttribute('data-target', stats.productsSold);
        el2.style.display = 'none';
        el2.offsetHeight;
        el2.style.display = '';
        console.log('✅ Updated stat-products-sold to:', el2.textContent);
    }
    if (el3) {
        const suffix = el3.getAttribute('data-suffix') || '+';
        el3.textContent = stats.yearsInBusiness + suffix;
        el3.setAttribute('data-target', stats.yearsInBusiness);
        el3.style.display = 'none';
        el3.offsetHeight;
        el3.style.display = '';
        console.log('✅ Updated stat-years-business to:', el3.textContent);
    }
    if (el4) {
        const suffix = el4.getAttribute('data-suffix') || '+';
        el4.textContent = stats.averageRating + suffix;
        el4.setAttribute('data-target', stats.averageRating);
        el4.style.display = 'none';
        el4.offsetHeight;
        el4.style.display = '';
        console.log('✅ Updated stat-avg-rating to:', el4.textContent);
    }

    console.log('=== updateStatsSection END ===');
}

// Make it globally accessible for debugging
window.manualUpdateStats = function() {
    const data = localStorage.getItem('site_content');
    if (data) {
        const content = JSON.parse(data);
        console.log('Manually updating stats with:', content.stats);
        updateStatsSection(content.stats);
    } else {
        console.log('No data in localStorage');
    }
};

function updateSectionTitles(titles) {
    if (!titles) return;

    // Featured Products Section
    const featuredEyebrow = document.querySelector('#featured-products .text-sm.tracking-widest');
    const featuredTitle = document.querySelector('#featured-products h2');
    if (featuredEyebrow && titles.featuredEyebrow) {
        featuredEyebrow.textContent = titles.featuredEyebrow;
    }
    if (featuredTitle && titles.featuredTitle) {
        featuredTitle.innerHTML = titles.featuredTitle;
    }

    // Why Choose Us Section
    const whyTitle = document.getElementById('why-choose-us-title');
    if (whyTitle && titles.whyChooseUsTitle) {
        whyTitle.innerHTML = titles.whyChooseUsTitle;
    }

    // Testimonials Section
    const testimonialsSection = document.querySelector('section.py-24.bg-stone-50');
    if (testimonialsSection) {
        const testEyebrow = testimonialsSection.querySelector('.text-sm.tracking-widest');
        const testTitle = testimonialsSection.querySelector('h2');
        if (testEyebrow && titles.testimonialsEyebrow) {
            testEyebrow.textContent = titles.testimonialsEyebrow;
        }
        if (testTitle && titles.testimonialsTitle) {
            testTitle.innerHTML = titles.testimonialsTitle;
        }
    }

    // Blog Stories Section
    const blogSection = document.querySelector('section.py-24.bg-white.border-t');
    if (blogSection) {
        const blogEyebrow = blogSection.querySelector('.text-sm.tracking-widest');
        const blogTitle = blogSection.querySelector('h2');
        if (blogEyebrow && titles.blogEyebrow) {
            blogEyebrow.textContent = titles.blogEyebrow;
        }
        if (blogTitle && titles.blogTitle) {
            blogTitle.innerHTML = titles.blogTitle;
        }
    }
}

// FUNCTION 1: Update Category Showcase
async function updateCategoryShowcase() {
    const element = document.getElementById('category-showcase');
    if (!element) return;
    
    if (!contentData.categories || !Array.isArray(contentData.categories) || contentData.categories.length === 0) {
        return;
    }
    
    element.innerHTML = '';
    
    contentData.categories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-500';
        
        div.innerHTML = `
            <img src="${category.imageUrl || ''}" alt="${category.name || ''}" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 class="text-2xl font-light mb-2">${category.name || ''}</h3>
                <p class="text-sm text-gray-200">${category.description || ''}</p>
                <a href="${category.link || '#'}" class="inline-block mt-4 text-amber-400 hover:text-amber-300 transition">Explore →</a>
            </div>
        `;
        
        element.appendChild(div);
    });
}

// FUNCTION 2: Update Himalayan Slider (Enhanced version)
async function updateHimalayanSlider() {
    if (!contentData.himalayanSlider || !contentData.himalayanSlider.items) return;
    
    const element = document.getElementById('anti-gravity-track');
    if (!element) return;
    
    element.innerHTML = '';
    
    contentData.himalayanSlider.items.forEach((slide, index) => {
        const div = document.createElement('div');
        div.className = `agent-slide${index === 0 ? ' active-physics' : ''}`;
        div.setAttribute('data-agent-slide', '');
        div.setAttribute('data-agent-index', index);
        
        div.innerHTML = `
            <div class="slide-inner">
                <div class="slide-visual">
                    <img src="${slide.imageUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90'}" 
                         alt="${slide.title || ''}" class="slide-image">
                </div>
                <div class="slide-info">
                    <div class="accent-pill">${slide.accentPill || 'Featured'}</div>
                    <h3 class="slide-title">
                        ${slide.title || ''}${slide.titleItalic ? `<span class="italic">${slide.titleItalic}</span>` : ''}
                    </h3>
                    <p class="slide-desc">${slide.description || ''}</p>
                    <a href="${slide.buttonLink || 'products.html'}" class="btn-glow">${slide.buttonText || 'Explore'}</a>
                </div>
            </div>
        `;
        
        element.appendChild(div);
    });
}

// FUNCTION 3: Update Why Choose Us Items
async function updateWhyChooseUs() {
    const element = document.getElementById('why-choose-us-items');
    if (!element) return;
    
    if (!contentData.whyChooseUs || !contentData.whyChooseUs.items) return;
    
    element.innerHTML = '';
    
    contentData.whyChooseUs.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'group p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-amber-100 transition-all duration-500 hover:-translate-y-2 scroll-reveal';
        div.style.transitionDelay = `${index * 100}ms`;
        
        div.innerHTML = `
            <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
                ${item.icon || ''}
            </div>
            <h3 class="text-2xl font-light text-gray-900 mb-4">${item.title || ''}</h3>
            <p class="text-gray-600 font-light leading-relaxed">${item.description || ''}</p>
        `;
        
        element.appendChild(div);
    });
}

// FUNCTION 4: Update Impact Stats
async function updateImpactStats() {
    if (!contentData.stats) return;
    
    const statsElements = [
        { id: 'stat-happy-customers', value: contentData.stats.happyCustomers },
        { id: 'stat-products-sold', value: contentData.stats.productsSold },
        { id: 'stat-years-business', value: contentData.stats.yearsInBusiness },
        { id: 'stat-avg-rating', value: contentData.stats.averageRating }
    ];
    
    statsElements.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.textContent = value + '+';
            element.setAttribute('data-target', value);
        }
    });
}

// FUNCTION 5: Update Testimonials (Enhanced version)
async function updateTestimonials() {
    const element = document.getElementById('testimonials-grid');
    if (!element) return;
    
    if (!contentData.testimonials || !Array.isArray(contentData.testimonials) || contentData.testimonials.length === 0) {
        return;
    }
    
    element.innerHTML = '';
    
    contentData.testimonials.forEach(testimonial => {
        const div = document.createElement('div');
        div.className = 'p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500';
        
        const stars = '★'.repeat(testimonial.rating || 5);
        const customerInitials = testimonial.customerInitials || 
                              (testimonial.customerName ? testimonial.customerName.slice(0, 2).toUpperCase() : 'CU');
        
        div.innerHTML = `
            <div class="flex text-amber-500 mb-4">${stars}</div>
            <p class="text-gray-700 italic mb-6 leading-relaxed">${testimonial.reviewText || ''}</p>
            <div class="flex items-center gap-4">
                ${testimonial.customerPhotoUrl ? 
                    `<img src="${testimonial.customerPhotoUrl}" alt="${testimonial.customerName || ''}" class="w-12 h-12 rounded-full object-cover">` :
                    `<div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold">${customerInitials}</div>`
                }
                <div>
                    <h4 class="text-gray-900 font-medium">${testimonial.customerName || ''}</h4>
                    <p class="text-amber-800 text-xs tracking-widest uppercase">${testimonial.customerTitle || 'Verified Customer'}</p>
                </div>
            </div>
        `;
        
        element.appendChild(div);
    });
}

// FUNCTION 6: Update Blog Stories (Enhanced version)
async function updateBlogStories() {
    const element = document.getElementById('blog-stories-grid');
    if (!element) return;
    
    if (!contentData.blogStories || !Array.isArray(contentData.blogStories) || contentData.blogStories.length === 0) {
        return;
    }
    
    element.innerHTML = '';
    
    contentData.blogStories.slice(0, 3).forEach(story => {
        const article = document.createElement('article');
        article.className = 'group';
        
        const content = `
            <div class="aspect-[4/5] overflow-hidden rounded-2xl mb-6 shadow-md group-hover:shadow-xl transition-all duration-500">
                <img src="${story.imageUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=100'}" 
                     alt="${story.title || ''}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=100'">
            </div>
            <p class="text-xs tracking-widest uppercase text-gray-400 mb-2">${story.category || 'Story'}</p>
            <h3 class="text-2xl font-light text-gray-900 mb-3 group-hover:text-amber-800 transition-colors leading-tight">
                ${story.title || ''}
            </h3>
            <p class="text-gray-600 font-light text-sm line-clamp-2">${story.description || ''}</p>
        `;
        
        if (story.link) {
            const link = document.createElement('a');
            link.href = story.link;
            link.innerHTML = content;
            article.appendChild(link);
        } else {
            article.innerHTML = content;
        }
        
        element.appendChild(article);
    });
}

// FUNCTION 7: Update Footer Content
async function updateFooterContent() {
    if (!contentData.footer) return;
    
    const copyrightElement = document.getElementById('footer-copyright-text');
    if (copyrightElement && contentData.footer.copyright) {
        copyrightElement.textContent = contentData.footer.copyright;
    }
    
    const aboutElement = document.getElementById('footer-about-text');
    if (aboutElement && contentData.footer.aboutText) {
        aboutElement.textContent = contentData.footer.aboutText;
    }
    
    if (contentData.social) {
        const socialContainer = document.getElementById('footer-social-links');
        if (socialContainer) {
            const socialLinks = socialContainer.querySelectorAll('a');
            socialLinks.forEach(link => {
                const text = link.textContent.toLowerCase();
                if (text.includes('fb') && contentData.social.facebook) {
                    link.href = contentData.social.facebook;
                } else if (text.includes('ig') && contentData.social.instagram) {
                    link.href = contentData.social.instagram;
                } else if (text.includes('tw') && contentData.social.twitter) {
                    link.href = contentData.social.twitter;
                } else if (text.includes('yt') && contentData.social.youtube) {
                    link.href = contentData.social.youtube;
                } else if (text.includes('li') && contentData.social.linkedin) {
                    link.href = contentData.social.linkedin;
                }
            });
        }
    }
}

// FUNCTION 8: Update Hero Section
async function updateHeroSection() {
    if (!contentData.hero) return;
    
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && contentData.hero.title) {
        heroTitle.innerHTML = contentData.hero.title;
    }
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && contentData.hero.subtitle) {
        heroSubtitle.textContent = contentData.hero.subtitle;
    }
    
    const heroImage = document.querySelector('.hero-image');
    if (heroImage && contentData.hero.imageUrl) {
        heroImage.src = contentData.hero.imageUrl;
    }
    
    const heroButton = document.querySelector('.hero-button');
    if (heroButton) {
        if (contentData.hero.buttonText) {
            heroButton.textContent = contentData.hero.buttonText;
        }
        if (contentData.hero.buttonLink) {
            heroButton.href = contentData.hero.buttonLink;
        }
    }
    
    const secondaryButton = document.querySelector('.hero-secondary-button');
    if (secondaryButton) {
        if (contentData.hero.secondaryButtonText) {
            secondaryButton.textContent = contentData.hero.secondaryButtonText;
        }
        if (contentData.hero.secondaryButtonLink) {
            secondaryButton.href = contentData.hero.secondaryButtonLink;
        }
    }
    
    const badgeElement = document.querySelector('.hero-badge');
    if (badgeElement && contentData.hero.badgeText) {
        badgeElement.textContent = contentData.hero.badgeText;
    }
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
