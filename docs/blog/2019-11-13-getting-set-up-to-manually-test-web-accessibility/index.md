---
title: "Getting Set Up to Manually Test Web Accessibility"
date: 2019-11-13
author: Madalyn Parker
canonicalLink: https://dev.to/madalynrose/getting-set-up-to-manually-test-web-accessibility-3gon
excerpt: "Manual testing accessibility requires some setup and base knowledge. Get ready to fire up your screen reader."
tags:
  - accessibility
  - testing
  - setup
  - a11y
---

## The Basics

When I sat down with my brand new work computer, I wanted to get set up to manually test accessibility using as many browsers as I could. This meant keeping in mind a few key things and going through some extra steps. These steps are for using free screen readers with a Mac development environment.

I'm going to lay out:

- Free Screen Readers
- Browser/Screen Reader combinations
- Extra configuration needed to test your project on different platforms

While this post will focus solely on setup, later posts in this series will cover other parts of accessibility manual testing.

Please reach out if there are other topics you'd like to hear about!

## Screen Readers

Windows

- [Narrator](https://support.microsoft.com/en-us/help/22798/windows-10-complete-guide-to-narrator) (made by Microsoft, pre-installed)
- [NVDA](https://www.nvaccess.org/about-nvda/) (most popular free solution)

OSX

- [VoiceOver](https://help.apple.com/voiceover/mac/10.15/) (made by Apple, pre-installed)

iOS

- [VoiceOver](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios) (made by Apple, pre-installed)

Android

- [TalkBack](https://support.google.com/accessibility/android/answer/6007100?hl=en&ref_topic=3529932) (made by Google, pre-installed)

## Browser/Screen Reader Besties

When working on a11y at a previous company, I worked closely with a team at Microsoft. They recommended that I only test Internet Explorer with NVDA and Edge with Narrator. This notion of technology pairings is important for testing since some combinations do not play well together and some combinations aren't widely used.

Below are pairings in order of usage (omitting paid screen readers) according to a September 2019 [survey](https://webaim.org/projects/screenreadersurvey8/) of screen reader users:

- NVDA & Firefox
- NVDA & Chrome
- VoiceOver & Safari
- VoiceOver & Chrome
- NVDA & Internet Explorer

Narrator & Edge is not explicitly in the survey but I think it's still worth testing as Edge's adoption increases.

## Extra configuration

### Browsers

Safari requires an extra setting to allow keyboard navigation:

1. Open up Preferences > Advanced in Safari
2. check "Press Tab to highlight each item on a webpage" under the "Accessibility" section

![Safari's Preferences window with "press tab to highlight each item on a webpage checked"](https://thepracticaldev.s3.amazonaws.com/i/q87r4si3i1f4riat79b5.png)

### Mobile Devices

If you have an IRL mobile device you'd like to use to test out mobile screen readers and other assistive apps you can reach localhost there too!

#### Android

To access localhost from your Android device you'll need to do (more than) a few things:

1. First off, make sure your phone has developer options. You can do this by navigating to `Settings > System > About Phone` and then tapping **Build number** (the very bottom entry) **seven** times.
2. Now there should be a new list of settings under `Settings > System > Advanced > Developer Options`. Go here and enable _USB Debugging_
3. Connect your device to your development machine via USB.
4. From Chrome, access the remote devices panel in DevTools (under `More Tools > Remote Devices`).
5. You should see that there is a pending device at the top of the list of devices. Your phone should have a pop-up prompt asking you to accept remote debugging. Accept remote debugging from your phone.
6. Now you need to enable Port Forwarding from Settings in the Remote devices tab in DevTools. (Settings are at the very bottom of the list of devices so you may have to scroll down to find them) Check the box to enable it and then click the _Add Rule_ button to create a port for your phone to access what's in your browser. Type in the port you want to use on your phone on one side (e.g. `3000`) and the local address you want to access from your computer (e.g. `http://localhost:9000/` for a served Gatsby site)
7. Boom! If you go to `http://localhost:3000/` on your phone you'll see your site!

#### iOS

1. Make sure both your device and your computer are on the same WiFi network.
2. Make sure you specify the host as `0.0.0.0` when you run your server. (e.g. `gatsby serve --host=0.0.0.0`)
3. On your Mac, go to `Settings > Sharing`. You can find the address for your computer's localhost in fine print under where it says "Computer Name." It will be in the format of `computer-name.local`. You can edit this address by clicking the "Edit..." button. (e.g. I changed mine to `gatsby.local` so it would be easier to type on my device)
4. On your iOS device, navigate to the address determined in the previous step with your port specified. (e.g. `gatsby.local:9000`)

NOTE: My device tried to fill in the URL by adding `www.` at the beginning. If you're having trouble reaching your localhost, make sure there is no `www.` in your address bar.

### Virtual Environments

#### VirtualBox

I downloaded a Windows 10 virtual machine from the [Windows Dev Center](https://developer.microsoft.com/en-us/windows/downloads/virtual-machines)

You can access your host computer's localhost from `10.0.2.2`.

#### Parallels

Parallels is a paid product, but since it requires extra configuration to access localhost I figured I'd cover that here too.

When serving your site, make sure you are hosting it on `0.0.0.0`. For example, if I am running a Gatsby site I'd do `gatsby serve --host=0.0.0.0`

Then, from your Parallels machine you can access localhost from `10.211.55.2`

## Up Next

There will be more posts in this series to equip you to manually test the accessibility of websites. For now, topics and timing are still up for discussion.

I hope to cover topics like:

- Navigating the web using the keyboard
- Screen reader tips and shortcuts
- Testing techniques and methods
- Other assistive technologies

What would you like to see? Do you have tips you'd like to share?
