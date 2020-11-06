export default async function run({ plugins }: IProgram): Promise<void> {
  if (!plugins?.length) {
    console.log(`Please specify a plugin to install`)
  }
  console.log(plugins)
}
