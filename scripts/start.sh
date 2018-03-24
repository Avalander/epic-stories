#!/bin/bash
echo "Starting server..."
npm start >> default.log 2>&1 &
PID=$!
echo $PID > "pid.txt"
echo "Server started [pid: $PID]"