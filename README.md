# n8s

docker in Node.js


## How to start
```shell
yarn
yarn watch
```

```shell
yarn build
yarn start
```


## 镜像、容器

### 创建基础镜像
```shell
docker build -t n8s:1.0.0 .
```

### 创建并后台运行容器
```shell
docker run -p 9000:9000 -itd --name liuyi_dt-tag n8s:1.0.0
```

### 进入容器
```shell
docker exec -it liuyi_dt-tag /bin/sh
```


## TODO

- 功能列表

- [x] 1、基于 Dockerfile 创建基础 images，目前命名为 `n8s`，images 中需要包括 git、ssh、nodejs、yarn 的命令
- [ ] 2、为了确保用户不需要在每次新建仓库的时候都创建 ssh，所以需要把本机的 ssh 挂载到 docker 容器对应的文件夹中
- [ ] 3、基于基础 images 创建不同的 containers，不同的 containers 需要做好标记，因为需要去通过某一个更具有意义性的值去查找 containers，而不是通过 containers 的 id。目前通过 `账号+仓库名`(如：liuyi_dt-tag) 进行标记
- [ ] 4、创建容器后，支持 git clone ssh 地址拉取仓库代码，并且通过 ReadableStream 和 process.stdout/stderr 把终端消息传输出来
- [ ] 5、支持在容器中执行命令行，并且可以 pipe 命令行执行结果
