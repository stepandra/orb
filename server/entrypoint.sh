#!/bin/bash
cd orbitez-server && npm i && CONTRACT_ADDRESS=${CONTRACT_ADDRESS} SERVER_NAME=${SERVER_NAME} node src/index.js