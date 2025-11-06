import HomeClient from "@/components/home-client";
import { artists } from "@/data/artists";

export default function Page() {
  return <HomeClient initialArtists={artists} />;
}
