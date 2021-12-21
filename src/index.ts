import {
  assertBasicImages,
  createContainer,
  getRunningContainerByName,
  execCommandInContainer,
} from "./docker";

const containerName = 'liuyi_dt-tag1';

(async function () {
  await assertBasicImages()

  // await createContainer(containerName);

  const container = await getRunningContainerByName(containerName);
  console.log(111, container)

  // if (container) {
  //   const container = container;
  //   await container.start();
  //   container.resize({
  //     h: process.stdout.rows,
  //     w: process.stdout.columns,
  //   });

  //   execCommandInContainer(container);
  // }
})();
