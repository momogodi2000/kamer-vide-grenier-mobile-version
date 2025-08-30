/**
 * Registers the FCM token for the current user and sends it to the backend.
 * Since Firebase is removed, this is now a no-op function.
 * Should be called after user login and whenever the token may change.
 */
export async function registerFcmToken() {
  // Firebase FCM token registration removed
  // This function is kept for compatibility but does nothing
  console.log('FCM token registration skipped - Firebase removed');
  return;
}
