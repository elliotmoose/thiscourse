function buildTree(_nodes) {
    let nodes = JSON.parse(JSON.stringify(_nodes));
    let nodesArray = Object.values(nodes);
    for (let node of nodesArray) {
        if(!nodes[node.parentId]) {
            continue;
        }

        if(nodes[node.parentId].children) {
            nodes[node.parentId].children.push(node);            
        }
        else {
            nodes[node.parentId].children = [node];            
        }
    }
    
    let rootNode = Object.values(nodes).find((node)=>node.parentId==null);    

    recurseWidths(rootNode);
    return rootNode;
}


function recurseWidths(node) {
    let width = 0;
    
    if(node.children) {
        for (let child of node.children) {
            width += recurseWidths(child);
        }
    }

    let nodeWidth = Math.max(1, width);
    node.width = nodeWidth;
    return nodeWidth;
}

function dfs(visited, rootNode, arr, l, i){
    let level = l + 1;
    let idx = i;
    let node = rootNode;
    let out_arr = arr; 
    // console.log(level,idx);
    // console.log(out_arr);


    if(!visited.has(node.id)){
        // console.log(visited);
        try{
            // try push to level
            out_arr[level].push(idx);
        }
        catch(err){
            // If level does not exist, push to new level
            out_arr.push([idx]);
        }

        // Add to visited node
        console.log(`at level ${level} node ${idx}`)
        visited.add(node.id);
        if(node.children){
            // If node has children, loop through children
            for(var ii = 0; ii < node.children.length; ii++){
                // console.log( node.children[ii]);
                let out_idx = dfs(visited, node.children[ii], out_arr,level, idx);
                // idx = out_idx+1;
                // idx += 1;

                console.log(`Backtrack! out_idx: ${out_idx} idx: ${idx}`)
                if(ii<node.children.length-1){
                    idx = 1+out_idx;
                }else{
                    idx = out_idx;
                }
            }
        }
        return idx;
        // console.log(idx);
        
    }
    
}



function byLevel(rootNode) {
    let levels = []
    let out_arr = [];
    let visited = new Set();

    dfs(visited, rootNode, out_arr, -1, 1);

    let node = rootNode;
    let queue = [rootNode];
    console.log(out_arr);
    while(queue.length != 0) {
        let tempQueue = [] 
        for(let node of queue) {
            let children = node.children;
            if(!children) {
                continue;
            }
            //append to temp queue
            tempQueue = [...tempQueue, ...children];
        }
        
        levels.push(queue);
        queue = tempQueue;
    }

    for(var i=0; i< levels.length; i++){
        for(var ii=0; ii< levels[i].length; ii++){
            levels[i][ii].width = out_arr[i][ii];
        }

    }

    // console.log(levels);
    return levels;
}
const Tree = { buildTree, byLevel, dfs};
export default Tree;