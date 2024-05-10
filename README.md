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
 - update sent messages
 - comment with emojis 
 - messages are saved in `tmp-data/semi-persistent-chat-dump.json` when server is halted and restored on next startup (to keep messages duging system update)


## Configuration

Launch `npm run config` to create `src/config.mjs` (from `src/config.mjs.dist`) and update it according your needs.


## To dev

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

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