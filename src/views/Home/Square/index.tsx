import { defineComponent, getCurrentInstance, ref } from 'vue';
import { io } from 'socket.io-client';
export default defineComponent({
  setup() {
    const instance = getCurrentInstance();

    const socket = io();
    socket.emit('message', 'xxx');
    socket.on('message', (data) => {
      console.log(data);
    });
    (window as unknown as { send: Common.Fun }).send = (msg) => {
      console.log(msg);
      socket.emit('message', msg);
    };
    return {};
  },
  render() {
    return <div class="container"></div>;
  },
});
