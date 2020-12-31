import { HierarchyRectangularNode } from 'd3'
import React, { useEffect, useRef } from 'react'
import { FC } from 'react'
import {
  FixedSizeNodeData,
  FixedSizeNodePublicState,
  FixedSizeTree,
  TreeWalker,
  TreeWalkerValue,
} from 'react-vtree'
import { NodeComponentProps } from 'react-vtree/dist/es/Tree'
import { displayNode, FsNode } from './lib'

type TreeData = FixedSizeNodeData &
  Readonly<{
    isLeaf: boolean
    name: string
    nestingLevel: number
    isSelected: boolean
    node: HierarchyRectangularNode<FsNode>
  }>

const defaultButtonStyle = { fontFamily: 'Courier New' }

type NodeMeta = Readonly<{
  node: HierarchyRectangularNode<FsNode>
}>

type NVProps = Readonly<{
  data: HierarchyRectangularNode<FsNode>
  height: number
  width: number
  selected: HierarchyRectangularNode<FsNode> | null
  setSelected: (node: HierarchyRectangularNode<FsNode> | null) => void
}>

const NodeViewer = ({
  data,
  height,
  width,
  selected,
  setSelected,
}: NVProps) => {
  const r = useRef<FixedSizeTree>(null)

  useEffect(() => {
    if (r.current && selected) {
      r.current.scrollToItem(selected.data.id)
    }
  }, [selected])

  const getNodeData = (
    node: HierarchyRectangularNode<FsNode>
  ): TreeWalkerValue<TreeData, NodeMeta> => ({
    data: {
      id: node.data.id,
      isLeaf: node.children === undefined,
      isOpenByDefault: true,
      name: displayNode(node, true),
      nestingLevel: node.depth,
      isSelected: !!selected && selected.data.id === node.data.id,
      node,
    },
    node,
  })

  const Node: FC<
    NodeComponentProps<TreeData, FixedSizeNodePublicState<TreeData>>
  > = ({
    data: { isLeaf, name, nestingLevel, isSelected, node },
    isOpen,
    style,
    setOpen,
  }) => (
    <div
      style={{
        ...style,
        alignItems: 'center',
        display: 'flex',
        marginLeft: nestingLevel * 30 + (isLeaf ? 48 : 0),
        fontWeight: isSelected ? 'bold' : 'normal',
      }}
    >
      {!isLeaf && (
        <div>
          <button
            type="button"
            onClick={() => setOpen(!isOpen)}
            style={defaultButtonStyle}
          >
            {isOpen ? 'V' : '>'}
          </button>
        </div>
      )}
      <div
        onClick={() => setSelected(node)}
        style={{
          marginLeft: 10,
          cursor: 'pointer',
          color: 'blue',
          textDecoration: 'underline',
        }}
      >
        {name}
      </div>
    </div>
  )

  function* treeWalker(): ReturnType<TreeWalker<TreeData, NodeMeta>> {
    yield getNodeData(data)

    while (true) {
      const parentMeta = yield

      for (const child of parentMeta.node.children || []) {
        yield getNodeData(child)
      }
    }
  }
  return (
    <FixedSizeTree
      treeWalker={treeWalker}
      itemSize={20}
      height={height}
      width={width}
      ref={r}
    >
      {Node as any}
    </FixedSizeTree>
  )
}

export default React.memo(NodeViewer)
