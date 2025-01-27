import { useState } from 'react'
import {
  Option
} from "@traversable/data"


function App() {
  const [count, setCount] = useState(0)
  console.log(Option.some(1)._tag)

  return (
    <>
      <h1>@traversable dev</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
