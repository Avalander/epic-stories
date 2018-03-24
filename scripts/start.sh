#!/bin/bash
echo "Starting server..."
NODE_PATH=server:shared node server/index.js >> default.log 2>&1 &
PID=$!
echo $PID > "pid.txt"
echo "Server started [pid: $PID]"