import { useMemo, useEffect, useState, useCallback } from "react";
import ForceGraph2D, {
  type NodeObject,
  type LinkObject,
} from "react-force-graph-2d";
import { GraphData, LinkData, NodeData } from "./types";

type Node = NodeObject<NodeData> & { links?: Link[]; id?: string };
type Link = LinkObject<NodeData, LinkData> & { index?: number };
type ImageMap = Record<string, HTMLImageElement>;
type NodeMap = Record<string, Node>;
type Data = { graph: { nodes: Node[]; links: Link[] }; nodeMap: NodeMap };
type Ctx = any; // eslint-disable-line

const PERSON_PLACEHOLDER_ID = "person_placeholder";

export function PeopleGraph(props: { data: GraphData }) {
  const { graph: data, nodeMap } = useMemo(() => {
    const data: Data = { graph: props.data, nodeMap: {} };

    // Create a map of nodes for quick access
    data.nodeMap = data.graph.nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {} as NodeMap);

    // Add links to nodes
    data.graph.links.forEach((link) => {
      const source = data.nodeMap[link.source];
      const target = data.nodeMap[link.target];
      if (source) {
        if (source.links === undefined) source.links = [];
        source.links.push(link);
        data.nodeMap[source.id] = source;
      }
      if (target) {
        if (target.links === undefined) target.links = [];
        target.links.push(link);
        data.nodeMap[target.id] = target;
      }
    });

    return data;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [highlightLinks, setHighlightLinks] = useState(new Set<number>());
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [images, setImages] = useState<ImageMap>({});

  // Preload all images and store them in state for quick access
  useEffect(() => {
    const imageLoadPromises: Array<
      Promise<{ id: string; image?: HTMLImageElement }>
    > = data.nodes.map(({ id, sid }) => {
      return new Promise((resolve) => {
        if (sid) {
          const imgUrl = `https://assets.dexa.ai/image/upload/e_grayscale,w_256,h_256,c_thumb,g_face,r_max,f_auto/entities/people/${sid}`;
          const image = new Image();
          image.src = imgUrl;
          image.onload = () => {
            resolve({ id, image });
          };
          image.onerror = () => resolve({ id });
        } else {
          resolve({ id });
        }
      });
    });

    // Add the placeholder for the person without a sid
    imageLoadPromises.push(
      new Promise((resolve) => {
        const image = new Image();
        image.src = `https://assets.dexa.ai/image/upload/r_max,w_256,h_256,c_thumb/entities/placeholders/person.png`;
        image.onload = () => {
          resolve({ id: PERSON_PLACEHOLDER_ID, image });
        };
        image.onerror = () => resolve({ id: PERSON_PLACEHOLDER_ID });
      })
    );

    Promise.all(imageLoadPromises).then((loadedImages) => {
      const imagesMap = loadedImages.reduce((acc, { id, image }) => {
        if (image) {
          acc[id] = image;
        }
        return acc;
      }, {} as Record<string, HTMLImageElement>);

      setImages(imagesMap);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update highlighted links when a node is selected
  useEffect(() => {
    const activeLinks = new Set<number>();
    if (activeNodeId) {
      const node = nodeMap[activeNodeId];
      if (!node) return;
      node?.links?.forEach((link: Link) => {
        link.index && activeLinks.add(link.index);
        const source =
          nodeMap[
            // @ts-expect-error: broken lib types
            typeof link.source === "string" ? link.source : link.source?.id
          ];
        const target =
          // @ts-expect-error: broken lib types
          nodeMap[link.target === "string" ? link.target : link.target?.id];
        source?.links?.forEach(
          (link: Link) => link.index && activeLinks.add(link.index)
        );
        target?.links?.forEach(
          (link: Link) => link.index && activeLinks.add(link.index)
        );
      });
    }
    setHighlightLinks(activeLinks);
  }, [activeNodeId, data.nodes, nodeMap]);

  const getLinkColor = useCallback(
    (link: Link) => {
      return link.index && highlightLinks.has(link.index)
        ? "rgba(0, 174, 239, 0.4)"
        : "rgba(170, 170, 170, 0.5)";
    },
    [highlightLinks]
  );

  const getLinkWidth = useCallback(
    (link: Link) => {
      return link.index && highlightLinks.has(link.index) ? 5 : 1;
    },
    [highlightLinks]
  );

  const linkDirectionalParticleWidth = useCallback(
    (link: Link) => (link.index && highlightLinks.has(link.index) ? 4 : 0),
    [highlightLinks]
  );

  const getNodeSize = useCallback((node: Node) => {
    if (node.type !== "person") return 6;
    const { value } = node;
    return value === 1
      ? 18
      : value < 10
      ? 24
      : value < 60
      ? 32
      : value < 120
      ? 40
      : value < 800
      ? 48
      : 64;
  }, []);

  const handleNodeInteraction = useCallback(
    (node: NodeObject<NodeData> | null) => {
      if (
        node === null ||
        (node.id !== activeNodeId && node.id !== "andrew huberman")
      ) {
        setActiveNodeId(node ? node.id : null);
      }
    },
    [setActiveNodeId, activeNodeId]
  );

  const handleNodePaint = useCallback(
    (node: Node, ctx: Ctx) => {
      if (!node.x || !node.y) return;
      let size = getNodeSize(node);
      if (node.type === "person") {
        let image = images[node.id];
        if (!image) {
          image = images[PERSON_PLACEHOLDER_ID];
          size = 8;
        }
        if (!image) return;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#555";
        ctx.fill();
        ctx.drawImage(image, node.x - size / 2, node.y - size / 2, size, size);
      } else {
        // Fallback for nodes without images or images still loading, draw a simple circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#00aeef";
        ctx.fill();
      }
    },
    [images, getNodeSize]
  );

  return (
    <ForceGraph2D<Node, Link>
      d3VelocityDecay={0.6}
      graphData={data}
      linkColor={getLinkColor}
      linkDirectionalParticleWidth={linkDirectionalParticleWidth}
      linkDirectionalParticles={4}
      linkWidth={getLinkWidth}
      minZoom={0.9}
      nodeCanvasObject={handleNodePaint}
      nodeVal={getNodeSize}
      onBackgroundClick={() => handleNodeInteraction(null)}
      onNodeClick={handleNodeInteraction}
    />
  );
}
