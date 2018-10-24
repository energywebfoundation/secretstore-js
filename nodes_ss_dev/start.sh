#!/bin/bash
RUST_LOG=secretstore=debug,secretstore_net=debug ../parity --config ./conf_dev_alice.toml &
RUST_LOG=secretstore=debug,secretstore_net=debug ../parity --config ./conf_dev_bob.toml &
RUST_LOG=secretstore=debug,secretstore_net=debug ../parity --config ./conf_dev_charlie.toml
