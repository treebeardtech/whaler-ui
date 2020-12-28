import * as d3 from 'd3'
import React from 'react'
import Canvas from './components/Canvas'
import { GlobalStyle } from './styles/GlobalStyle'

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
export const App = () => {
  const [data, setData] = React.useState<any>(null)

  function onChangeFile(event: any) {
    const file = event.target.files[0]
    console.log(file)

    const reader = new FileReader()

    reader.readAsText(file)

    reader.onload = () => {
      const d = d3.tsvParse(`value\tid\n${reader.result}`)
      setData(d)
    }

    reader.onerror = () => {
      console.log(reader.error)
    }
  }

  return (
    <>
      <GlobalStyle />
      {data && <Canvas data={data} />}
      <div style={{ width: 800, margin: 'auto' }}>
        <p style={{ fontFamily: 'monaco' }}>
          du -k -a some-dir {'>'} disk.tsv
          <br />
          docker run -it --rm --workdir / --entrypoint /du psutil-example -a -c{' '}
          {'>'} du.tsv
        </p>

        <input id="myInput" type="file" onChange={onChangeFile} />
      </div>
    </>
  )
}
