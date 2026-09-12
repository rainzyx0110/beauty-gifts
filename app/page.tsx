import Lottery from "@/components/Lottery";
import { getAllGifts } from "@/lib/gifts";

export default function Home() {
  // 构建时扫描 public/picture/{food,other}，新增图片后重新 build 即可自动纳入
  const gifts = getAllGifts();
  return <Lottery gifts={gifts} />;
}
