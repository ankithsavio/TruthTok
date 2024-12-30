<p align="center">
  <img src="assets/TruthTok Logo Design.webp" alt="TruthTok Logo" width="200">
</p>

# TruthTok Platform 📱

[![GitHub license](https://img.shields.io/github/license/NethermindEth/TruthTok)](https://github.com/NethermindEth/TruthTok/blob/main/LICENSE)
[![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue.svg?logo=telegram)](https://t.me/truth_tok)
[![Contributors](https://img.shields.io/github/contributors/NethermindEth/TruthTok)](https://github.com/NethermindEth/TruthTok/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/NethermindEth/TruthTok)](https://github.com/NethermindEth/TruthTok/commits/main)

> Bringing truth back to news through verified, real-world video content.

## What is TruthTok? 🤔
TruthTok is a new approach to media. It removes humans from the loop and relies on verified video feeds to create a real-time news platform that reports only on concrete facts: when, what, and where.

TruthTok relies on the current push to create verified media, such as [C2PA](https://c2pa.org/) and [Veritas](https://eprint.iacr.org/2024/1066.pdf), to create a “real video” repository. Real videos have concrete proofs of their creation, proving that they were

1. Filmed by a real camera
2. Filmed at a specific location
3. Filmed at a particular time
4. Minimally edited

Advancements in trusted execution in hardware, cryptographic techniques to prove video transformation, and advancements in distributed networks to prove geolocation are making this possible soon.

We can create a new news outlet from this repository of real videos. Using video-to-text and multimodal models, we can interpret the videos' events, aggregate them into a single comprehension, and publish concrete, verifiable statements about global events.

The news feed would contain concrete facts about the events. The news created will provide little to no context around the human interpretation of these events—this is left up to the platform's users.

### Examples:

> 15 videos have shown that there was a protest of at least 100 people in trafalgar square.
Signs in the protest stated “NHS collapse” and made comments about torry politics.
Sources: video1, video2, video3
> 

> A series of explosions have occurred in Jaipur
There were at least two explosions within 20 minutes of each other
Sources: video1, video2, video3
> 

The news will only contain concrete facts about the videos. Platform users can discuss the interpretation of the events in a thread-like fashion underneath the news stories.

## User experience

The app allows users to create video content super quickly; a single shortcut on a user's phone will activate the camera and start uploading and verifying the authenticity of the data. Proving the authenticity of this media is currently not concretely possible, but we expect this technology to become ubiquitous in 2 to 3 years.

We can potentially use AI to automatically and securely reward users for filming unique, newsworthy content. (this dives into a thorny ethics debate about proactively incentivising content creation. Jorik assumes it likely will not work)

### Technical details

TruthTok will rely on an open permissionless registry of verified media.

## Architecture 🏗️

[![TruthTok Architecture](https://link.excalidraw.com/readonly/PP4YtXlYNGSmus20AN2c?darkMode=true)](https://link.excalidraw.com/readonly/PP4YtXlYNGSmus20AN2c?darkMode=true)

Click on the diagram to view it in full size.

## Quick Links 🔗

<!-- - [Documentation](https://docs.truthtok.com) -->
<!-- - [API Reference](https://api.truthtok.com) -->
- [Contributing Guidelines](CONTRIBUTING.md)
<!-- - [Code of Conduct](CODE_OF_CONDUCT.md) -->

## Stats 📊

[![Active Users](https://img.shields.io/badge/dynamic/json?color=blue&label=Active%20Users&query=$.active_users&url=https://api.truthtok.com/stats)](https://truthtok.com/stats)
[![Videos Verified](https://img.shields.io/badge/dynamic/json?color=green&label=Videos%20Verified&query=$.verified_videos&url=https://api.truthtok.com/stats)](https://truthtok.com/stats)
[![News Stories](https://img.shields.io/badge/dynamic/json?color=orange&label=News%20Stories&query=$.stories&url=https://api.truthtok.com/stats)](https://truthtok.com/stats)
[![Trust Score](https://img.shields.io/badge/dynamic/json?color=purple&label=Trust%20Score&query=$.trust_score&url=https://api.truthtok.com/stats)](https://truthtok.com/stats)

## Support 💪

If you believe in bringing truth back to news:

- ⭐ Star this repository
- 🐛 [Report bugs](https://github.com/NethermindEth/TruthTok/issues)
- 💡 [Suggest features](https://github.com/NethermindEth/TruthTok/issues)
- 🔄 [Contribute](CONTRIBUTING.md)

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <a href="https://t.me/truth_tok">
    <img src="https://img.shields.io/badge/Join-Telegram-blue.svg?style=for-the-badge&logo=telegram" alt="Join Telegram">
  </a>
</p> 