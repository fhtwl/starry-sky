import { defineComponent, getCurrentInstance, ref } from 'vue';
import './index.less';

export default defineComponent({
  setup() {
    const instance = getCurrentInstance();
    const name = ref('');
    const login = function () {
      instance?.proxy?.$router.push('/square');
    };
    return {
      name,
      login,
    };
  },
  render() {
    const { name, login } = this;
    return (
      <div class="container">
        <div class="bg">
          <div class="box-shadow"></div>
          <div class="border"></div>
        </div>

        <div class="wrap">
          <a-input value={name} placeholder="请输入用户名"></a-input>
          <a-button onClick={login}>前往广场</a-button>
        </div>
      </div>
    );
  },
});
