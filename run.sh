#!/bin/bash
clear
brew services restart redis
nodemon /Users/mdagostino/workspace/utn/proyecto/hali/src/server.js
