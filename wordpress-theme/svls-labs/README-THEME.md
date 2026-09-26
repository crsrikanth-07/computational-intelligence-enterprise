# SVLS Labs WordPress theme

Generated from the static site. Install: zip this folder as `svls-labs.zip`, then WordPress admin → Appearance → Themes → Add New → Upload Theme → Activate.

Then create these Pages (any content; the template supplies the layout) and assign the template in the page editor (Template dropdown), with these slugs so internal links work:

| Page slug | Template |
| --- | --- |
| `about` | About SVLS LABS |
| `approach` | Governed Delivery Approach |
| `contact` | Contact SVLS LABS |
| `privacy` | Privacy Policy |
| `products/sap-intelligence-suite` | SAP Intelligence Suite: Integration Flows, ABAP, RAP |
| `products/value-lens` | Value Lens: Margin Leak Finder for SAP O2C |
| `services/ai` | Governed Agentic &amp; Applied AI on SAP BTP |
| `services/cloud` | Cloud Services for SAP Landscapes |
| `services/sap` | SAP &amp; ERP Services: S/4HANA, BTP, CPI |
| `terms` | Terms of Use |

The front page uses `front-page.php` automatically (Settings → Reading → Your homepage displays: any static page). 404 uses `404.php`.

Content edits: edit the PHP templates (copy comes from the static HTML). Styles: `assets/css/`.
