export type NodeData = {
  id: string;
  sid?: string;
  name: string;
  type: string;
  docId: string;
  value: number;
  links?: LinkData[];
};

export type LinkData = {
  source: string;
  target: string;
};

export type Data = {
  nodes: NodeData[];
  links: LinkData[];
};

export type GraphData = {
  nodes: NodeData[];
  links: LinkData[];
};
