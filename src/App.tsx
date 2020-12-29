import axios from 'axios'
import * as d3 from 'd3'
import React, { useEffect } from 'react'
import Canvas from './Canvas'

// const defdata = [
//   {
//     id: '.venv/share/jupyter',
//     value: 7964,
//   },
//   {
//     id: '.venv/asdf',
//     value: 1111,
//   },
//   {
//     id: '.venv/share',
//   },
//   {
//     id: '.venv',
//   },
// ]

// https://github.com/diego3g/electron-typescript-react/issues

const DATA_FILE 
= 'du.txt'

export const App = () => { 
  const [data, setData] = React.useState<any>(null)
  const [err, setErr] = React.useState<string | null>(null)

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
      setData(d)
    }
    load()
  }, [])

  if (err) {
    return <>{err}</>
  }
  return (
    <>
      {data && <Canvas data={data} />}
    </>
  )
}
