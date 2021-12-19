docker in Node.js


## How to start
```shell
yarn watch
yarn start
```


## TODO

- 功能列表
1. 基于 dockerfile 创建基础 images，images 中需要包括 git 和 ssh 的命令，同时为了确保用户不需要在每次新建仓库的时候都创建 ssh，所以需要把本机的 ssh 挂载到 docker 容器对应的文件夹中
2. 基于基础 images 创建不同的 containers，不同的 containers 需要做好标记，如通过 LABEL 或者其他，确保唯一性，(考虑是否需要 database 去记录)。因为需要去通过某一个更具有意义性的值去查找 containers，而不是通过 containers 的 id。譬如可以通过 账号+仓库名(mortalYoung-dt-common) 等
3. 创建容器后，支持 git clone ssh 拉取仓库代码，并且通过 ReadableStream 和 process.stdout/stderr 把终端消息传输出来
4. 支持在容器中执行命令行，并且可以 pipe 命令行执行结果
5. ..