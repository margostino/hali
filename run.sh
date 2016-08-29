#!/bin/bash
clear
brew services restart redis
nodemon src/server.js
