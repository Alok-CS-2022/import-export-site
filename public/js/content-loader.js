import { supabase } from './supabase.js';

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
    const emailEl = document.querySelector('.contact-email');
    const phoneEl = document.querySelector('.contact-phone');
    const addressEl = document.querySelector('.contact-address');
    const hoursEl = document.querySelector('.contact-hours');

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
}

function updateLogo(logoUrl) {
    const logoContainer = document.querySelector('.site-logo-container');
    if (logoContainer) {
        logoContainer.innerHTML = `<img src="${logoUrl}" alt="Logo" class="h-8 sm:h-10 w-auto">`;
    }
}

function updateFooter(footer) {
    const copyrightEl = document.querySelector('.footer-copyright');
    if (copyrightEl && footer.copyright) {
        copyrightEl.textContent = footer.copyright;
    }
}
