// Contact form using API only

// Elements
const contactForm = document.getElementById('contact-page-form');
const contactMessage = document.getElementById('contact-form-message');

async function initContactPage() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Reset message
        contactMessage.classList.add('hidden');
        contactMessage.className = 'p-4 rounded-xl text-sm';

        // Get Form Data
        const formData = new FormData(contactForm);
        const inquiryData = {
            customer_name: formData.get('customer_name'),
            customer_email: formData.get('customer_email'),
            customer_phone: formData.get('customer_phone') || null,
            product_name: 'General Inquiry (Contact Page)',
            message: formData.get('message'),
            status: 'pending',
            items: JSON.stringify([{
                name: 'General Inquiry',
                message: formData.get('message')
            }])
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const headers = { 'Content-Type': 'application/json' };

            const response = await fetch('/api/inquiry', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(inquiryData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send inquiry.');
            }

            // Success
            contactMessage.textContent = 'Thank you! Your message has been sent successfully. We will get back to you soon.';
            contactMessage.classList.add('bg-green-100', 'text-green-700');
            contactMessage.classList.remove('hidden');
            contactForm.reset();

            if (window.showToast) window.showToast('Inquiry sent successfully!');

        } catch (err) {
            console.error('Contact Form Error:', err);
            contactMessage.textContent = err.message || 'Error sending message. Please try again.';
            contactMessage.classList.add('bg-red-100', 'text-red-700');
            contactMessage.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Start
initContactPage();
