import {
  createContainer,
  getContainerByName,
  execCommandInContainer,
} from "./docker";

(async function () {
  //   const container = await createContainer("tttt");
  const res = await getContainerByName("tttt");
  if (res) {
    const container = res;
    await container.start();
    container.resize({
      h: process.stdout.rows,
      w: process.stdout.columns,
    });

    execCommandInContainer(container);
  }
})();
