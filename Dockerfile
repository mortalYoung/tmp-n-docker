FROM alpine:3.12

LABEL N8S="true"

# 修改镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# install git, ssh, nodejs, npm, yarn
RUN apk update && apk add git && apk add openssh && apk add nodejs && apk add npm && apk add yarn

# init ssh
RUN mkdir ~/.ssh \
    && touch ~/.ssh/id_rsa \
    && chmod 600 ~/.ssh/id_rsa \
    && touch ~/.ssh/id_rsa.pub \
    && chmod 644 ~/.ssh/id_rsa.pub

# 在镜像中挂载本机文件
# VOLUME ["~/.ssh/id_rsa","~/.ssh/id_rsa.pub"]

# set git clone default dir
WORKDIR /git/repo
