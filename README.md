# COTEMS-National

**Campus Occupant Tracking & Emergency Mustering System — Fiji-wide edition**

An interactive prototype and design package for Fiji National University (FNU), extending the original single-campus COTEMS concept to all major FNU campuses: Nasinu (HQ), Nasese, Koronivia, Pasifika, Namaka (Nadi), Natabua (Lautoka), Ba, and Labasa.

Students and staff check in/out of buildings by scanning their FNU ID QR code. This gives OHS and Security a live, national view of occupancy, and — the moment an emergency is declared on any campus — an instant, accurate muster roll instead of a slow manual headcount.

## Live demo

Open `index.html` directly, or enable GitHub Pages on this repo (Settings → Pages → Deploy from branch → `main` / root) to get a shareable link.

Four roles to explore from the landing screen:
- **COTEMS Mobile App** — the same app serves two logins. **Staff/Student login** (FNU ID number + a generic password automatically generated at registration) shows your personal digital ID card for scanning. **Kiosk login** (scanner username + password) turns the device into the fixed QR reader for whichever room, building, or campus gate it was registered for — the device must already be registered by a System Administrator before it can log in.
- **Campus Warden & Security** — day-to-day campus operations only, no login required (open access, matching a shared front-desk device): register new students/staff/visitors (auto-generating their digital ID), a live **Check-in / check-out log** table for the campus, live occupancy dashboard (flagging cross-campus visitors), emergency declaration across **one or many campuses at once** with an independent muster roll per campus, and a searchable registered-persons directory split into **Student / Visitor / Staff row-tabs** (edit, reset password, remove).
- **System Administrator** — a **separate, login-gated role** from Campus Warden. Only a logged-in System Administrator can reach system-wide configuration: add/edit/delete buildings, rooms, muster points, and entire campuses; register scanner devices; customize registration form fields; customize digital ID card design (logo, colours, text); and tune system-wide settings (occupancy thresholds, emergency types, organisation name). Default demo login: username `sysadmin`, password `FnuAdmin#2026`.
- **National OHS Command (HQ)** — a professional **Executive Dashboard** (customizable by Sys Admin) as the default view, plus all-campus overview, a nationwide **Check-in / check-out log**, analytics, and national audit log

### National Executive Dashboard

The National OHS Command screen opens on a dedicated **📊 Executive Dashboard** — a single-screen, Fiji-wide snapshot combining:

- **KPI tiles**: registered nationwide (with staff/student/visitor split), currently checked in (with % of national capacity), active emergencies, unaccounted-for across all active muster rolls, infrastructure totals (buildings/rooms/campuses), and alerts sent in the last 24 hours.
- **Charts**: occupancy by campus, registered population by role, and by division.
- **Busiest buildings nationwide** — the top 5 buildings by live occupancy, across every campus.
- **Recent national activity feed** — the latest audit events, campus-tagged.

Every one of these widgets can be shown or hidden independently under **System Administration → National Dashboard**, with "Show all"/"Hide all" shortcuts — so the dashboard can be tailored to exactly what a given OHS/Security leadership team wants to see, without touching any code.

### Emergency & broadcast alerts

Every registered student, staff member, and visitor receives alerts directly in the COTEMS Mobile App (visible right on their self-service digital ID screen after logging in):

- **Automatic emergency alerts** — declaring an emergency on a campus instantly sends an alert to everyone registered there, and clearing it (declaring all-clear) sends a matching follow-up alert. No extra step for the warden — this happens automatically as part of declaring/clearing.
- **Warden-initiated broadcasts** — a "📢 Send Alert" button on the Warden dashboard opens a composer that lets a warden pick **one, several, or all campuses** (checklist with "Select all"/"Clear all", pre-ticked with the campus they were viewing) plus one of four audience choices: **Staff only**, **Student only**, **Visitor only**, or **Everyone**. A single send creates an independent alert per selected campus, so a warden can message a whole division at once or just their own campus, entirely independent of any emergency.
- Alerts are scoped to the campus they were sent from and only reach people **registered at that campus** (a visitor's or student's home campus, matching the same registered-campus concept used throughout the system).
- The Warden dashboard also shows a **"Recently sent alerts"** history for the campus, so it's clear what's already gone out.

### Emergency siren

Emergency-type alerts (both the automatic declare/all-clear alerts and any warden broadcast marked as an emergency) don't just show silently — they sound an audible siren on the recipient's phone:

