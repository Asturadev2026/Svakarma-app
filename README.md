# Svakarma — Local Development Setup Guide

Welcome! This guide will walk you through running the **Svakarma** project on your computer from scratch. No prior experience with React Native or Expo is required — just follow each step carefully.

---

## What is this project?

Svakarma is made up of **three separate applications** that all talk to each other:

1. **Backend** (`backend/`) — The server. It handles all the data, business logic, and talks to the database. Built with Node.js and TypeScript.
2. **Admin Portal** (`admin-portal/`) — A web dashboard for admins. Opens in your browser. Built with React.
3. **Mobile App** (`myapp/`) — The actual mobile app users will use on their phones. Built with React Native + Expo.

> 💡 **What is Expo?** Expo is a tool that lets you build mobile apps using JavaScript/React. You don't need to write Swift or Kotlin — it handles all of that for you. During development, you can instantly preview the app on your real phone using the free **Expo Go** app.

To run the full project locally, **all three need to be running at the same time** in three separate terminal windows.

---

## Step 0 — Install the Required Tools

Before anything else, make sure these are installed on your computer. Do this **once**, then you never need to do it again.

### 0.1 — Node.js (Required for everything)

Node.js is the JavaScript runtime that runs the backend and builds the frontend projects.

1. Go to **https://nodejs.org**
2. Download the **LTS version** (the one that says "Recommended For Most Users")
3. Run the installer and follow the steps
4. To verify it worked, open a terminal and run:
   ```
   node -v
   ```
   You should see a version number like `v20.x.x`. If you do, you're good.

### 0.2 — PostgreSQL (Required for the backend)

PostgreSQL is the database where all app data is stored.

1. Go to **https://www.postgresql.org/download/**
2. Download and run the installer for your OS
3. During installation, you will be asked to set a **password for the `postgres` user** — **remember this password**, you will need it later
4. Leave the port as the default `5432`
5. Complete the installation

> 💡 After installation, PostgreSQL runs as a background service on your computer. You don't need to manually start it each time.

### 0.3 — Git (To clone the project)

If you don't already have Git installed:
1. Go to **https://git-scm.com/downloads**
2. Download and install it

### 0.4 — Expo Go (To test the mobile app on your phone)

This is a free app you install on your **real phone**. It lets you run the mobile app instantly without needing a phone emulator.

- **Android**: Search for **"Expo Go"** on the Google Play Store and install it
- **iPhone**: Search for **"Expo Go"** on the App Store and install it

> ⚠️ Your phone and your computer must be connected to the **same Wi-Fi network** for this to work.

---

## Step 1 — Clone the Project

If you haven't already downloaded the project, open a terminal and run:

```bash
git clone <repository-url>
cd svakarma-mobile
```

Replace `<repository-url>` with the actual Git repository link shared with you.

---

## Step 2 — Set Up the Backend

> 📁 All commands in this section must be run from inside the **`backend`** folder.

### 2.1 — Open a terminal and go into the backend folder

```bash
cd backend
```

### 2.2 — Create the environment file

The backend needs a file called `.env` that contains secret settings (like database credentials). We have a template ready for you.

**On Mac/Linux:**
```bash
cp .env.example .env
```

**On Windows (Command Prompt):**
```bash
copy .env.example .env
```

### 2.3 — Fill in the environment file

