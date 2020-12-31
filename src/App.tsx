import axios from 'axios'
import * as d3 from 'd3'
import { HierarchyRectangularNode } from 'd3'
import React, { useEffect } from 'react'
import Canvas from './Canvas'
import { displayNode, FsNode, getHierarchy, getPixelLookup } from './lib'
import NodeViewer from './NodeViewer'
import AutoSizer from 'react-virtualized-auto-sizer'
const DATA_FILE = 'du.txt'

const treemapHeight = 700
const treemapWidth = 700

export const App = () => {
  const [
    data,
    setData,
  ] = React.useState<HierarchyRectangularNode<FsNode> | null>(null)
  const [pixelLookup, setPixelLookup] = React.useState<
    HierarchyRectangularNode<FsNode>[][] | null
  >(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [
    hovered,
    setHovered,
  ] = React.useState<HierarchyRectangularNode<FsNode> | null>(null)
  const [
    selected,
    setSelected,
  ] = React.useState<HierarchyRectangularNode<FsNode> | null>(null)

  useEffect(() => {
    console.log(selected)
  }, [selected])

  useEffect(() => {
    const load = async () => {
      const resp = await axios.get(DATA_FILE)
      if (resp.status !== 200) {
        setErr(`Failed to get ${DATA_FILE} with status ${resp.status}`)
        return
      }
      const text = resp.data
      const d = d3.tsvParse(`value\tid\n${text}`)
      if (!d?.length || d.length < 2) {
        setErr(`failed to find tsv formatted data in ${DATA_FILE}`)
      }
      const df = getHierarchy(
        (d as unknown) as FsNode[],
        treemapWidth,
        treemapHeight
      )
      setPixelLookup(getPixelLookup(df))
      setData(df)
    }
    load()
  }, [])

  if (err) {
    return <>{err}</>
  }

  if (!(data && pixelLookup)) {
    return <>Loading</>
  }

  return (
    <AutoSizer
      style={{ height: 'calc(100vh - 20px)', width: 'calc(100vw - 20px)' }}
    >
      {({ height, width }) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
              <NodeViewer
                data={data}
                height={treemapHeight}
                width={width - 50}
                selected={selected}
                setSelected={setSelected}
              />
              <Canvas
                data={data}
                pixelLookup={pixelLookup}
                selected={selected}
                setSelected={setSelected}
                hovered={null}
                setHovered={setHovered}
                height={treemapHeight}
                width={treemapWidth}
              />
            </div>
            <div style={{ fontWeight: 'bold' }}>
              {selected && displayNode(selected)}
            </div>
            <div>{hovered && displayNode(hovered)}</div>
          </div>
        )
      }}
    </AutoSizer>
  )
}
