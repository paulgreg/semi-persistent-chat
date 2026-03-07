# Semi Persistent Chat

That project is a simple semi-persistent PWA chat using web socket.
Messages are kept in memory and purged after X hours on the server (configurable).

URLs sent in chat will be transformed as links. For media (image, audio or video), a preview will be displayed.

Login scren:

![Screenshot of login screen](./semi-persistent-chat-login.png 'Login screen')

Chat Screen :

![Screenshot of a chat](./semi-persistent-chat.png 'Chat')

## Features

- multi-room chat
- show media preview (image, video, audio)
- display web page title
- works on mobile
- edit or delete sent messages
- can reply to messages (1 reply level)
- comment with emojis
- **client-side message expiration**: messages are automatically strikethrough when they reach their expiration time

## Configuration

Copy `.env.dist` and update it according your needs.
You should at least change `REDIS_PASSWORD` and `SECRET` (used for websocket authentification) and `ORIGIN` (your domain).

Other settings are : 
- `REDIS_HOST`
- `REDIS_PORT`
- `MSG_RETENTION_HOURS`: Number of hours before messages expires. This setting controls both server-side message cleanup and client-side strikethrough behavior
- `MAX_MSG_SIZE`: max messsage size
- `URL_CACHE` : max number of summary urls in cache

## Redis

The application uses Redis for message storage with automatic expiration. Messages are stored in sorted sets with timestamps as scores, allowing efficient range queries and automatic cleanup.

**Key features of Redis usage:**

- Messages are stored with TTL (Time-To-Live) based on `messageRetentionHours` setting
- Hourly cleanup job removes expired messages automatically
- Efficient sorted set operations for message retrieval and expiration

### Start redis

    docker-compose up -d

### Redis inspection

    docker-compose exec redis redis-cli
    auth "redis-password"

## To dev

run `npm run dev:client` and `npm run dev:server`. Go to http://localhost:6060 (or what you set in PORT)
Server will inject env vars and inject vite middleware in dev.

## To deploy on production using only node

Run `npm run build` to generate static files into `build` directory, then run `npm run start` which will serve static files.

## nginx configuration

```
location /persistent-chat/ {
        proxy_pass http://127.0.0.1:6060/api/;
        proxy_http_version 1.1;
}
location /persistent-chat-ws/ {
        proxy_pass http://127.0.0.1:6060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
}
```

## License

MIT
