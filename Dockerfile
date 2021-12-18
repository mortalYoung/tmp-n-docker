FROM alpine:3.12

LABEL TMPNDOCKER="true"

# 修改镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# install git
RUN apk update && apk add git

# set git clone default dir
WORKDIR /git/repo

# EOF