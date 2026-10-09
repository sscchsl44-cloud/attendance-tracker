# Personal Attendance Tracker — deploy on Netlify (with email verification)

Files:
- index.html                          the whole app
- netlify.toml                        tells Netlify where the functions are
- netlify/functions/send-otp.mjs      emails an 8-digit code to YOUR Gmail
- netlify/functions/verify-otp.mjs    checks the code

Environment variables (Netlify -> Site configuration -> Environment variables):
- RESEND_API_KEY   API key from resend.com (sign up with the SAME Gmail you want codes on)
- RECOVERY_EMAIL   your Gmail (must be the email of your Resend account)
- OTP_SECRET       any long random text (e.g. 40 random characters)

Without these variables the app still works; "Forgot PIN" then uses the recovery code instead.
