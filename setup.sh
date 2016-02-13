#!/bin/bash

if ! type sudo &>/dev/null
	then
		sudo() {
			echo "$@"
			"$@"
		}
	fi

sudo npm install -g npm
sudo npm install -g electron-packager
sudo npm install -g electron-builder
npm install
(cd app && npm install)