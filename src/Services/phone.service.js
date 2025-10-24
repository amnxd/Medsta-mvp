import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/Services/firebase.js';

let recaptchaInitialized = false;

export function ensureRecaptcha() {
  if (recaptchaInitialized) return;
  if (!document.getElementById('recaptcha-container')) {
    const div = document.createElement('div');
    div.id = 'recaptcha-container';
    div.style.display = 'none';
    document.body.appendChild(div);
  }
  // Invisible reCAPTCHA bound to container
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
  });
  recaptchaInitialized = true;
}

// Legacy helper (not used directly by UI anymore)
export async function linkPhoneToCurrentUser(phoneNumber) {
  if (!auth.currentUser) throw new Error('No authenticated user to link phone to');
  ensureRecaptcha();
  const verifier = window.recaptchaVerifier;
  const confirmation = await linkWithPhoneNumber(auth.currentUser, phoneNumber, verifier);
  const code = window.prompt('Enter the verification code sent to your phone');
  if (!code) throw new Error('Verification code not provided');
  await confirmation.confirm(code);
  return true;
}

// Starts phone linking and returns the ConfirmationResult
export async function startPhoneLinking(phoneNumber) {
  if (!auth.currentUser) throw new Error('No authenticated user to link phone to');
  ensureRecaptcha();
  const verifier = window.recaptchaVerifier;
  const confirmation = await linkWithPhoneNumber(auth.currentUser, phoneNumber, verifier);
  return confirmation;
}
