### Fixed

- Email sign-in of a build with `EXPO_PUBLIC_ESTACK_API_URL` set now uses that account service in a released build too: before, only a development build could name one, so a personal iPhone build with no public account API could not sign in with an email code.
