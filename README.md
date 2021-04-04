# Semi Persistent Chat

You can try it here : https://semi-persistent-chat.herokuapp.com/

The app is hosted on an Heroku free account so it comes with limitations : app is put in sleep if inactive meaning messages will be lost and it will take some seconds to wake up.

I strongly encourage you to host it yourself !

That project is a simple semi-persistent PWA chat using web socket.
Messages are kept in memory and purged after X hours (configurable).

Login scren:

![Screenshot of login screen](./semi-persistent-chat-login.png 'Login screen')

Chat Screen :

![Screenshot of a chat](./semi-persistent-chat.png 'Chat')

URLs sent in chat will be transformed as links and, if it’s an image/audio/video file, a preview will be displayed.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Configuration

Launch `npm run config` to create `src/config.json` (from `src/config.json.dist`) and update it according your needs.

## To dev

run `npm run dev:client` to launch client code (with watch) and `npm run dev:server` to launch server code

## To deploy on production using only node

Run `./build.sh` to generate static files into `build` directory.
Run `npm run start` which will serve static files.

## To deploy on production using nginx to serve static file (recommanded)

Run `./build.sh` to generate static files into `build` directory.

Serve static files via a web server like nginx.
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
location /persistent-chat/api/ {
        proxy_pass http://127.0.0.1:6060/api;
        proxy_http_version 1.1;
}
```

## To deploy on heroku

```
git push heroku master
```