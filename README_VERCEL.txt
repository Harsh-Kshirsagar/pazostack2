PAZOSTACK — VERCEL WEBSITE WITH USER LOGIN

PROJECT FILES
- index.html: the existing application (original business screens and calculations retained)
- logo.png: original logo image
- api/auth/: Vercel serverless login, session-check, and logout endpoints
- lib/auth.js: signed-session and password-verification helpers
- scripts/generate_password_hash.py: local utility to create a secure password hash
- package.json: selects the Node.js runtime used by the login endpoints

USER LOGIN
- A sign-in screen appears before the existing application opens.
- Login is verified on the server by Vercel API routes. The password is stored as a scrypt hash, not in the HTML or browser JavaScript.
- This version has one configured login account and no public sign-up page.
- Sessions use a signed, HttpOnly cookie and expire after 12 hours.

CREATE YOUR LOGIN PASSWORD
1. Install Python 3 on your computer if it is not already installed.
2. Open PowerShell in the project folder.
3. Run: python scripts/generate_password_hash.py
4. Enter a password with at least 12 characters. Copy the complete scrypt$... value printed by the script. The password itself is not printed.

DEPLOY ON VERCEL
1. Extract this ZIP. Make sure the project root contains index.html, package.json, api/, lib/, scripts/, and logo.png.
2. Upload the contents of this folder to a GitHub repository. Do not upload the ZIP file itself and do not place the files one folder deeper than the repository root.
3. In Vercel, select Add New > Project, import that GitHub repository, and open Configure Project.
4. Use these settings:
   - Framework Preset: Other
   - Root Directory: ./ (the folder containing index.html and package.json)
   - Build Command: leave blank
   - Output Directory: .
   - Install Command: leave blank
5. Before deploying, open Environment Variables and add these three variables:
   - PAZOSTACK_LOGIN_USERNAME = the username you choose
   - PAZOSTACK_LOGIN_PASSWORD_HASH = the complete scrypt$... value generated above
   - PAZOSTACK_SESSION_SECRET = a new random secret of at least 32 characters
6. To generate the session secret in PowerShell, run:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   Copy the output into PAZOSTACK_SESSION_SECRET. Do not share or commit this value.
7. Add the variables to the Production environment. Also select Preview/Development only if you need login on those deployment types.
8. Click Deploy. After deployment, open the Vercel URL and sign in with the username and original password (not the password hash).

LOCAL TESTING (OPTIONAL)
- The login uses serverless API routes, so do not open index.html directly or use Live Server on its own.
- After linking the folder to the Vercel project, run `vercel env pull .env.local` and then `vercel dev` to test locally. Keep `.env.local` private; it is ignored by Git.

VERCEL RUNTIME SETTINGS
- The project uses the Node.js 22.x runtime for the login API routes.
- No frontend build step or third-party npm package is required.

DATA LIMITS — IMPORTANT
- Only user login has been added. The existing application screens, calculations, CSV export, and business-record logic remain as they were.
- Existing business records still use this browser's localStorage. Data is not shared between users, browsers, or devices and is not automatically backed up to a central database.
- Login controls access to the app interface; it does not turn localStorage into a protected multi-user database. Do not use this version as a shared system or as secure storage for confidential employee, payroll, contractor, or financial records without a separate protected business-data backend and user-level permissions.
- The original Claude-hosted shared database integration is not available on Vercel.
