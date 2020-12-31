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
  strokeStyle: string = 'rgba(0,0,0,0.2)',
  lineWidth: number = 0.3,
  fill: boolean = true
) => {
  context.save() // For clipping the text
  context.beginPath()
  context.rect(
    node.x0 + lineWidth,
    node.y0 + lineWidth,
    node.x1 - node.x0 - 2 * lineWidth,
    node.y1 - node.y0 - 2 * lineWidth
  )

  if (fill) {
    context.fillStyle = getColor(node.data.id)
    context.fill()
  }
  context.lineWidth = lineWidth
  context.strokeStyle = strokeStyle
  context.stroke()
  context.restore()
}

export const drawTree = (
  root: HierarchyRectangularNode<FsNode>,
  context: CanvasRenderingContext2D
) => {
  const leaves = root.leaves()

  leaves.forEach((leaf) => {
    drawNode(leaf, context)
  })
}

export const getPixelLookup = (data: HierarchyRectangularNode<FsNode>) => {
  const leaves = data.leaves()

  const lookup: HierarchyRectangularNode<FsNode>[][] = [
    ...new Array(data.x1 - data.x0),
  ].map((row) => new Array<HierarchyRectangularNode<FsNode>>(data.y1 - data.y0))

  leaves.forEach((leaf) => {
    for (let y = leaf.y0; y < leaf.y1; y++) {
      for (let x = leaf.x0; x < leaf.x1; x++) {
        lookup[y][x] = leaf
      }
    }
  })

  return lookup
}
