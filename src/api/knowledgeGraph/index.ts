import http from '@/utils/http';

const api = {
  getData: `https://static.fhtwl.cc/demo/knowledge-graph/npmdep.json`,
};

export function getData(): Promise<KnowledgeGraphRes.GetData> {
  return http.post(api.getData);
}
