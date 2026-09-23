import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.ru.name} — ${BRAND.ru.tagline.toLowerCase()}`,
    short_name: BRAND.ru.name,
    description: "Заявки дилеров, контроль въезда и выезда машин, накладные",
    start_url: "/orders",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e8e9e4",
    theme_color: "#15171b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
