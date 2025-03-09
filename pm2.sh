NODE_ENV=production pm2 start src/server/index.ts --name 'semi-persistent-chat' --max-memory-restart 128M
