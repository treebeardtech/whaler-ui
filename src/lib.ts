import * as d3 from 'd3'
import { HierarchyNode, HierarchyRectangularNode } from 'd3'
import fileSize from 'filesize'
import { basename, extname } from 'path'
import ColorHash from 'color-hash'

export const x = 2

export const getHierarchy: (
  data: FsNode[],
  width: number,
  height: number
) => HierarchyRectangularNode<FsNode> = (data, width, height) => {
  const h = d3
    .stratify<FsNode>()
    .id((d) => d.id)
    .parentId((d) => d.id.substring(0, d.id.lastIndexOf('/')))(data)

  h.each((node) => {
    if (node.children) {
      node.data.value = 0
    }
  })

  const summed = h
    .sum((d) => d.value * 1000)
    .sort((a, b) => b.value! - a.value!)

  const root: HierarchyRectangularNode<FsNode> = d3
    .treemap<FsNode>()
    .size([width, height])
    // .padding(1)
    .round(true)(summed)
  return root
}

export const getFsNode = (r: any) => {
  const fsNode: FsNode = {
    id: r.id,
    value: r.value,
  }
  return fsNode
}

export interface FsNode {
  id: string
  value: number
}

export const displayNode = (node: HierarchyNode<FsNode>, base?: boolean) =>
  `(${fileSize(node.value!)}) ${base ? basename(node.data.id) : node.data.id}`

const colorHash = new ColorHash()
const getColor = (filename: string) => {
  return colorHash.hex(extname(filename))
}

export const drawNode = (
  node: HierarchyRectangularNode<FsNode>,
  context: CanvasRenderingContext2D,
  strokeStyle: string = 'rgba(0,0,0,1)',
  fill: boolean = true
) => {
  context.save() // For clipping the text
  context.beginPath()
  context.rect(node.x0, node.y0, node.x1 - node.x0, node.y1 - node.y0)

  if (fill) {
    context.fillStyle = getColor(node.data.id)
    context.fill()
  }
  context.lineWidth = 0.3
  context.strokeStyle = strokeStyle
  context.stroke()
  context.restore()
}

export const draw: (
  context: CanvasRenderingContext2D,
  data: HierarchyRectangularNode<FsNode>,
  height: number,
  width: number
) => HierarchyRectangularNode<FsNode>[][] | null = (
  context,
  data,
  height,
  width
) => {
  const leaves = data.leaves()

  const lookup: HierarchyRectangularNode<FsNode>[][] = [
    ...new Array(height),
  ].map((row) => new Array<HierarchyRectangularNode<FsNode>>(width))
  leaves.forEach((leaf) => {
    drawNode(leaf, context)
    for (let y = leaf.y0; y < leaf.y1; y++) {
      for (let x = leaf.x0; x < leaf.x1; x++) {
        lookup[y][x] = leaf
      }
    }
  })

  return lookup
}
