/**
 * @description: functions about container
 */
import type Dockerode from "dockerode";
import Docker from "dockerode";

const docker = new Docker();
const imageNameTag = 'n8s:1.0.0';

/**
 * get container id by containerName
 * @param name container name
 * @returns
 */
 async function getContainerIdByName(name: string) {
    const containers = await docker.listContainers({
        all: true,
        filters: `{"name": ["${ name }"]}`,
        limit: 10,
    });

    let result = { Id: '' }
    for (let container of containers) {
        if (container.Names.find(containerName => containerName === `/${ name }`)) {
            result = container
            break
        }
    }
    return result.Id
}

/**
 * get container by containerName
 * @param id container name
 * @returns
 */
async function getContainerById(id: string) {
    return id ? docker.getContainer(id) : undefined
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

    container.attach({stream: true, stdout: true, stderr: true}, (err, stream: any) => {
        stream.pipe(process.stdout);
        // container.modem.demuxStream(stream, process.stdout, process.stderr);
    });

    return container;
}

/**
 * start a container
 * @param id container id
 * @returns
 */
async function startContainer(id: string) {
    const container = docker.getContainer(id);
    return container.start();
}

/**
 * stop a container
 * @param id container id
 * @returns
 */
async function stopContainer(id: string) {
  const container = docker.getContainer(id);
  return container.stop();
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
    container.attach({stream: true, stdout: true, stderr: true}, (err, stream: any) => {
        stream.pipe(process.stdout);
        container.modem.demuxStream(stream, process.stdout, process.stderr);
    });
    // const stream = await execInstance.start({ hijack: true, stdin: true });
    // docker.modem.demuxStream(stream, process.stdout, process.stderr);
}

export {
    getContainerIdByName,
    getContainerById,
    createContainer,
    startContainer,
    stopContainer,
    execCommandInContainer,
};