Open the newly created `.env` file (you can use VS Code, Notepad, or any text editor) and update the following values:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/svakarma"
JWT_SECRET="any-long-random-string-you-make-up"
PORT=5000
NODE_ENV=development
SMS_PROVIDER=mock
PAYMENT_PROVIDER=mock
```

**What to change:**
- Replace `YOUR_PASSWORD_HERE` with the PostgreSQL password you set during installation (Step 0.2)
- Replace `any-long-random-string-you-make-up` with any random text (e.g. `mysecretkey12345`) — this is used to sign login tokens

**Leave everything else exactly as it is.**

> 💡 `SMS_PROVIDER=mock` and `PAYMENT_PROVIDER=mock` mean the app will **simulate** sending OTPs and processing payments locally — no real SMS or payment credentials are needed. This is perfect for development.

### 2.4 — Create the database

Open **pgAdmin** (installed with PostgreSQL) or any PostgreSQL client, and create a new database named **`svakarma`**.

**Using pgAdmin (easiest):**
1. Open pgAdmin from your Start Menu
2. Connect to your local server (use the password from Step 0.2)
3. Right-click on **Databases** → **Create** → **Database**
4. Name it `svakarma` and click Save

**Using the terminal (alternative):**
```bash
psql -U postgres -c "CREATE DATABASE svakarma;"
```
(Enter your PostgreSQL password when prompted)

### 2.5 — Install backend dependencies

This downloads all the libraries the backend needs. Run this from the `backend/` folder:

```bash
npm install
```

> 💡 `npm install` reads the `package.json` file and downloads everything listed there. It may take a minute or two. You'll see a `node_modules/` folder appear when it's done.

### 2.6 — Set up the database tables

Now we need to create all the tables inside the database. Run these **two commands in order**:

```bash
npm run prisma:generate
```
> This generates the database client code (tells your app how to talk to the DB).

```bash
npm run prisma:migrate
```
> This creates all the actual tables in your database. When prompted, you can give the migration any name (e.g. `init`).

### 2.7 — Start the backend server

```bash
npm run dev
```

If everything worked, you will see something like:
```
🚀 Server running on port 5000
```

**Leave this terminal open.** The backend is now running at `http://localhost:5000`.

---

## Step 3 — Set Up the Admin Portal

> 📁 All commands in this section must be run from inside the **`admin-portal`** folder.
> Open a **new terminal window** for this — keep the backend terminal running.

### 3.1 — Go into the admin-portal folder

```bash
cd admin-portal
```

### 3.2 — Install dependencies

```bash
npm install
```

### 3.3 — Start the admin portal

```bash
npm run dev
```

You will see output like:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser to see the admin dashboard.

**Leave this terminal open.**

---

## Step 4 — Set Up the Mobile App

> 📁 All commands in this section must be run from inside the **`myapp`** folder.
> Open a **third terminal window** — keep the previous two running.

### 4.1 — Go into the myapp folder

```bash
cd myapp
```

### 4.2 — Install dependencies

```bash
npm install
```

This will take longer than the others because the mobile app has more packages.

### 4.3 — Create a `.env` file

In the `myapp` folder (same location as `.env.example`), create a new file named `.env`.

**Option A (recommended):**
```bash
cp .env.example .env
```

**Option B (Windows Command Prompt):**
```cmd
copy .env.example .env
```

**Option C:**
Manually create a file named `.env` and copy the contents from `.env.example`.

### 4.4 — Find your computer's IP address and update `.env`

The mobile app on your phone needs to know the address of the backend running on your computer. Since they're on the same Wi-Fi, you need your computer's local IP address.

**On Windows:**
1. Open Command Prompt and run `ipconfig`
2. Look for your active Wi-Fi or Ethernet adapter and find the line:
   `IPv4 Address . . . . . . . . . . : 10.xx.xx.xx` or `192.168.x.x`
3. Copy the IP address.

**On Mac:**
1. Open Terminal and run `ifconfig | grep "inet "`
2. Look for a line that starts with `inet 192.168.` or `inet 10.` (not `127.0.0.1`)
3. Copy the IP address.

Now open `myapp/.env` in VS Code and set the value of `EXPO_PUBLIC_API_URL` to match your IP:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5000/api
```

Example:
```env
EXPO_PUBLIC_API_URL=http://10.48.129.221:5000/api
```

> ⚠️ **Important:** If you switch Wi-Fi networks, your IP address will change and you'll need to update this `.env` file again.

> 💡 **If you're using an Android emulator instead of a real phone**, you can use `http://10.0.2.2:5000/api` — this is a special address that Android emulators use to reach your computer's localhost. If you are using an iOS Simulator, you can use `http://localhost:5000/api`.

### 4.5 — Start the Expo development server

```bash
npm start
```

After a moment, you'll see a **QR code** in the terminal, and the Expo Dev Tools will open in your browser.

### 4.6 — Open the app on your phone

1. Open the **Expo Go** app on your phone (installed in Step 0.4)
2. Tap **"Scan QR Code"**
3. Scan the QR code shown in your terminal or in the browser tab
4. The app will load on your phone! 🎉

> ⚠️ If the QR code scan doesn't work, make sure your phone and computer are on the **same Wi-Fi network**.

