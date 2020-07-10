extern crate wasm_bindgen;
// use fast_paths;
use wasm_bindgen::prelude::*;
// use web_sys::console;
extern crate console_error_panic_hook;

#[macro_use]
extern crate serde_derive;

#[derive(Deserialize)]
pub struct Element {
    id1: usize,
    id2: usize,
    weight: f64,
}

#[derive(Deserialize, Serialize)]
pub struct Return {
    weight1: usize,
    nodes1: Vec<usize>,
    weight2: usize,
    nodes2: Vec<usize>,
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

    // init graph
    // let mut input_graph = fast_paths::InputGraph::new();

    // add edges between all the edges
    // for i in &elements {
    //     input_graph.add_edge(i.id1, i.id2, i.weight);
    // }

    // freeze the graph before using it
    // input_graph.freeze();

    // prepare the graph for fast shortest path calculations
    // let fast_graph = fast_paths::prepare(&input_graph);

    // calculate the shortest path between the customer node and each of the cache locations
    // let shortest_path_cache_1 = fast_paths::calc_path(&fast_graph, 0, cache1);
    // let shortest_path_cache_2 = fast_paths::calc_path(&fast_graph, 0, cache2);

    let mut return_value = Return {
        weight1: 10,
        nodes1: vec![0, 1, 2, 3, cache1],
        weight2: 20,
        nodes2: vec![0, 4, 5, 7, 8, cache2],
    };

    // match shortest_path_cache_1 {
    //     Some(p) => {
    //         // the weight of the shortest path
    //         return_value.weight1 = p.get_weight();

    //         // all nodes of the shortest path (including source and target)
    //         return_value.nodes1 = p.get_nodes().to_vec();
    //     }
    //     None => {
    //         // no path has been found (nodes are not connected in this graph)
    //     }
    // }

    // match shortest_path_cache_2 {
    //     Some(p) => {
    //         // the weight of the shortest path
    //         return_value.weight2 = p.get_weight();

    //         // all nodes of the shortest path (including source and target)
    //         return_value.nodes2 = p.get_nodes().to_vec();
    //     }
    //     None => {
    //         // no path has been found (nodes are not connected in this graph)
    //     }
    // }

    JsValue::from_serde(&return_value).unwrap()
}
