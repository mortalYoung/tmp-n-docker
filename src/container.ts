/**
 * @description: functions about container
 */
import type Dockerode from "dockerode";
import Docker from "dockerode";
import { spawn } from "child_process";
import path from "path";

const docker = new Docker();
const imageNameTag = "n8s:1.0.0";

/**
 * get container id by containerName
 * @param name container name
 * @returns
 */
async function getContainerIdByName(name: string) {
	const containers = await docker.listContainers({
		all: true,
		filters: `{"name": ["${name}"]}`,
		limit: 10,
	});

	let result = { Id: "" };
	for (let container of containers) {
		if (
			container.Names.find(
				(containerName) => containerName === `/${name}`
			)
		) {
			result = container;
			break;
		}
	}
	return result.Id;
}

/**
 * get container by containerName
 * @param id container name
 * @returns
 */
async function getContainerById(id: string) {
	return id ? docker.getContainer(id) : undefined;
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
		OpenStdin: true,
		name,
	});

	container.attach(
		{ stream: true, stdout: true, stderr: true },
		(err, stream: any) => {
			stream.pipe(process.stdout);
			// container.modem.demuxStream(stream, process.stdout, process.stderr);
		}
	);

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
 * exec command in container, like [`ls`]
 * @param container
 */
async function execCommandInContainer(
	container: Dockerode.Container,
	cmd: string[]
) {
	return new Promise<void>(async (resolve) => {
		const execInstance = await container.exec({
			Cmd: cmd,
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true,
		});
		const stream = await execInstance.start({
			hijack: true,
			Detach: false,
			stdin: true,
		});
		// const stream = await execInstance.start({ hijack: true, stdin: true });
		docker.modem.demuxStream(stream, process.stdout, process.stderr);
		stream.on("close", function () {
			resolve();
		});
	});
}

const SSH_PATH = path.join("/Users/xiuneng", ".ssh");
/**
 * Copy the ssh file into container
 * Only execute in the init
 */
async function writeSSHIntoContainer(container: Dockerode.Container) {
	return Promise.all([
		new Promise<void>((resolve, reject) => {
			const stream = spawn("docker", [
				"cp",
				path.join(SSH_PATH, "id_rsa.github"),
				`${container.id}:/root/.ssh/id_rsa.github`,
			]);
			stream.on("close", function () {
				resolve();
			});
			stream.on("error", function (err) {
				reject(err);
			});
		}),
		new Promise<void>((resolve, reject) => {
			const stream = spawn("docker", [
				"cp",
				path.join(SSH_PATH, "id_rsa.github.pub"),
				`${container.id}:/root/.ssh/id_rsa.github.pub`,
			]);
			stream.on("close", function () {
				resolve();
			});
			stream.on("error", function (err) {
				reject(err);
			});
		}),
		new Promise<void>((resolve, reject) => {
			const stream = spawn("docker", [
				"cp",
				path.join(SSH_PATH, "config"),
				`${container.id}:/root/.ssh/config`,
			]);
			stream.on("close", async function () {
				await execCommandInContainer(container, [
					"chown",
					"root",
					"/root/.ssh/config",
				]);
				resolve();
			});
			stream.on("error", function (err) {
				reject(err);
			});
		}),
		new Promise<void>((resolve, reject) => {
			const stream = spawn("docker", [
				"cp",
				path.join(SSH_PATH, "known_hosts"),
				`${container.id}:/root/.ssh/known_hosts`,
			]);
			stream.on("close", function () {
				resolve();
			});
			stream.on("error", function (err) {
				reject(err);
			});
		}),
	]);
}

/**
 * Only support github repo in SSH way
 */
async function downloadRepo(container: Dockerode.Container, repo: string) {
	await execCommandInContainer(container, [
		"git",
		"clone",
		repo,
		"--progress",
	]);
}

async function initialContainer(container: Dockerode.Container) {
	// 1. 把 SSH 写到容器里
	await writeSSHIntoContainer(container);
	// 2. 克隆仓库
	const repo = "git@github.com:DTStack/Code-Style-Guide.git";
	await downloadRepo(container, repo);
}

export {
	getContainerIdByName,
	getContainerById,
	createContainer,
	startContainer,
	stopContainer,
	execCommandInContainer,
	initialContainer,
};
