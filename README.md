# Soil Doctor — website

A static, dependency-free website: `index.html`, `css/styles.css`, `js/main.js`.
Open it through any static server (for example `python -m http.server 8123 --directory soil-doctor-website`) or upload the folder to any web host.

## Design direction

The whole visual system comes from the Soil Doctor logo: a circle cut into soil layers (sky, leaf, soil, humus) with a heartbeat line across it.

- **Palette:** cream paper with deep humus brown. Four accent colours follow one colour code everywhere on the site:
  - Leaf green: farmers, Diagnose, Soil Doctor Device
  - Sky blue: data and CSR, Advise, Soil Intelligence Platform
  - Clay orange: partners and clinics, Monitor, Soil Doctor Clinics
  - Beet pink: Soil Didis, Empower, Soil Didi Program
- **Type:** Fraunces (soft serif display) with Jost (geometric UI, close to the logo's lettering). Mukta is used for Hindi.
- **Signature moments:**
  - Hero: a living soil cross-section in the logo's circle, with swaying crops, roots that grow on load, drifting nutrient particles, a heartbeat line, pointer parallax, and an orbiting ring of nutrients you can tap.
  - "Dig a little deeper": a pinned scroll story with a depth gauge from 0 to 60 cm across the four phases.
  - An 18-parameter periodic table with filters and plain-language explanations.
  - A fertiliser savings estimator.
  - Expanding service panels, plus tabs for each audience.
  - Impact numbers shown as soil cores that fill up.
  - Testimonials with an Original/English toggle.
  - A drag-to-scroll company timeline, a searchable FAQ, a booking form, and an "open now" office indicator.

## UX and accessibility rules applied

- Mobile-first layout tested at 375 px. A thumb-reach Call / Book bar sits at the bottom on phones.
- EN / हिं language toggle for the main headings and calls to action. The choice is remembered.
- Colour is never the only signal: every colour-coded item also has a text label.
- Tap targets are at least 44 px. Focus rings are visible, and the tabs, accordions and live regions use proper ARIA.
- Motion uses only transform and opacity. `prefers-reduced-motion` turns animation off.
- No JavaScript libraries, so it stays light for low-bandwidth rural connections. Content stays visible even if the script fails.

## Things to finish before launch

1. **Form backend:** set `FORM_ENDPOINT` at the top of `js/main.js` (Formspree, a CRM webhook, etc.). Until then the form opens the visitor's email app, pre-filled to hello@soildoctor.in.
2. **Images:** the service photos are loaded from soildoctor.in. Download them into `/images` and update the paths when you move hosting.
3. **Numbers to confirm with the client:** the current site disagrees with itself in places. Farmers served appears as 4,000+, 5,000+, 10,000+ and 50,000+. The parameter count appears as 13, 15+, 16+ and 18. Device price and clinic training length also vary. This build uses the homepage figures: 50,000+ farmers, ₹1,000 average saving per acre, 4,000+ tests, 25+ Soil Didis, 7+ states and 18 parameters.
4. **WhatsApp:** the current site has a WhatsApp button but no number is published. Add a `https://wa.me/<number>` link once confirmed.
