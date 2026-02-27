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
- comment with emojis
- **client-side message expiration**: messages are automatically strikethrough when they reach their expiration time

## Configuration

Launch `npm run config` to create `src/settings.json` (from `src/settings.json.dist`) and update it according your needs.
You should at least change "secret" (used for websocket authentification) and "origin" (your domain).

**Message Expiration Settings:**

- `messageRetentionHours`: Number of hours before messages expire (default: 1)
- This setting controls both server-side message cleanup and client-side strikethrough behavior

## Redis

The application uses Redis for message storage with automatic expiration. Messages are stored in sorted sets with timestamps as scores, allowing efficient range queries and automatic cleanup.

**Key features of Redis usage:**

- Messages are stored with TTL (Time-To-Live) based on `messageRetentionHours` setting
- Hourly cleanup job removes expired messages automatically
- Efficient sorted set operations for message retrieval and expiration

### Setup

docker-compose up -d

### Inspection

docker-compose exec redis redis-cli

### Configuration

Redis settings can be configured in `src/settings.json`:

- `redisHost`: Redis server host (default: "127.0.0.1")
- `redisPort`: Redis server port (default: 6379)
- `redisPassword`: Optional Redis password

Environment variables can override these settings:

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`

## To dev

run `npm run dev:client` to launch client code (with watch) and `npm run dev:server` to launch server code

Webapp is served on port 3000 by devtools while node is launched on port 6060 (explaining while websocket and api calls are made on that port on non production env).

## To deploy on production using only node

Run `npm run build` to generate static files into `build` directory, then run `npm run start` which will serve static files.

## To deploy on production using nginx to serve static file (recommanded)

Run `./build.sh` to generate static files into `build` directory (change `PUBLIC_URL` in that file if needed).

Serve static files via a web server like nginx.
I’m using a symbolic link from `/var/www/semi-persistent-chat` to the `build` directory.

Launch src/server file (I suggest you to use pm2 to launch server via `./pm2.sh`).

Finally, adapt nginx to let pass web socket and `/api` to node :

```
location /persistent-chat-ws/ {
        proxy_pass http://127.0.0.1:6060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
}
location /persistent-chat/api/ {
        proxy_pass http://127.0.0.1:6060/api/;
        proxy_http_version 1.1;
}
```

## License

MIT
