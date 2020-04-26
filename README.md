# Semi Persistent Chat

That project is a simple semi-persistent PWA chat using web socket.
Messages are kept in memory and purged after X hours (configurable).

Login scren: 

![Screenshot of login screen](./semi-persistent-chat-login.png "Login screen")

Chat Screen : 

![Screenshot of a chat](./semi-persistent-chat.png "Chat")

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Configuration

Copy `src/config.json.dist` into `src/config.json` and update values according your needs.

## To dev

run `npm run start` and `node server`

## To deploy on production

Run `./build.sh` to generate static files into `build` directory.

Serve static files via a web server (node is not serving them).
I’m using a symbolic link from `/var/www/semi-persistent-chat` to the `build` directory.

Launch src/server code (I suggest you to use pm2 to launch server via `./pm2.sh`).

And adapt nginx to let pass web socket to node :

```
location /persistent-chat-ws/ {
        proxy_pass http://127.0.0.1:6060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
}
```
