import { assertBasicImages } from "./images";
import {
	getContainerIdByName,
	getContainerById,
	createContainer,
	startContainer,
	stopContainer,
	execCommandInContainer,
	initialContainer,
} from "./container";

/**
 * 初始化仓库做以下事件
 * 1. 创建容器
 * 2. 初始化容器必要的环境
 * 3. 拉取仓库代码
 */
async function init(containerName: string) {
	await assertBasicImages();
	const containerId = await getContainerIdByName(containerName);
	const container = await getContainerById(containerId);
	if (container) {
		throw new Error(
			`[init]: The ${containerName} has already generated in repository, please delete the old one first.`
		);
	}
	// 创建容器
	const newContainer = await createContainer(containerName);
	// 创建容器后, 默认运行容器并执行初始化容器的一些操作
	await newContainer.start();
	await initialContainer(newContainer);

	// 初始化容器后, 关闭容器,
	await newContainer.stop();
}

/**
 * 打开仓库
 */
async function open(containerName: string) {
	const containerId = await getContainerIdByName(containerName);
	const container = await getContainerById(containerId);
	if (!container) {
		throw new Error(
			`[open]: The ${containerName} was missing in repository, please execute the init method before this method`
		);
	}
	const containerDetail = await container.inspect();
	if (containerDetail.State.Running) {
		return;
	}
	await container.start();
}

/* 测试代码 */
const containerName = "liuyi_Code-Style-Guide";
// init(containerName);
// open(containerName);
