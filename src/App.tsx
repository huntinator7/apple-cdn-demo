import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Point,
  PointType,
  LineType,
  Line,
  PointInfoType,
  sizeToNumber,
} from "./utils/points";

const App = () => {
  // where the Rust fucntion caller will be stored
  const [wasm, setWasm] = useState<any>();

  const [customerLat, setCustomerLat] = useState("-95");
  const [customerLong, setCustomerLong] = useState("40");

  // cache IDs based on the avaialble node IDs
  const [cache1, setCache1] = useState(10);
  const [cache2, setCache2] = useState(20);

  // edge connecting the customer location to the nearest node
  const [closestEdge, setClosestEdge] = useState<LineType>({
    id1: 0,
    id2: 1,
    weight: 1,
  });

  // create nodes given the cities provided with ID's
  const [nodes] = useState<PointType[]>(
    nodeInfo.map((n, i) => ({ ...n, id: i + 1 }))
  );

  // store the result of our Rust code here
  const [shorterResult, setShorterResult] = useState<number[]>();
  const [longerResult, setLongerResult] = useState<number[]>();

  // function to only create edges between nodes that are a certain distance apart,
  // with largest nodes being able to "reach" farther
  const decideEdges = (node1: PointType, node2: PointType): boolean => {
    const factor =
      Math.pow(sizeToNumber[node1.size].r, 1.5) *
      Math.pow(sizeToNumber[node2.size].r, 1.5);
    return (
      Math.hypot(node1.lat - node2.lat, node1.long - node2.long) < 0.03 * factor
    );
  };

  // create edges between the nodes, give them weights based on their distance apart. Will be used by
  // the Rust code to create the graph
  const edges: LineType[] = nodes
    .map((n) =>
      nodes
        .filter((m) => decideEdges(m, n))
        .map((m) => ({
          id1: n.id,
          id2: m.id,
          weight: Math.hypot(m.lat - n.lat, m.long - n.long),
        }))
    )
    .flat();

  // effect to find the closest edge to the customer node, ran every time customer lat/long updated
  useEffect(() => {
    console.log("HERE");
    // find closest edge
    setClosestEdge(
      nodes.reduce(
        (a, c) => {
          const newWeight = Math.hypot(
            c.lat - parseInt(customerLat),
            c.long - parseInt(customerLong)
          );
          return a.weight > newWeight
            ? { id1: 0, id2: c.id, weight: newWeight }
            : a;
        },
        { id1: 0, id2: 1, weight: 1000 }
      )
    );
  }, [nodes, customerLat, customerLong]);

  // call the Rust code and store the result every time the closest edge or either cache is updated
  const checkForShortest = () => {
    const res = wasm?.get_closest_node(edges, closestEdge, cache1, cache2);
    console.log(res);
    setShorterResult(res.weight1 < res.weight2 ? res.nodes1 : res.nodes2);
    setLongerResult(res.weight1 > res.weight2 ? res.nodes1 : res.nodes2);
  };

  // call the Rust code,
  useEffect(() => {
    loadWasm();
  }, []);

  const loadWasm = async () => {
    try {
      const wasmRes = await import("apple-cdn-demo-wasm");
      setWasm(wasmRes);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="App">
      {
        //   Array.from({ length: 37 }, (v, k) => k).map((p) => (
        //   <Point x={p * 10 - 180} y={-p * 5 + 90} size="small" />
        // ))
      }
      <svg height="1820" width="3900">
        {longerResult?.map((n, i) => {
          if (i === 0) {
            return;
          }
          return (
            <Line
              id1={longerResult[i - 1]}
              id2={n}
              weight={50}
              nodes={[
                ...nodes,
                {
                  id: 0,
                  lat: parseInt(customerLat),
                  long: parseInt(customerLong),
                  size: "large",
                  name: "Customer",
                },
              ]}
              longerRes
            />
          );
        })}
        {shorterResult?.map((n, i) => {
          if (i === 0) {
            return;
          }
          return (
            <Line
              id1={shorterResult[i - 1]}
              id2={n}
              weight={50}
              nodes={[
                ...nodes,
                {
                  id: 0,
                  lat: parseInt(customerLat),
                  long: parseInt(customerLong),
                  size: "large",
                  name: "Customer",
                },
              ]}
              shorterRes
            />
          );
        })}
        {edges.map((e) => (
          <Line {...e} nodes={nodes} />
        ))}
        <Line
          {...closestEdge}
          nodes={[
            ...nodes,
            {
              id: 0,
              lat: parseInt(customerLat),
              long: parseInt(customerLong),
              size: "large",
              name: "Customer",
            },
          ]}
        />
        {nodes.map((p) => (
          <Point {...p} cache={p.id === cache1 || p.id === cache2} />
        ))}
        <Point
          id={0}
          lat={parseInt(customerLat)}
          long={parseInt(customerLong)}
          size="large"
          name="Customer"
        />
      </svg>
      <div className="Floating-ui">
        <div className="Customer-input">
          <label>Customer Latitude</label>
          <input
            type="number"
            value={customerLat}
            onChange={(e) => setCustomerLat(e.target.value)}
          />
          <label>Customer Longitude</label>
          <input
            type="number"
            value={customerLong}
            onChange={(e) => setCustomerLong(e.target.value)}
          />
        </div>
        <div className="Customer-input">
          <label>First End Cache</label>
          <select
            value={cache1}
            onChange={(e) => setCache1(parseInt(e.target.value))}
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
          <label>Second End Cache</label>
          <select
            value={cache2}
            onChange={(e) => setCache2(parseInt(e.target.value))}
          >
            {nodes
              .filter((n) => cache1 !== n.id)
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
          </select>
        </div>
        <div className="Customer-input">
          <button onClick={checkForShortest}>
            Click to find the closest cache!
          </button>
          <button
            onClick={() => {
              setLongerResult(undefined);
              setShorterResult(undefined);
            }}
          >
            Clear Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
const nodeInfo: PointInfoType[] = [
  { lat: -105, long: 40, size: "medium", name: "Denver" },
  { lat: -118, long: 34, size: "large", name: "LA" },
  { lat: -122, long: 38, size: "large", name: "SF" },
  { lat: -122, long: 48, size: "medium", name: "Seattle" },
  { lat: -95, long: 30, size: "large", name: "Houston" },
  { lat: -112, long: 41, size: "small", name: "SLC" },
  { lat: -112, long: 33, size: "medium", name: "Phoenix" },
  { lat: -97, long: 33, size: "medium", name: "Dallas" },
  { lat: -90, long: 30, size: "small", name: "New Orleans" },
  { lat: -90, long: 39, size: "small", name: "St Louis" },
  { lat: -88, long: 42, size: "large", name: "Chicago" },
  { lat: -80, long: 26, size: "medium", name: "Miami" },
  { lat: -84, long: 34, size: "medium", name: "Atlanta" },
  { lat: -74, long: 41, size: "large", name: "NYC" },
  { lat: -71, long: 42, size: "medium", name: "Boston" },
  { lat: -93, long: 45, size: "small", name: "Minneapolis" },
  { lat: -77, long: 39, size: "large", name: "DC" },
  { lat: -79, long: 36, size: "small", name: "Raleigh" },
  { lat: -79, long: 44, size: "large", name: "Toronto" },
  { lat: -74, long: 45, size: "large", name: "Montreal" },
  { lat: -97, long: 50, size: "small", name: "Winnipeg" },
  { lat: -115, long: 51, size: "small", name: "Calgary" },
  { lat: -113, long: 54, size: "medium", name: "Edmonton" },
  { lat: -123, long: 49, size: "large", name: "Vancouver" },
  { lat: -99, long: 20, size: "large", name: "Mexico City" },
  { lat: -65, long: 32, size: "small", name: "Bermuda" },
  { lat: -84, long: 9, size: "large", name: "San Jose" },
  { lat: -83, long: 23, size: "small", name: "Havana" },
  { lat: -74, long: 4, size: "medium", name: "Bogota" },
  { lat: -58, long: -35, size: "large", name: "Buenos Aires" },
  { lat: -43, long: -22, size: "large", name: "Rio de Janeiro" },
  { lat: -46, long: -22, size: "medium", name: "Sao Paulo" },
  { lat: -68, long: -16, size: "medium", name: "La Paz" },
  { lat: -66, long: 10, size: "medium", name: "Caracas" },
  { lat: -60, long: -3, size: "large", name: "Manaus" },
  { lat: -70, long: 18, size: "small", name: "Santo Domingo" },
  { lat: -58, long: -25, size: "small", name: "Asuncion" },
  { lat: -48, long: -15, size: "medium", name: "Brasilia" },
  { lat: -48, long: -1, size: "small", name: "Belem" },
  { lat: -77, long: -12, size: "medium", name: "Lima" },
  { lat: -78, long: 0, size: "small", name: "Quito" },
];