- The moment a student or staff member is on their digital ID screen and an unacknowledged emergency alert reaches them, the siren starts playing automatically, alongside a prominent red "🚨🔊 EMERGENCY SIREN SOUNDING" banner.
- **Only people currently checked in at the affected campus get the siren — at campus, building, or room level, any of them count.** Anyone not checked in there (e.g. off campus, or already checked out) still receives the alert message with its pop sound and voice read-aloud, just without the loud siren, since sounding an alarm for someone who isn't physically there wouldn't help. If they arrive and check in while the emergency is still active, the siren starts for them at that point.
- **The siren plays for a minimum of 30 seconds, and stops early in exactly two ways**: the person taps **"🔇 Stop siren"** themselves on their own screen (with a live countdown showing how long until it would stop on its own), or **the warden declares all-clear for that campus**, which stops it immediately for anyone currently hearing it. There's no other remote override — a warden can't silence a phone mid-emergency without actually clearing the emergency.
- If someone logs in *after* an emergency has already been cleared, the siren doesn't pointlessly sound for an event that's already over — though the original alert and the all-clear both remain visible in their alert history.
- **Wardens choose whether to include the siren at all** when declaring an emergency — an "Include emergency siren" checkbox in the declaration dialog, checked by default, can be unchecked for a lower-key declaration (the alert and voice/chime notification still go out either way, just without the loud siren).
- **When siren is enabled, wardens also pick which siren sound plays**, from a list managed by System Administration — pre-selected based on the chosen emergency type's default, but overridable per declaration.
- If a device's browser doesn't support audio playback at all, the alert banner still displays normally; the siren is simply skipped rather than breaking the page.

### Sys Admin: customizing sirens and alert sounds

Under **System Administration → Alerts & Sounds**, a Sys Admin can fully customize what plays on people's phones:

