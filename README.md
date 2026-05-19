# IEC 60870-5-104 Simulator

[![GitHub Release](https://img.shields.io/github/v/release/Karl-Dai/IEC60870-5-104-Simulator)](https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()

[中文版](README_CN.md)

A cross-platform IEC 60870-5-104 protocol simulator built with **Rust** + **Tauri 2** + **Vue 3**, featuring both a Slave (server) and Master (client) application.

## Screenshots

### Master · multi-CA on one TCP link

One IEC 104 master connection can talk to several stations (Common Addresses) at once.
Configure the CA list as `1, 2, 3` in the **New Connection** dialog and the connection tree
automatically expands to **Connection → CA badge → category**, with per-CA point counts —
so two stations sharing the same IOA never collide on screen.

![Master multi-CA tree + new connection dialog](docs/screenshots/master-multi-ca-newconn.png)

### Master · communication log with TLS handshake & per-CA GI

The bottom log panel shows every TLS handshake step, U/I/S frame, COT decode, and the raw
hex bytes side-by-side. Here the master sends **GI CA=1** and **GI CA=2** in sequence and
receives the spontaneous response stream from each station.

![Master communication log with TLS + multi-CA GI](docs/screenshots/master-multi-ca-comm-log.png)

## Download

Pre-built installers for Windows, macOS, and Linux are available on the [Releases](https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases) page.

## Features

### Slave (IEC104Slave)

- **IEC 104 server** with TCP and TLS support
- **8 data types**: Single Point, Double Point, Step Position, Bitstring, Normalized, Scaled, Short Float, Integrated Totals
- **Data point management**: Add single or batch points with IOA range and ASDU type selection
- **Random mutation**: Simulate value changes at configurable intervals
- **Spontaneous transmission** (COT=3): Automatically sends changed values to connected masters
- **Cyclic transmission**: Periodic data sending with configurable interval
- **General Interrogation** (GI) and **Counter Interrogation** response
- **Control command handling**: Single, Double, Step, and Setpoint commands
- **Communication log** with hex frame display and CSV export
- Auto-start server on creation

### Master (IEC104Master)

- **IEC 104 client** with TCP and TLS support
- **Multi-CA per connection**: drive 1..N Common Addresses over a single TCP link.
  Auto-GI / Clock Sync / Counter Read fan out to every CA; data is stored
  per-CA so colliding IOAs from different stations stay separate.
- **Three-level connection tree** for multi-CA setups (Connection → CA badge →
  category) with independent per-CA category counts; single-CA connections
  keep the classic flat tree.
- **Real-time data display** with incremental polling and virtual scrolling
- **Category tree** with live point counts (SP, DP, ST, BO, ME_NA, ME_NB, ME_NC, IT)
- **Custom Control button** in the toolbar opens a free-form command dialog
  (CA dropdown of the connection's configured CAs, type any IOA + value).
  Stays open after a successful send so you can iterate; remembers your
  last CA / IOA / type / value across opens via localStorage.
- **Control commands**: Direct Execute and Select-before-Operate (SbO);
  right-click on any point sends to its actual source CA in multi-CA setups
- **Value panel** showing selected point details
- **General Interrogation**, **Counter Read**, and **Clock Sync** commands
- **Communication log** with TLS handshake events, U/I/S frame decode,
  COT names, raw hex bytes, and CSV export
- **In-app auto-update** from GitHub Releases (ed25519-signed bundles,
  6 h check throttle, "later" snoozes 24 h)

## Architecture

```
IEC104Sim/
├── crates/
│   ├── iec104sim-core/     # Core IEC 104 protocol library
│   ├── iec104sim-app/      # Slave Tauri application
│   └── iec104master-app/   # Master Tauri application
├── frontend/               # Slave Vue 3 frontend
└── master-frontend/        # Master Vue 3 frontend
```

## Prerequisites

- [Rust](https://rustup.rs/) (1.77+)
- [Node.js](https://nodejs.org/) (18+)
- [Tauri CLI](https://tauri.app/) (`cargo install tauri-cli`)

## Quick Start

### Install dependencies

```bash
cd frontend && npm install
cd ../master-frontend && npm install
```

### Run Slave

```bash
cd crates/iec104sim-app
cargo tauri dev
```

### Run Master

```bash
cd crates/iec104master-app
cargo tauri dev
```

### Usage

1. **Slave**: Click "New Server" → server auto-starts on port 2404 with default data points
2. **Master**: Click "New Connection" → enter `127.0.0.1:2404` → Connect → Send GI
3. Master's IOA table displays all received data points
4. **Slave**: Click "Random Mutation" to simulate value changes → Master receives spontaneous updates

## IEC 104 Protocol Support

| Feature | Supported Types |
|---------|----------------|
| Monitor (Slave→Master) | M_SP_NA/TB, M_DP_NA/TB, M_ST_NA/TB, M_BO_NA/TB, M_ME_NA/TD, M_ME_NB/TE, M_ME_NC/TF, M_IT_NA/TB |
| Control (Master→Slave) | C_SC_NA, C_DC_NA, C_RC_NA, C_SE_NA/NB/NC |
| System | C_IC_NA (GI), C_CI_NA (Counter), C_CS_NA (Clock Sync) |
| COT | Spontaneous(3), Activation(6), ActivationCon(7), ActivationTerm(10), Interrogated(20), CounterInterrogated(37) |
| Transport | TCP, TLS (mutual TLS supported) |

## Tech Stack

- **Backend**: Rust, Tokio (async runtime), native-tls
- **Frontend**: Vue 3, TypeScript, Vite
- **Desktop**: Tauri 2

## Changelog

See [CHANGELOG.md](CHANGELOG.md) or the [Releases page](https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases).

### Auto-update

Starting from v1.0.9, both apps check GitHub Releases on startup and prompt the user to install
new versions. Users on v1.0.8 or earlier need to upgrade manually one time.

### First launch on macOS

The bundles are **not Apple-notarized** (no paid Developer Program). On first launch
macOS shows *"IEC104Slave / IEC104Master cannot be opened — Apple could not verify…"*
with only *Done* and *Move to Trash* buttons. This is the standard macOS 15 (Sequoia)
block for ad-hoc-signed apps — the app is **not damaged**.

**Allow it (pick one):**

1. **GUI path**:
   - Double-click the `.app`, see the block dialog, click *Done*
   - Open *System Settings → Privacy & Security*, scroll to the bottom
   - You'll see *"IEC104Slave was blocked…"*, click *Open Anyway* → enter password
   - The next dialog has an *Open* button; click it. Subsequent launches go straight through.

2. **One-line Terminal**:

   ```bash
   xattr -dr com.apple.quarantine "/Applications/IEC104Slave.app"
   xattr -dr com.apple.quarantine "/Applications/IEC104Master.app"
   ```

   Strips the quarantine flag so macOS stops blocking.

If you instead see *"is damaged, can't be opened"*, that's a v1.1.1-or-earlier build
with no signature at all — upgrade to v1.1.2+ (the in-app updater will push it) or
run the `xattr` command above.

## License

MIT
