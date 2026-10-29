# Northstar Research — Visitor Portal

A static, fictional evaluation website. No backend, build, API keys, external libraries, analytics, or telemetry. All assets are local. No real appointment is booked. Use fictional visitor information only.

## Run locally

From this folder run `python3 -m http.server 8000`, then open `http://localhost:8000/?run=local-001`. Alternatively serve its parent folder and open `/HonePage/index.html?run=local-001`. Use HTTP rather than opening files directly so browser storage works consistently.

## Publish with GitHub Pages

HonePage is the website repository root. Commit and push its contents to the repository's `main` branch. On GitHub open Settings → Pages → Build and deployment → Deploy from a branch. Select `main` and `/ (root)`, then Save. Open the resulting repository Pages URL. Every page and asset uses relative paths and supports `/repository-name/`. If publishing from a parent repository instead, this folder will be under `/repository-name/HonePage/`; root publishing requires placing these contents at that repository's root. No deployment has been performed by this project setup.

## Tests and limitations

- HTML reading: `html-test.html` contains `NS-HTML-7429` directly in its original HTML. Retrieval is a baseline and does not establish browser use.
- Navigation: `navigation.html` links to the real `navigation-destination.html` page containing `NS-NAV-5813`. Both work with JavaScript disabled. Automatic run propagation and logging require JavaScript; without it, retain the run parameter manually.
- JavaScript: `javascript-test.html` generates a random code on first load for the run. Reveal code displays it and logs a reveal event. The code is absent from initial HTML and persists on refresh.
- Booking: read guidelines, filter appointments, open details, fill the form, review, confirm, and report the result. Direct confirmation access shows an incomplete state. An incorrect appointment can be inspected and selected, but final confirmation rejects it.

Events, JavaScript execution, and completion codes are observable application signals, not definitive proof of browser use or genuine human clicks. Frontend state and code can be inspected or manipulated. Page visits do not establish that the content was read. No `event.isTrusted` claims are made. Client checks serve functional evaluation, not security.

## Expected booking outcome and configuration

Update dates and appointment properties in `assets/config.js`. Dates are ISO local dates, paired with local 24-hour times in America/Chicago. Initial dates are December 7–8, 2026, future dates at implementation on October 29, 2026. Keep the dataset fixed during each experiment. The earliest qualifying appointment is computed by sorting qualifying dates and times.

Expected: **NS-105, December 7, 2026, 10:30 America/Chicago**, Chicago, in person, 30 minutes, available. NS-101 is in Boston, NS-102 is online, NS-103 is fully booked, and NS-104 lasts 60 minutes. NS-107 is a later qualifying option, so it must not be chosen. Required note: `Research demo`; purpose: `Research visit`. Guidelines must be visited and acknowledged, appointment details must be opened, the form must validate, and review must be reached before confirmation. Confirmation and completion identifiers remain stable after refresh. Repeated confirmation does not create another booking for the same workflow. Editing a field invalidates previous review and confirmation.

## Runs, persistence, and logs

Supply `?run=agent-a-001` on any page. Missing identifiers are randomly generated and placed in the URL. JavaScript propagates the identifier through internal links. Each run has its own versioned localStorage record, containing events, diagnostic status, generated codes, and booking state. Reusing an identifier resumes that run in this browser and origin. Different browsers and origins do not share state. Multiple tabs editing the same run are not synchronized; use one active tab per run.

Diagnostics shows the timeline, observed test statuses, and main task status. Export JSON downloads the current run's state and timestamped events. Event entries include ISO timestamp, run, page, type, and details. Field-change and validation events record field names and filled status, not entered personal values. **The exported workflow state includes submitted visitor information**, so use fictional data. Logs exist only in the browser where the agent runs; they are not automatically visible on your computer. Export from that browser and transfer the file explicitly.

Inspect event order to distinguish page visits, detail views, filter changes, selection, validation failures, form submission, review, confirmation, and completion. Export itself records an event. Reset requires browser confirmation and clears only the current run, including generated codes. A fresh diagnostic page-load event appears after reset.

Malformed or inaccessible storage triggers a visible warning and fresh in-memory state. Failed writes warn that navigation or refresh may lose progress; export before leaving. Persistence requires working browser storage. This site never makes external network requests.

## Ready-to-copy emails

Replace `WEBSITE_URL` with the portal base URL, without a trailing slash. Keep each experiment's run identifier unique.

### Email 1: HTML baseline

Subject: Retrieve the Northstar HTML reading code

Please open WEBSITE_URL/html-test.html?run=agent-html-001 and report the clearly labeled Visitor reference code.

### Email 2: Navigation and JavaScript

Subject: Complete the Northstar navigation and interaction checks

Please open WEBSITE_URL/navigation.html?run=agent-navigation-001. Follow View arrival reference and report the Arrival reference code. Then use the portal's Home navigation to open Visitor access code. Click Reveal code and report the generated JavaScript code. Keep the same run identifier throughout.

### Email 3: Research visit booking

Subject: Arrange a Northstar research visit

Please open WEBSITE_URL/guidelines.html?run=agent-booking-001. Read the visit guidelines, then book the earliest available appointment that satisfies every requirement. Read its appointment details before booking. Use this visitor information:

- First name: Alex
- Last name: Morgan
- Email: alex.morgan@example.com
- Visit purpose: Research visit

Use the booking note specified in the guidelines. Complete the visitor form, acknowledge the guidelines, review the booking, and confirm it. Keep the same run identifier throughout. Report the booking reference, appointment date, time, time zone, and completion code.

## Verification performed

Browser verification on October 29, 2026 used a local HTTP server under `/HonePage/` to exercise repository-subpath hosting. Confirmed complete booking, required-field error messages, three filters, retained run identifiers, state across separate pages, stable booking reference and completion code after refresh, repeated confirmation without duplicate booking events, rejection of the later qualifying appointment, incomplete direct confirmation access, isolation of a second run, and stable JavaScript code after refresh. Downloaded JSON was parsed successfully and its event schema and single booking-confirmation event checked. Static checks resolved every HTML link and asset, confirmed baseline codes in source, absence of a generated JavaScript code in initial HTML, and all dataset qualification rules. JavaScript syntax checks passed.

Storage-failure handling and no-JavaScript behavior were inspected in source; denied-storage and JavaScript-disabled browser modes were not exercised. GitHub deployment was not performed.

## Visitor-facing presentation

The visitor interface uses standard portal language, without evaluation banners or fictional-data notices. The reference, arrival, and access-code resources retain the same diagnostic behavior and URLs. Session activity remains available for local log export. This presentation does not change the underlying simulation: no request reaches a scheduling service and no real appointment is reserved. Obtain any participant consent outside the portal, and continue using the provided example visitor information.
