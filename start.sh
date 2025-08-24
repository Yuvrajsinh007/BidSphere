#!/bin/bash

echo "Starting Online Auction System..."
echo

echo "Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!

echo
echo "Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
