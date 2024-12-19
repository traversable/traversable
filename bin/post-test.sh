#!/bin/bash -e

function cleanup {
  ./bin/as-const.sh ./packages/registry/src/tmp/node-weight-by-type.json WeightByType
}

trap cleanup EXIT
