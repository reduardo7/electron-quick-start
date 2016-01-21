rem https://github.com/loopline-systems/electron-builder

echo "Install first: http://sourceforge.net/projects/nsis/?source=typ_redirect"

pause

rem npm install -g npm
rem npm install -g electron-packager
rem npm install -g electron-builder
rem npm install

set PATH=%PATH%;C:\Program Files (x86)\NSIS
npm run build:win