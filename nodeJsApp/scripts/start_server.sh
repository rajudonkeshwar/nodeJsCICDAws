#!/bin/bash
cd /home/ec2-user
pm2 stop all || true   # Stop previous runs
pm2 start app.js
