// https://observablehq.com/@d3/stratify-treemap?collection=@d3/d3-hierarchy
// https://observablehq.com/@pstuffa/canvas-treemap
import React, { useEffect, useRef } from 'react'

import { HierarchyRectangularNode } from 'd3'
import { draw, drawNode, FsNode } from './lib'

let lookup: HierarchyRectangularNode<FsNode>[][] | null = null

interface CP {
  data: HierarchyRectangularNode<FsNode>
  height: number
  width: number
  hovered: HierarchyRectangularNode<FsNode> | null
  setHovered: (node: HierarchyRectangularNode<FsNode> | null) => void
  selected: HierarchyRectangularNode<FsNode> | null
  setSelected: (node: HierarchyRectangularNode<FsNode> | null) => void
}

function usePrevious(value: any) {
  const ref = useRef<HierarchyRectangularNode<FsNode> | null>(null)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const Canvas: React.FC<CP> = ({
  data,
  hovered,
  setHovered,
  selected,
  setSelected,
  height,
  width,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(
    null
  )

  const prevSelected = usePrevious(selected)

  useEffect(() => {
    if (!context) {
      return
    }

    if (prevSelected) {
      drawNode(prevSelected, context, undefined, false)
    }

    if (selected) {
      drawNode(selected, context, 'white', false)
    }
  }, [prevSelected, selected, context])

  useEffect(() => {
    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext('2d')

      if (renderCtx) {
        setContext(renderCtx)
      }
    }

    if (context && data) {
      lookup = draw(context, data, height, width)
    }
  }, [context, data, height, width])

  const getNode = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!lookup) {
      return
    }
    // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width // relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height // relationship bitmap vs. element for Y
    const loc = {
      x: Math.round((event.clientX - rect.left) * scaleX),
      y: Math.round((event.clientY - rect.top) * scaleY),
    }

    const row = lookup[loc.y]
    if (!row) {
      return
    }

    const node = row[loc.x]
    return node
  }

  return (
    <div
      style={{
        textAlign: 'center',
      }}
    >
      <canvas
        onClick={(event) => {
          setSelected(getNode(event) || null)
        }}
        onMouseMove={(event) => {
          setHovered(getNode(event) || null)
        }}
        id="canvas"
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '2px solid #000',
          cursor: 'pointer',
        }}
      ></canvas>
    </div>
  )
}

export default React.memo(Canvas)
