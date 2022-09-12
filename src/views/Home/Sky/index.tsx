import Graph from './Graph';
import { defineComponent, getCurrentInstance, onMounted } from 'vue';
import './index.less';

export default defineComponent({
  setup() {
    onMounted(() => {
      const instance = getCurrentInstance();

      fetch('https://static.fhtwl.cc/demo/knowledge-graph/npmdep.json')
        .then((text) => text.json())
        .then((res) => {
          const data = res as KnowledgeGraphRes.GetData;
          const nodes = data.nodes
            .map(function (nodeName, idx) {
              return {
                id: nodeName,
                name: nodeName,
                val: data.dependentsCount[idx],
              };
            })
            .splice(0.2);
          // const links = [];
          // for (let i = 0; i < data.edges.length; ) {
          //   const s = data.edges[i++];
          //   const t = data.edges[i++];
          //   links.push({
          //     source: nodes[s].id,
          //     target: nodes[t].id,
          //   });
          // }
          const graphChart = new Graph({
            el: 'chart',
            // onClick,
            // onRightClick,
            linkVal: 40,
            // nodes: res.nodes.map(item => {
            //     return {
            //         ...item,
            //         isVisibility: true
            //     }
            // }),
            nodes,
            links: [],
            // isFlycenter: true
            isFlycenter: true,
          });
          console.log(graphChart, graphChart.graph);
        });

      // https://static.fhtwl.cc/demo/knowledge-graph/npmdep.json

      // https://www.npmjs.com/search?q=lodash
    });
  },
  render() {
    return <div id="chart"></div>;
  },
});
