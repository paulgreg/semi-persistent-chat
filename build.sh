#!/bin/bash
npm run browserlist
sudo chown -R $USER dist
npm run build
sudo chown -R www-data: dist
