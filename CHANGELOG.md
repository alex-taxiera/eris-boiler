# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] TBD

### Added
- This Changelog
- Command responses can now be sent via webhook
  - Responses with `webhook: true` will be send via webhook
  - Set webhook `username` and `avatarURL`

### Removed
- Command parameter length validation
  - This validation did not take optional parameters into consideration

### Fixed
- Exception with generic commands executed in DM
- SQL Manager add
- SQL Manager update
