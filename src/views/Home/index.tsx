import { computed, defineComponent } from 'vue';
import { useStore } from '@/store/system/user';
import './index.less';
import Login from './Login';
import Square from './Square';
import Sky from './Sky';

export default defineComponent({
  setup() {
    const userStore = useStore();
    const name = computed(() => userStore.name);
    return {
      name,
    };
  },
  render() {
    const { name } = this;
    return (
      <div class="container">
        <Login />
        <Sky />
      </div>
    );
  },
});
