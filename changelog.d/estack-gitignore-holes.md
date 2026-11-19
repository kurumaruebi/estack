### Security

- `.gitignore` now also refuses the Android and iOS Firebase service configs, the Android keystore and its credentials file, and an instance-local VPS settings file, so a later accidental commit of any of them is stopped at the source.
