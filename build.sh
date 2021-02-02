#!/bin/bash
sudo chown -R $USER build
PUBLIC_URL=/spchat/ npm run build
sudo chown -R www-data: build
