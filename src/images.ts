/**
 * @description: functions about images
 */

import Docker from "dockerode";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docker = new Docker();
const imageNameTag = 'n8s:1.0.0';

/**
 * ensure image exist or build a basic image
 */
async function assertBasicImages() {
    const images = await docker.listImages({
        filters: '{"label": ["N8S=true"]}',
    });
    if (images.length) return;

    // TODO：为啥会多创建一个 alpine 的 images？
    // 可能是需要 alpine 作为基础镜像
    const file = join(__dirname, "../", "Dockerfile.tar");
    const stream = await docker.buildImage(file, { t: imageNameTag });

    await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, res) => {
            err ? reject(err) : resolve(res)
        }, (event) => {
            console.log('creating', event)
        });
    });
}

export {
    assertBasicImages,
};
