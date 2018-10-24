#!/bin/bash
RUST_LOG=secretstore=debug,secretstore_net=debug ../parity --config ./conf_dev_alice.toml db kill &
RUST_LOG=secretstore=trace,secretstore_net=trace ../parity --config ./conf_dev_bob.toml db kill &
RUST_LOG=secretstore=trace,secretstore_net=trace ../parity --config ./conf_dev_charlie.toml db kill

# only works if script is executed from this file's folder
FILEDIR=`dirname "$0"`
rm -rf $FILEDIR/db.dev_ss_alice/secretstore/db
rm -rf $FILEDIR/db.dev_ss_bob/secretstore/db
rm -rf $FILEDIR/db.dev_ss_charlie/secretstore/db