- **Siren library** — the built-in synthesized wail is always available and can't be deleted, but a Sys Admin can **upload any audio file** as an additional siren option (e.g. a real fire-alarm bell, a tsunami horn, a cyclone warning tone), preview any siren for 3 seconds, and remove custom ones no longer needed.
- **Default siren per emergency type** — map each configured emergency type (Fire Drill, Earthquake, Cyclone, etc.) to whichever siren should be pre-selected when a warden declares that type — wardens can still override it per declaration.
- **Notification pop sound** — every alert (not just emergencies) plays a short pop/chime the moment it's received; this can be toggled off, previewed, or replaced with an uploaded custom sound.
- **Voice read-aloud** — every alert message is read aloud in an English voice (the system automatically picks a female-sounding voice from the browser's available options) the moment it's received. Sys Admin can toggle this on/off, adjust the speaking rate and pitch with sliders, and use "Test voice" to hear a sample before saving.
- **Alert lifetime** — set how many hours a non-emergency alert stays on a person's phone before auto-expiring (default 24h).

### Self-declare safe & distress signals

Not everyone properly scans out before an emergency — someone might have already left a building, or left campus entirely, without checking out at a kiosk. During an active emergency, the Mobile App gives them a direct way to confirm their own status:

- **"I'm safe" declarations** — three one-tap options: *still on campus*, *outside campus*, or *at another mustering area* (pick which one). Confirming immediately marks them **accounted for** on the warden's live muster roll — even if they weren't in the frozen roll at all (e.g. they left well before the emergency was declared), in which case they're added to the roll on the spot as self-declared safe. This is exactly what "confirms attendance during roll call" without needing a warden to manually chase them down.
- **"🆘 I'm trapped / need help"** — for someone who can't safely evacuate. They pick their building (pre-filled with their last known check-in if available) and optionally the room, add a short message, and send. This immediately:
  - Flips their muster roll status to a distinct **"🆘 TRAPPED"** state (separate from ordinary "unaccounted"), with their location and message.
  - Appears in a **"🆘 Distress signals received"** panel at the top of the Warden's dashboard — a running list of every message received, with **Acknowledge** and **Mark rescued / resolved** actions. Acknowledging lets the trapped person see "help is on the way" on their own screen; resolving flips their muster status back to accounted for.

### Per-building mustering areas

Every building has its own assigned mustering area, not just the campus as a whole:

- Under **System Administration → Buildings & rooms**, each building card has a "📍 Mustering area" selector — pick which of the campus's muster points that specific building reports to.
- Every campus has a dedicated **🚪 Main Gate** muster point, managed under **System Administration → Muster points** (any point can be designated Main Gate with one click; a point still in use by a building, or currently set as Main Gate, can't be deleted).
- **Students and staff who checked in at a specific building are told to report to that building's assigned mustering area.** Those who only checked in at the campus level (no specific building — e.g. via a campus-gate scanner) are automatically directed to the **Main Gate**.
- The moment an emergency is declared, the Mobile App shows each person a personalized **"📍 Report to: [muster point name]"** instruction based on exactly where they were checked in — not a generic message.
- The Warden's live muster roll shows a **"Report to"** column per person, and the "Assembly / muster points" section now shows a **live head count** (accounted vs. total) at each point, so a warden can see at a glance which assembly area still needs attention.

### Alert lifecycle — when alerts appear and disappear

- **An active "emergency declared" alert disappears the instant the warden declares all-clear for it.** This is never time-based — it's tied directly to that specific emergency's status, so it vanishes immediately, and re-declaring the same emergency type later won't resurrect the old one.
- **Every other alert — the "all-clear" notice and any warden broadcast — stays visible on a person's phone for the Sys-Admin-configured retention window (24 hours by default), or until that person dismisses it themselves with the ✕ button, whichever comes first.** Dismissal is per-person: one student dismissing a broadcast doesn't remove it from anyone else's phone.

### Multi-campus emergency declaration

A Warden isn't limited to declaring an emergency on just the campus they're currently viewing. The "Declare Emergency" dialog shows a checklist of all campuses (pre-ticked with the one they were viewing), with "Select all" / "Clear all" shortcuts — useful for a region-wide event like a cyclone warning across the Western Division, or a national security alert. Confirming declares an **independent emergency and muster roll for every selected campus** at once; each campus's warden still manages its own roll and can clear it separately once accounted for. The National OHS Command dashboard immediately reflects every campus currently in an active emergency, however many that is.

### Warden vs. System Administrator — why they're separate

Earlier iterations of this prototype gave Campus Wardens full system-administrator rights. That's been split into two distinct roles to match how a real deployment would separate duties:

- **Campus Warden** is an *operational* role — the people actually running a campus day to day (registering people, watching occupancy, running a fire drill) shouldn't need special credentials, and shouldn't be able to accidentally delete a building or reconfigure the whole system.
- **System Administrator** is a *configuration* role — structural, system-wide changes (campuses, buildings, scanner devices, ID card branding, registration rules) are higher-impact and now require a dedicated login, kept separate from any one campus's Warden.

A Warden can no longer reach buildings/campuses/scanners/settings at all; that entire area has been removed from the Warden's tab bar and moved behind the System Administrator login.

### COTEMS Mobile App

The mobile app is the single interface both people and scanner devices use, each with their own login:

**Staff / Student login**
1. Sign in with your FNU ID number and the password automatically generated for you at registration (given to you by your Campus Warden). Forgot it? Ask your Warden to reset it.
2. See your own digital ID card — the same portrait design a Campus Warden generates at registration, complete with your QR code and university details (department/designation, or college/year of enrolment).
3. Present that screen to any registered scanner to be checked in or out. Log out when done.

**Kiosk login (scanner device)**
1. A device can only log in here if it has already been **registered as a scanner** by System Administration (see below) — unregistered devices simply can't sign in.
2. Once logged in, the device is locked to whichever room, building, or campus gate it was registered for — there's no on-the-fly location picker, exactly like a real fixed door reader.
3. **The camera activates automatically** the moment the scan screen loads — no "Start camera scan" click needed. It stays live and ready between scans so people can walk up and scan one after another without staff intervention; a "Restart camera" button is available as a manual fallback (e.g. if the browser denies camera permission the first time) and "Stop camera" lets an operator pause it deliberately. Hardened for phones specifically: the rear ("environment") camera is preferred but the scanner automatically retries with a plain camera request if a device rejects that constraint, `video.play()` is called explicitly (many mobile browsers need this even with the `autoplay` attribute set), and a clear message is shown if the page is loaded over plain HTTP, since phone browsers require a secure (HTTPS) connection to grant camera access at all.
4. Any number of different registered people can scan there one after another (camera or manual FNU ID entry). Each scan toggles that person's check-in status at that exact location and writes a row to the Check-in/Check-out Log — regardless of which campus they were originally registered at.
5. Every log row, the "Currently on campus" table, and the muster roll show a **Registered campus** column alongside the actual scan location, highlighted whenever someone is checking in away from their home campus.
6. "Log out scanner" returns the device to the login screen — it must log back in (with the same or different scanner credentials) before it can scan again.

### Registering a scanner device (System Administration)

Under **System Administration → Scanner devices**, a Warden:
1. Walks through a short wizard — campus → coverage level (campus gate / building entrance / specific room) → building/room if applicable.
2. Sets a username and password for that physical device.
3. The scanner appears in the device list, where its password can be reset, it can be enabled/disabled, or deleted entirely.

Only scanners registered this way can successfully use Kiosk login in the Mobile App.

### System Administrator capabilities

Logging in as System Administrator (see login above) unlocks guarded CRUD (create/read/update/delete) over the operational structure, kept entirely separate from Campus Warden access:

- **Buildings & rooms** — add/edit/delete buildings and rooms per campus; deleting is blocked while anyone is currently checked in there
- **Campuses** — add a new campus (name, division, address), edit existing ones, or delete a campus (blocked if it still has registered persons, active occupants, or an active emergency)
- **Muster points** — add/edit/delete per-campus assembly points (a campus must always keep at least one)
- **Scanner devices** — register/reset/enable/disable/delete scanner logins for rooms, buildings, and campus gates
- **Digital ID design** — fully customize every digital ID card: upload a custom logo (or reset to the default FNU logo), toggle the portrait/avatar placeholder, edit the QR caption text, and independently set the header gradient colours, subtitle, and footer text for Staff, Student, and Visitor cards — with a one-click preview against a real registered person
- **System settings** — occupancy "high"/"critical" warning thresholds, the list of emergency types offered when declaring an emergency, and the organisation name shown on generated ID cards

### QR code registration workflow

Registration is split into three side-by-side forms — **Staff**, **Student**, and **Visitor** — each capturing the fields relevant to that person type (six fields each by default, for parity):

- **Staff**: full name, staff ID number, department/section, designation, home campus, mobile number → **permanent digital ID**.
- **Student**: full name, student ID number, college/programme, year of enrolment, home campus, mobile number → **permanent digital ID**.
- **Visitor**: full name, ID/passport number, purpose of visit, host (person/department visiting), visiting campus, mobile number → **temporary digital pass**.

1. A Campus Warden fills in the relevant column and submits.
2. On submit, the system generates a unique digital ID/QR code automatically — no separate ID office visit or card printer required. Every generated ID is a **portrait-oriented card** (matching a real lanyard-style university ID) with a role-coloured header (navy for staff, teal for students, coral for visitors), a photo/portrait placeholder, structured detail rows, and a properly sized QR code for reliable camera scanning. Staff and student cards show their university details (department/designation, or college/year); visitor passes show who they're visiting and why, with a "Valid until check-out" footer that flips to a greyed-out "EXPIRED" state once they check out.
3. The warden downloads the QR as a PNG or prints it directly from the browser to hand over. The same screen also shows a **Mobile App Login** panel with the person's ID number and a **generic password automatically generated at registration** — no default or predictable password is used. The warden hands both to the registrant so they can log in to the Mobile App.
4. **Sys Admin can reset anyone's mobile app password at any time** — from the Registered Directory or from this same panel — instantly generating a new one and invalidating the old one. This is the only way to recover access if someone forgets their password.
5. **Visitor passes expire automatically the moment that visitor checks out, and an expired pass can never be reused.** Scanning it again is rejected outright. To re-enter a campus, a returning visitor must be **re-registered** — entering the same ID/passport number automatically reissues a brand-new pass on their existing record (rather than creating a duplicate person), while the old expired pass stays permanently invalid. Staff and student digital IDs never expire this way.
6. The Registered Directory shows a **Pass status** column — "Permanent" for staff/students, "Active" or "Expired" for visitors.

### Sys Admin: customizing registration fields

Under **System Administration → Registration fields**, a Warden (acting as system administrator) can tailor each of the three registration forms independently:

- **Add custom fields** — text or dropdown, to any of the Staff, Student, or Visitor forms (e.g. "Emergency contact", "Vehicle registration", "Blood type"). Custom fields appear on the registration form immediately and are captured on every new registration from then on.
- **Make any field mandatory or optional** — including the built-in ("core 🔒") fields — with a simple checkbox per field.
- **Remove custom fields** you no longer need (core fields are protected from deletion since the system depends on them, but you can still change whether they're required).

The QR code registration screen renders itself dynamically from this configuration, so the three columns always reflect whatever fields Sys Admin has currently defined.

The QR libraries (`qrcodejs` for generation, `jsQR` for camera decoding) are loaded from cdnjs at runtime, so an internet connection is required for QR generation/scanning; manual ID entry works fully offline.

## Repository structure

```
index.html              Main interactive prototype (GitHub Pages entry point)
                          — the FNU logo is embedded inline (base64) as the page favicon,
                            topbar brand mark, landing hero, and on every generated digital ID card
assets/
  fnu-logo.png              Source FNU logo file, kept for reference/reuse
diagrams/                System diagrams (SVG)
  erd-national.svg          Entity-relationship diagram
  bpmn-tobe-national.svg     TO-BE process — multi-campus emergency mustering
  network-topology.svg       Deployment / network architecture
reports/
  COTEMS-National-Design-Report.docx   Full system design report
archive/                  Prior single-campus (Nasinu-only) deliverables, kept for reference
```

## Project context

Developed for **CIN815 (Postgraduate Diploma in Information Systems)** at Fiji National University, as a group academic project. Vanilla HTML/CSS/JavaScript — no build step or framework required.

## Deployment (GitHub Pages)

```bash
git init
git add .
git commit -m "COTEMS-National: multi-campus prototype and design report"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then in GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: main, folder: / (root) → Save**. Your site will be live at `https://<username>.github.io/<repo>/`.
