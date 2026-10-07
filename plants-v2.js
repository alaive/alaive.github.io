// Interactive scripts for ALAIVE Digital Flora / PLANTAR

document.addEventListener('DOMContentLoaded', () => {
  // Mobile drawer toggle
  const menuBtn = document.querySelector('.menu');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const statusBox = document.getElementById('pilot-status');
  const pilotForm = document.getElementById('pilot-form');
  const docLang = document.documentElement.lang || 'en';

  // Check URL parameters for non-AJAX submission redirect status
  const urlParams = new URLSearchParams(window.location.search);
  const statusParam = urlParams.get('status');
  const msgParam = urlParams.get('msg');

  if (statusBox && statusParam) {
    statusBox.style.display = 'block';
    if (statusParam === 'success') {
      let successMsg = "Thank you! Your pilot inquiry has been successfully submitted. Our agronomy and modeling team will be in touch shortly.";
      if (docLang === 'de') successMsg = "Vielen Dank! Ihre Pilotanfrage wurde erfolgreich übermittelt. Unser Team meldet sich in Kürze bei Ihnen.";
      if (docLang === 'es') successMsg = "¡Gracias! Su consulta de piloto ha sido enviada con éxito. Nuestro equipo se pondrá en contacto en breve.";

      statusBox.textContent = '✓ ' + successMsg;
      statusBox.className = 'pilot-status success';
      if (pilotForm) pilotForm.reset();
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname + '#pilot');
      }, 100);
    } else if (statusParam === 'error') {
      let errorMsg = "Error sending inquiry. Please try again or email us directly at contact@alaive.de.";
      if (msgParam === 'invalid') {
        if (docLang === 'de') errorMsg = "Bitte füllen Sie alle erforderlichen Felder korrekt aus.";
        else if (docLang === 'es') errorMsg = "Por favor, complete todos los campos obligatorios correctamente.";
        else errorMsg = "Please fill in all required fields with a valid email.";
      }
      statusBox.textContent = '✗ ' + errorMsg;
      statusBox.className = 'pilot-status error';
    }
  }

  // Pilot enquiry form AJAX submission to send_pilot.php
  if (pilotForm) {
    pilotForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = pilotForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

      // Set loading state text based on document language
      let sendingText = "Submitting inquiry...";
      if (docLang === 'de') sendingText = "Wird gesendet...";
      if (docLang === 'es') sendingText = "Enviando consulta...";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `${sendingText} <b>&rarr;</b>`;
      }

      if (statusBox) {
        statusBox.style.display = 'none';
        statusBox.className = 'pilot-status';
        statusBox.textContent = '';
      }

      // If viewing directly as file:/// in browser (not via http://localhost web server)
      if (window.location.protocol === 'file:') {
        if (statusBox) {
          statusBox.style.display = 'block';
          statusBox.className = 'pilot-status error';
          statusBox.textContent = 'Notice: PHP forms require testing via http://localhost/ (web server), not direct file:/// browser opening.';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        return;
      }

      const formData = new FormData(pilotForm);
      if (!formData.get('lang')) {
        formData.append('lang', docLang);
      }

      try {
        const response = await fetch('send_pilot.php', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          },
          body: formData
        });

        let result = {};
        try {
          result = await response.json();
        } catch (jsonErr) {
          // If response was not JSON, read text
          const textResp = await response.text();
          result = { message: textResp };
        }

        if (response.ok && result.status === 'success') {
          if (statusBox) {
            statusBox.style.display = 'block';
            statusBox.textContent = '✓ ' + result.message;
            statusBox.className = 'pilot-status success';
          }
          pilotForm.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        console.error('Pilot form submission error:', err);

        let errorText = err.message || 'Failed to submit form.';
        if (docLang === 'de') errorText = "Fehler beim Versenden der Anfrage. Bitte versuchen Sie es erneut oder schreiben Sie an contact@alaive.de.";
        else if (docLang === 'es') errorText = "Error al enviar la consulta. Por favor, inténtelo de nuevo o escriba a contact@alaive.de.";
        else errorText = "Error sending inquiry. Please try again or email us directly at contact@alaive.de.";

        if (statusBox) {
          statusBox.style.display = 'block';
          statusBox.textContent = '✗ ' + errorText;
          statusBox.className = 'pilot-status error';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }
});
