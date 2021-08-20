#!/bin/bash

grep "deb http://security.debian.org/debian-security jessie/updates main"  /etc/apt/sources.list
RES=$?

if  [[ ${RES} != 0 ]]

then
    echo "deb http://security.debian.org/debian-security jessie/updates main" >> /etc/apt/sources.list
    apt update -y && apt install -y --no-install-recommends libssl1.1
fi
    npx prisma migrate dev --name firstMig

npm run prebuild
npm run build
cp package.json ./dist
cp -rf prisma ./dist
cp .env ./dist
cd dist
npm install
cd ..
node dist/src/main.js
