#!/bin/bash
PUBLIC_URL=/spchat/ npm run build
chown www-data: -R build
