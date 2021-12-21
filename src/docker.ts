import type Dockerode from "dockerode";
import Docker from "dockerode";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docker = new Docker();
const imageNameTag = 'n8s:1.0.0';

/**
 * ensure base image exist
 */
async function assertBasicImages() {
  const containers = await docker.listImages({
    filters: '{"label": ["N8S=true"]}',
  });
  if (containers.length) return;

  const file = join(__dirname, "../", "Dockerfile.tar");
  // TODO：为啥会多创建一个 alpine 的 images？
  // 可能是需要 alpine 作为基础镜像
  const stream = await docker.buildImage(file, { t: imageNameTag });

  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => {
      err ? reject(err) : resolve(res)
    }, (event) => {
      console.log('creating', event)
    });
  });
}

/**
 * create a container
 * @param name
 * @returns
 */
async function createContainer(name: string) {
  const container = await docker.createContainer({
    Image: imageNameTag,
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    name,
  });

  return container;
}

/**
 * start a container
 * @param id container id
 * @returns
 */
async function startContainer(id: string) {
  const containers = await docker.listContainers();
  const target = containers.find((container) => container.Id === id);
  if (!target) {
    throw new Error(`Can't find container via id:${id}`);
  }

  const container = docker.getContainer(target.Id);
  return container.start();
}

/**
 * exec command in container, like ls
 * @param container
 */
async function execCommandInContainer(container: Dockerode.Container) {
  const execInstance = await container.exec({
    Cmd: ["ls"],
    AttachStdin: true,
    AttachStdout: true,
  });
  const stream = await execInstance.start({ hijack: true, stdin: true });
  docker.modem.demuxStream(stream, process.stdout, process.stderr);
}

/**
 * get container which running
 * @param name container name
 * @returns
 */
async function getRunningContainerByName(name: string) {
  const containers = await docker.listContainers();
  const results = containers.find((container) => {
    console.log(333, container)
    container.Names.some(containerName => containerName.includes(name))
  });
  // console.log(222, name, results)
  if (!results) return null;
  return docker.getContainer(results.Id);
}

export {
  assertBasicImages,
  createContainer,
  startContainer,
  getRunningContainerByName,
  execCommandInContainer,
};
