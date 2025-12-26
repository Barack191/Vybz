// Simple script to start the server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Zerclix Technologies server...');

// Start the server
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});