import type { MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import styles from "~/styles.css?url";
import { PeopleGraph } from "../PeopleGraph.client";
import { GraphData } from "../types";
import type { LinksFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  const title = `Dexa Labs: Huberman Lab Knowledge Graph`;
  const description = `Every person mentioned on a Huberman Lab episode.`;
  const imgUrl = "https://huberman-kg.labs.dexa.ai/static/huberman-kg.png";
  return [
    { title },
    { name: "description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: imgUrl },
    { property: "og:site_name", content: "Dexa Labs" },
    { property: "og:image", content: imgUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function clientLoader(): Promise<GraphData> {
  const raw = await fetch("/static/data.json");
  const data = (await raw.json()) as GraphData;
  return data;
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <div> </div>;
}

export default function Index() {
  const data = useLoaderData<GraphData>();
  return <PeopleGraph data={data} />;
}
