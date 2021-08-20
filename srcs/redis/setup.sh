#!/bin/bash

mkdir /etc/redis
touch /etc/redis/redis.conf

echo "port 6378" > /etc/redis/redis.conf
echo "appendonly yes" >> /etc/redis/redis.conf

redis-server /etc/redis/redis.conf