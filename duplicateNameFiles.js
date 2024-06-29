/**
 * 判断目录下所有文件是否重名
 */
import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import md5 from "md5";
import inquirer from "inquirer";
import * as xlsx from "xlsx";

const md5Map = {};
const fileDuplicateMap = {};

const dealDuplicateNameFiles = async (fileList, folderPath) => {
  for await (const filePath of fileList) {
    const fileName = filePath.split("/").pop();
    const fileBuffer = fs.readFileSync(filePath, "base64");
    const fileMd5 = md5(fileBuffer);
    if (md5Map[fileName]) {
      // 有重名，则观察md5是否一致
      if (md5Map[fileName].md5 !== fileMd5) {
        fileDuplicateMap[md5Map[fileName].baseFile]
          ? fileDuplicateMap[md5Map[fileName].baseFile].push(filePath)
          : (fileDuplicateMap[md5Map[fileName].baseFile] = [filePath]);
      }
    } else {
      md5Map[fileName] = {
        baseFile: filePath,
        md5: fileMd5,
      };
    }
  }

  console.log("duplate file is ----->");
  console.log(fileDuplicateMap);

  const jsonFilePath = path.resolve(folderPath, "./duplicateImages.json");
  fs.writeFileSync(jsonFilePath, JSON.stringify(fileDuplicateMap, null, 2));
};

inquirer
  .prompt([
    {
      type: "input",
      name: "fileList",
      message: "请拖入文件夹",
    },
  ])
  .then((answer) => {
    // 去两端空格，针对windows路径做兼容
    const folderPath = answer["fileList"]?.trim().replace(/\\/g, "/");
    if (!folderPath) {
      console.error("无效的文件夹");
      return;
    }

    let fileList = fg.sync(`${folderPath}/**/*.png`);

    dealDuplicateNameFiles(fileList, folderPath);
  });
