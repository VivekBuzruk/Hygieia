UI_VERSION=3.1.1-STech
# mkdir -f UI-${UI_VERSION}
# mv dist UI-${UI_VERSION}
tar -cvf UI-${UI_VERSION}.tar dist
# mv  UI-${UI_VERSION}/dist .
gzip UI-${UI_VERSION}.tar
scp UI-${UI_VERSION}.tar.gz vbuzruk@192.168.1.92:/home/vbuzruk/dwork/myHygieia/hygieia-starter-kit/hygieia-starter-kit/ui

