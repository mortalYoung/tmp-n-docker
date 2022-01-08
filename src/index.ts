import { assertBasicImages } from "./images";
import {
    getContainerIdByName,
    getContainerById,
    createContainer,
    startContainer,
    stopContainer,
    execCommandInContainer,
} from "./container";

const containerName = 'liuyi_dt-tag';

(async function () {
    // 检查镜像是否存在，不存在则创建
    await assertBasicImages()

    // 根据提供的容器名称 查询容器
    const containerId = await getContainerIdByName(containerName)
    const container = await getContainerById(containerId)

    // 容器不存在则根据提供的容器名称 创建容器
    if (container) {
        // 查询容器详细信息
        const containerDetail = await container.inspect()

        if (containerDetail.State.Running) {
            // await container.stop();
            await stopContainer(containerId);
        } else {
            // await container.start();
            await startContainer(containerId);

            container.resize({
                h: process.stdout.rows,
                w: process.stdout.columns,
            });
    
            execCommandInContainer(container);
        }
    } else {
        const newContainer = await createContainer(containerName)
        await newContainer.start();
    }
})();
