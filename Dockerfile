FROM alpine:3.12

LABEL TMPNDOCKER="true"

# 修改镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# install git and ssh
RUN apk update && apk add git && apk add openssh

# init ssh
RUN mkdir ~/.ssh \
    && touch ~/.ssh/id_rsa \
    && chmod 600 ~/.ssh/id_rsa \
    && touch ~/.ssh/id_rsa.pub \
    && chmod 644 ~/.ssh/id_rsa.pub

VOLUME ["~/.ssh/id_rsa","~/.ssh/id_rsa.pub"]

# set git clone default dir
WORKDIR /git/repo