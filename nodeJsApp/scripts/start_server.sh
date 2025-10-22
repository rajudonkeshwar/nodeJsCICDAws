#!/bin/bash
cd /home/ec2-user
sudo npm install -g pm2
pm2 stop all || true   # Stop previous runs
pm2 start app.js
