# Color & Learn — iPhone/iPad source

Requires macOS, Xcode, and [XcodeGen](https://github.com/yonaskolb/XcodeGen).

1. `cd mobile/ios && xcodegen generate`
2. Open `ColorLearn.xcodeproj` in Xcode.
3. Set the signing team (Apple Developer account); adjust bundle ID if already registered.
4. Select a device and run. Test Arabic/English UI, cart, contact, privacy, downloads, and links.
5. Use Product → Archive to prepare App Store submission after review.

This is an iOS **source project**, not a signed IPA. The storefront checkout is currently a simulation. A simple website wrapper may be rejected under App Review rule 4.2; implement substantial native functionality before App Store submission. Digital products may need Apple's In-App Purchase depending on storefront/region and applicable guidelines.
