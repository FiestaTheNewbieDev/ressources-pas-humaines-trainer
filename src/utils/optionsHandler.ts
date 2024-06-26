import { glob } from "glob";
import path from "path";
import { promisify } from "util";
import { IOption } from "../interfaces/IOption";

const pGlob = promisify(glob);

// !WARNING! Handlers work only if glob is version 7.2.0

async function loadOptions(options: IOption[], dir: string) {
  const files = await pGlob(
    path.join(dir, `*${process.env.NODE_ENV === "production" ? ".js" : ".ts"}`)
  );

  files.forEach(async (optionFile: string) => {
    const option: IOption = await import(optionFile).then(
      (module) => module.default
    );

    if (option) {
      if (!option.flags || option.flags.length < 1)
        throw new Error(`No flags in ${optionFile}`);
      if (!option.fn) throw new Error(`No function in ${optionFile}`);

      options.push(option);
      console.log(`Option loaded: ${optionFile}`, option);
    }
  });

  const subdirs = await pGlob(path.join(dir, "*/"));

  subdirs.forEach(async (subdir: string) => {
    await loadOptions(options, subdir);
  });
}

export default async function register(options: IOption[]) {
  switch (process.env.NODE_ENV) {
    case "development":
      await loadOptions(options, path.join(process.cwd(), "/src/options"));
      break;
    case "production":
      await loadOptions(options, path.join(process.cwd(), "/build/options"));
    default:
      throw new Error('Unknown environment');
  }
}
