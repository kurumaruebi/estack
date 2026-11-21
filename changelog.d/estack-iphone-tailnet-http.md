### Fixed

- An iPhone build whose `EXPO_PUBLIC_ESTACK_API_URL` is a plain HTTP address, such as a Tailscale `100.x` one, now allows that one address in App Transport Security. iOS does not count the Tailscale range as local, so it blocked the email sign-in request and the app said the account service was unreachable.
