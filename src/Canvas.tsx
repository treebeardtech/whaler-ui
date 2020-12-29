// https://observablehq.com/@d3/stratify-treemap?collection=@d3/d3-hierarchy
// https://observablehq.com/@pstuffa/canvas-treemap
import React from 'react'

import * as d3 from 'd3'
import { HierarchyRectangularNode } from 'd3'

const width = 700
const height = 700
const color = d3.scaleOrdinal(d3.schemeCategory10)

interface FsNode {
  id: string
  value: number
  isFile?: boolean
}
const lookup = [...new Array(height)].map(
  (row) => new Array<HierarchyRectangularNode<FsNode>>(width)
)

function draw(context: CanvasRenderingContext2D, data: FsNode[]) {
  // const dpi = devicePixelRatio
  // const canvas = document.createElement('canvas')
  // canvas.width = width * dpi
  // canvas.height = height * dpi
  // canvas.style.width = width + 'px'
  // context.scale(dpi, dpi)

  const s = d3
    .stratify<FsNode>()
    .id((d) => d.id)
    .parentId((d) => d.id.substring(0, d.id.lastIndexOf('/')))(data)

  s.leaves().forEach((l) => {
    l.data.isFile = true
  })

  const summed = s
    .sum((d) => (d.isFile ? d.value : 0))
    .sort((a, b) => b.value! - a.value!)

  const root: HierarchyRectangularNode<FsNode> = d3
    .treemap<FsNode>()
    .size([width, height])
    // .padding(1)
    .round(true)(summed)

  // root.leaves().forEach((leaf) => leaf.data.isLeaf = true)

  const leaves = root.leaves()

  const getColor = (d: any) => {
    while (d.depth > 1) {
      d = d.parent
    }
    return color(d.data.id)
  }

  leaves.forEach((leaf) => {
    context.save() // For clipping the text
    context.globalAlpha = 0.7
    context.beginPath()
    context.rect(
      leaf.x0, // x
      leaf.y0, // y
      leaf.x1 - leaf.x0, // width
      leaf.y1 - leaf.y0 // height
    )

    for (let y = leaf.y0; y < leaf.y1; y++) {
      for (let x = leaf.x0; x < leaf.x1; x++) {
        lookup[y][x] = leaf
      }
    }
    context.fillStyle = getColor(leaf)
    context.fill()
    context.strokeStyle = 'rgba(0,0,0,0.2)'
    context.stroke()
    context.clip() // Generate the Clip Path
    context.globalAlpha = 1

    // context.font = '10px sans-serif'
    // const textData = leaf.data.id.split(/(?=[A-Z][^A-Z])/g).concat(format(leaf.value!))

    // textData.forEach((d: any, i: any) => {
    //   let offsetY = 12 // Some simple logic to set the y of the text
    //   if (i > 0) {
    //     offsetY += i * 12
    //   }

    //   context.fillStyle = 'black'
    //   context.fillText(d, leaf.x0, leaf.y0 + offsetY)
    // })

    context.restore() // Restore so you can continue drawing
  })
}

interface CP {
  data: any
}

const Canvas: React.FC<CP> = ({ data, children }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(
    null
  )
  const [highlighted, setHighlighted] = React.useState<any | null>(null)

  React.useEffect(() => {
    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext('2d')

      if (renderCtx) {
        setContext(renderCtx)
      }
    }

    // Draw a rectangle
    if (context && data) {
      draw(context, data)
    }
  }, [context, data])

  return (
    <div
      style={{
        textAlign: 'center',
      }}
    >
      <canvas
        onMouseMove={(event) => {
          // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
          const canvas = canvasRef.current!
          const rect = canvas.getBoundingClientRect()
          const scaleX = canvas.width / rect.width // relationship bitmap vs. element for X
          const scaleY = canvas.height / rect.height // relationship bitmap vs. element for Y
          const loc = {
            x: Math.round((event.clientX - rect.left) * scaleX),
            y: Math.round((event.clientY - rect.top) * scaleY),
          }
          // const context = canvas.getContext('2d')!
          // context.beginPath()
          // context.rect(
          //   loc.x - 1,
          //   loc.y -1,
          //   2,
          //   2,
          //   )
          //   context.fillStyle = 'red'
          //   context.fill()
          const row = lookup[loc.y]
          if (!row) {
            return
          }

          const node = row[loc.x]

          if (!node) {
            return
          }

          setHighlighted(node.data)
        }}
        id="canvas"
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '2px solid #000',
          marginTop: 10,
        }}
      ></canvas>
      <div style={{ color: 'black' }}>{JSON.stringify(highlighted)}</div>
    </div>
  )
}

export default Canvas
