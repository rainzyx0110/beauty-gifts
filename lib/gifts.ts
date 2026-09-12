import fs from "node:fs";
import path from "node:path";

export type GiftCategory = "food" | "other";

export interface Gift {
  // 文件名去掉扩展名，就是礼物的名字
  name: string;
  // 图片地址（public/picture 下的相对路径）
  src: string;
}

const CATEGORIES: GiftCategory[] = ["food", "other"];

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

function scanCategory(category: GiftCategory): Gift[] {
  const dir = path.join(process.cwd(), "public", "picture", category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXT.test(file))
    .map((file) => ({
      name: file.replace(/\.[^.]+$/, ""),
      // 中文文件名需要 URL 编码才能在浏览器里正常加载
      src: `/picture/${category}/${encodeURI(file)}`,
    }));
}

// 在构建时扫描 public/picture/{food,other}，新增图片后重新 build 即可自动纳入
export function getAllGifts(): Record<GiftCategory, Gift[]> {
  const result = {} as Record<GiftCategory, Gift[]>;
  for (const category of CATEGORIES) {
    result[category] = scanCategory(category);
  }
  return result;
}
