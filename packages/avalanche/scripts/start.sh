#!/bin/bash

cd $GOPATH/src/github.com/ava-labs/avalanchego

./scripts/build.sh

./build/avalanchego \
  --public-ip=127.0.0.1 \
  --http-port=9650 \
  --db-dir=db/node1 \
  --network-id=local \
  --bootstrap-ips= \
  --staking-enabled=false