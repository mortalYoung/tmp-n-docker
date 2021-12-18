import type Dockerode from "dockerode";
import Docker from "dockerode";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const docker = new Docker();

/**
 * ensure base image exist
 */
async function assertBashImages() {
  const containers = await docker.listImages({
    filters: '{"label": ["TMPNDOCKER=true"]}',
  });
  if (containers.length) {
    return;
  }

  const file = join(__dirname, "../", "Dockerfile.tar");
  // TODO：为啥会多创建一个 alpine 的 images
  const readStream = await docker.buildImage(file, { t: "tmp-n-docker" });

  await new Promise((resolve, reject) => {
    docker.modem.followProgress(readStream, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
}

/**
 * create a container
 * @param name
 * @returns
 */
async function createContainer(name: string) {
  const container = await docker.createContainer({
    Image: "tmp-n-docker",
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

async function execCommandInContainer(container: Dockerode.Container) {
  const execInstance = await container.exec({
    Cmd: ["ls"],
    AttachStdin: true,
    AttachStdout: true,
  });
  const stream = await execInstance.start({ hijack: true, stdin: true });
  docker.modem.demuxStream(stream, process.stdout, process.stderr);
}

async function getContainerByName(name: string) {
  const containers = await docker.listContainers();
  // TODO: 有 name 重复的情况，想个办法弄成唯一
  const results = containers.find((container) =>
    container.Names.includes(name)
  );
  if (results) {
    return docker.getContainer(results.Id);
  }
  return null;
}

export {
  createContainer,
  startContainer,
  getContainerByName,
  execCommandInContainer,
};
