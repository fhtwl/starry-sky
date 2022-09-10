import VueSocketIO from 'vue-socket.io';

import { App } from 'vue';

export default function setupSocketIO(app: App<Element>) {
  app.use(
    new VueSocketIO({
      debug: true,
      connection: 'http://localhost:9002', //
    })
  );
}
