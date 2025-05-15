NODE_ENV=production pm2 start dist/server/index.js --name 'semi-persistent-chat' --max-memory-restart 256M
