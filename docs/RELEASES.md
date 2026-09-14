# Update and release policy

## Current repository state

- `main` is the canonical source branch, and accepted changes reach it through reviewed pull requests after required checks pass.
- The integration version is [`0.9.7`](../custom_components/zont_local/manifest.json).
- At the 2026-09-14 audit baseline, this repository had no Git tags or GitHub Releases. Existing documentation describes a commit-based custom-HACS channel from `main`.
- End-to-end acceptance that HACS exposes and installs the current `main` state was not performed by that audit. A merged commit is accepted source, not confirmed user delivery, until verification succeeds in the target Home Assistant installation.

## Acceptance gate

Before an update is presented to users:

1. UI, integration, HACS and Hassfest checks pass for the reviewed commit.
2. The target installation verifies telemetry truth, DHW state semantics, controller loss and recovery, panel restart behavior and the installed bundle.
3. The accepted commit SHA and integration version are recorded, and the previous accepted state remains available for rollback.
4. `CHANGELOG.md` describes the user-visible change.

Creating a tag or GitHub Release is a separate publication decision. This policy does not create one or claim that a release-based HACS channel is already configured.
