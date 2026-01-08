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
            return;
        }

        if (data && data.content) {
            const content = data.content;

            // Apply SEO Meta Tags
            if (content.seo) {
                updateMetaTags(content.seo);
            }

            // Apply Hero Section
            if (content.hero) {
                updateHeroSection(content.hero);
            }

            // Apply About Section
            if (content.about) {
                updateAboutSection(content.about);
            }

            // Apply Contact Information
            if (content.contact) {
                updateContactSection(content.contact);
            }

            // Apply Social Media Links
            if (content.social) {
                updateSocialLinks(content.social);
            }

            // Apply Branding (Logo)
            if (content.branding && content.branding.logoUrl) {
                updateLogo(content.branding.logoUrl);
            }

            // Apply Footer
            if (content.footer) {
                updateFooter(content.footer);
            }

            // Apply Homepage Specific Sections
            if (content.whyChooseUs) {
                updateWhyChooseUs(content.whyChooseUs);
            }
            if (content.stats) {
                updateStatsSection(content.stats);
            }
            if (content.newsletter) {
                updateNewsletterSection(content.newsletter);
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
        container.innerHTML = data.items.map(item => `
            <div class="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow scroll-reveal">
                <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-6">${item.icon}</div>
                <h3 class="text-xl font-medium text-gray-900 mb-4">${item.title}</h3>
                <p class="text-gray-600 font-light leading-relaxed">${item.description}</p>
            </div>
        `).join('');
    }
}

function updateStatsSection(stats) {
    const mapping = {
        'stat-happy-customers': stats.happyCustomers,
        'stat-products-sold': stats.productsSold,
        'stat-years-business': stats.yearsInBusiness,
        'stat-avg-rating': stats.averageRating
    };

    for (const [id, value] of Object.entries(mapping)) {
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
