type Graph<T> = globalThis.Map<T, T[]>
type Groups<T> = T[][]

export declare namespace sequence {
  type Options<T> = {
    graph: Graph<T>,
    groups: Groups<T>,
  }
  type Output<T> = {
    safe: boolean,
    chunks: Groups<T>,
    cycles: Groups<T>,
  }
}

/** 
 * ## {@link sequence `Graph.sequence`}
 * 
 * Stolen from [pnpm's `graph-sequencer`](https://github.com/pnpm/graph-sequencer) module
 */
export function sequence<T>(graph: Graph<T>): sequence.Output<T> {
  const includedNodes = [...graph.keys()]
  const reverseGraph = new Map<T, T[]>()

  for (const key of graph.keys()) reverseGraph.set(key, [])

  const nodes = new Set<T>(includedNodes)
  const visited = new Set<T>()
  const outDegree = new Map<T, number>()
  for (const [from, edges] of graph.entries()) {
    outDegree.set(from, 0)
    for (const to of edges) {
      if (nodes.has(from) && nodes.has(to)) {
        changeOutDegree(from, 1)
        reverseGraph.get(to)!.push(from)
      }
    }
    if (!nodes.has(from))
      visited.add(from)
  }

  const chunks: T[][] = []
  const cycles: T[][] = []
  let safe = true
  while (nodes.size) {
    const chunk: T[] = []
    let minDegree = Number.MAX_SAFE_INTEGER
    for (const node of nodes) {
      const degree = outDegree.get(node)!
      if (degree === 0) {
        chunk.push(node)
      }
      minDegree = Math.min(minDegree, degree)
    }

    if (minDegree === 0) {
      chunk.forEach(removeNode)
      chunks.push(chunk)
    } else {
      const cycleNodes: T[] = []
      for (const node of nodes) {
        const cycle = findCycle(node)
        if (cycle.length) {
          cycles.push(cycle)
          cycle.forEach(removeNode)
          cycleNodes.push(...cycle)

          if (cycle.length > 1) {
            safe = false
          }
        }
      }
      chunks.push(cycleNodes)
    }
  }

  return { safe, chunks, cycles }

  // Function to update the outDegree of a node.
  function changeOutDegree (node: T, value: number) {
    const degree = outDegree.get(node) ?? 0
    outDegree.set(node, degree + value)
  }

  // Function to remove a node from the graph.
  function removeNode (node: T) {
    for (const from of reverseGraph.get(node)!) {
      changeOutDegree(from, -1)
    }
    visited.add(node)
    nodes.delete(node)
  }

  function findCycle (startNode: T): T[] {
    const queue: Array<[T, T[]]> = [[startNode, [startNode]]]
    const cycleVisited = new Set<T>()
    const cycles: T[][] = []

    while (queue.length) {
      const [id, cycle] = queue.shift()!
      for (const to of graph.get(id)!) {
        if (to === startNode) {
          cycleVisited.add(to)
          cycles.push([...cycle])
          continue
        }
        if (visited.has(to) || cycleVisited.has(to)) {
          continue
        }
        cycleVisited.add(to)
        queue.push([to, [...cycle, to]])
      }
    }

    if (!cycles.length) {
      return []
    }
    cycles.sort((a, b) => b.length - a.length)
    return cycles[0]
  }
}
