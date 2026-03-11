module.exports = {
  apps: [
    {
      name: 'semi-persistent-chat',
      script: 'dist/server/index.js',
      max_memory_restart: '384M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