---

## Quick Reference — Running Everything Together

Every time you want to work on the project, open **three terminal windows** and run one command in each:

```
┌─────────────────────────────────────┐
│  Terminal 1 — Backend               │
│  cd backend                         │
│  npm run dev                        │
│                                     │
│  ✅ Running at localhost:5000       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Terminal 2 — Admin Portal          │
│  cd admin-portal                    │
│  npm run dev                        │
│                                     │
│  ✅ Open http://localhost:5173      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Terminal 3 — Mobile App            │
│  cd myapp                           │
│  npm start                          │
│                                     │
│  ✅ Scan QR code with Expo Go       │
└─────────────────────────────────────┘
```

> 💡 You only need to run `npm install` and the Prisma setup **once**. After that, just use the three `npm run dev` / `npm start` commands each time you work.

---

## Understanding Mock Mode (OTP & Payments)

Since this is a dev environment, we don't want to send real SMS messages or process real payments. The app runs in **mock mode** by default:

**OTP Login:**
- When you request an OTP on the login screen, no real SMS is sent
- Instead, the OTP code is returned directly in the API response
- The mobile app automatically reads it and fills it in for you
- You just tap **Verify** — no phone number needed

**EMI Payments:**
- Payments are fully simulated — no real money moves
- You can test the full payment flow without any payment gateway credentials

---

## Troubleshooting Common Issues

### ❌ "Cannot connect to database" on backend startup

**Cause:** PostgreSQL isn't running, or the credentials in `.env` are wrong.

**Fix:**
1. Make sure PostgreSQL is running (check Windows Services or run `pg_ctl status`)
2. Double-check the password in `DATABASE_URL` matches what you set during PostgreSQL installation
3. Make sure the database named `svakarma` actually exists (see Step 2.4)

---

### ❌ "The app can't connect to the server" on the mobile app

**Cause:** The `EXPO_PUBLIC_API_URL` in `myapp/.env` is wrong or outdated (e.g. your computer's IP address changed).

**Fix:**
1. Run `ipconfig` (Windows) or `ifconfig` (Mac) to get your current LAN IP
2. Update the IP in `EXPO_PUBLIC_API_URL` inside `myapp/.env`
3. Save the file and restart your Expo server with `npx expo start -c` to clear the cache and load the new IP address.

---

### ❌ The QR code won't scan / Expo Go shows a "Network Error"

**Cause:** Your phone and computer are not on the same Wi-Fi network, or a firewall is blocking the connection.

**Fix:**
1. Make sure both your phone and computer are on the **same Wi-Fi**
2. Temporarily disable your Windows Firewall to test if that's the issue
3. Try pressing `w` in the Expo terminal to open the app in your browser as an alternative

---

### ❌ `npm run prisma:migrate` fails

**Cause:** The database doesn't exist yet or the `DATABASE_URL` is incorrect.

**Fix:**
1. Make sure you created the `svakarma` database (Step 2.4)
2. Check that `DATABASE_URL` in `.env` has the right username and password
3. Try connecting manually: `psql -U postgres -d svakarma`

---

### ❌ "Port 5000 is already in use"

**Cause:** Another process (maybe a previous backend run) is already using port 5000.

**Fix — Windows:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it (replace <PID> with the number you see in the output above)
taskkill /PID <PID> /F
```

Then try `npm run dev` again.

---

### ❌ `npm install` fails with permission errors

**Fix:** Run your terminal as **Administrator** (right-click on Terminal → "Run as administrator") and try again.

---

## Project Structure (For Reference)

```
svakarma-mobile/
├── backend/               ← The server/API
│   ├── prisma/            ← Database schema and migration files
│   ├── src/
│   │   ├── modules/       ← Features: auth, loans, payments, admin, etc.
│   │   └── providers/     ← Swappable SMS & payment integrations
│   └── .env.example       ← Copy this to .env and fill in your values
│
├── admin-portal/          ← Web dashboard (opens in browser)
│   └── src/
│       └── pages/         ← Each page of the admin dashboard
│
└── myapp/                 ← The mobile app
    ├── screens/           ← Each screen of the app
    ├── navigation/        ← How screens are linked together
    └── services/          ← Code that talks to the backend API
```
