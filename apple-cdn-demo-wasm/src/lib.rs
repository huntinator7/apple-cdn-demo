extern crate wasm_bindgen;
// use fast_paths;
use petgraph::algo::astar;
use petgraph::graph::{NodeIndex, UnGraph};
use wasm_bindgen::prelude::*;
// use web_sys::console;
extern crate console_error_panic_hook;

#[macro_use]
extern crate serde_derive;

#[derive(Deserialize)]
pub struct Element {
    id1: isize,
    id2: isize,
    weight: f64,
}

// impl<E> IntoWeightedEdge<E> for Element {
//     type NodeId = isize;
// fn into_weighted_edge(self) -> (isize, isize, E) {
//     (self.id1, self.id2, E)
// }
// }

#[derive(Deserialize, Serialize)]
pub struct Return {
    weight1: f64,
    nodes1: Vec<NodeIndex>,
    weight2: f64,
    nodes2: Vec<NodeIndex>,
}

#[wasm_bindgen]
pub fn get_closest_node(
    edges: &JsValue,
    closest_edge: &JsValue,
    cache1: usize,
    cache2: usize,
) -> JsValue {
    console_error_panic_hook::set_once();

    let mut elements: Vec<Element> = edges.into_serde().unwrap();
    elements.push(closest_edge.into_serde().unwrap());
    let mut element_tuples: Vec<(u32, u32, f64)> = vec![];
    for e in elements {
        element_tuples.push((e.id1 as u32, e.id2 as u32, e.weight));
    }

    // Create an undirected graph with `u32` nodes and edges with `()` associated data.
    let g = UnGraph::<(), f64>::from_edges(&element_tuples);

    // Find the shortest path from 0 (the customer) to each cache node
    let shortest_path_cache_1 = astar(
        &g,
        0.into(),
        |finish| finish == (cache1 as u32).into(),
        |e| *e.weight(),
        |_| 0.,
    );
    let shortest_path_cache_2 = astar(
        &g,
        0.into(),
        |finish| finish == (cache2 as u32).into(),
        |e| *e.weight(),
        |_| 0.,
    );

    let mut return_value = Return {
        weight1: 0.,
        nodes1: vec![],
        weight2: 0.,
        nodes2: vec![],
    };

    match shortest_path_cache_1 {
        Some(p) => {
            // the weight of the shortest path
            return_value.weight1 = p.0;

            // all nodes of the shortest path (including source and target)
            return_value.nodes1 = p.1;
        }
        None => {
            // no path has been found (nodes are not connected in this graph)
        }
    }

    match shortest_path_cache_2 {
        Some(p) => {
            // the weight of the shortest path
            return_value.weight2 = p.0;

            // all nodes of the shortest path (including source and target)
            return_value.nodes2 = p.1;
        }
        None => {
            // no path has been found (nodes are not connected in this graph)
        }
    }

    JsValue::from_serde(&return_value).unwrap()
}
