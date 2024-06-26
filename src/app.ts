import fs from "fs";
import args from "args";
import {
  ANALYZED_FILE,
  INPUT_FOLDER,
  JSON_INPUT_FOLDER,
  OUTPUT_FOLDER,
  PDF_INPUT_FOLDER,
  TEMP_FOLDER,
} from "./utils/paths";
import register from "./utils/optionsHandler";
import { IOption } from "./interfaces/IOption";

args
  .option("gen-personalities", "Gen personalities to analyze", 0)
  .option("analyze", "Analyze inputs to gen training files", false);

const flags = args.parse(process.argv);

const folders = [
  INPUT_FOLDER,
  JSON_INPUT_FOLDER,
  PDF_INPUT_FOLDER,
  OUTPUT_FOLDER,
  TEMP_FOLDER,
];

for (const folder of folders) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

if (!fs.existsSync(ANALYZED_FILE)) fs.writeFileSync(ANALYZED_FILE, "");

const options: IOption[] = [];

async function main() {
  await register(options);

  for (const flag in flags) {
    if (Number(flags[flag]) >= 1) {
      for (const option of options) {
        if (option.flags.includes(flag)) {
          option.fn(flags);
        }
      }
    }
  }
}

main();
