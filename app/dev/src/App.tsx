import { useState } from 'react'

import { Option } from "@traversable/data"


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
      </div>
    </>
  )
}

export default App
