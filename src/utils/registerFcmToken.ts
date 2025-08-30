import { getFcmToken } from '../services/fcmService';
import { firebaseAuth } from '../services/firebaseService';

/**
 * Registers the FCM token for the current user and sends it to the backend.
 * Should be called after user login and whenever the token may change.
 */
export async function registerFcmToken() {
  const user = firebaseAuth.currentUser;
  if (!user) return;
  const idToken = await user.getIdToken();
  const fcmToken = await getFcmToken();
  if (!fcmToken) return;
  try {
    await fetch('https://your-backend-domain.com/api/user/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });
  } catch (err) {
    // Optionally log or handle error
    console.error('FCM token registration failed:', err);
  }
}
