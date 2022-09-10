import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
import { CubeTexturePass } from 'three/examples/jsm/postprocessing/CubeTexturePass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ThreeForceGraph from 'three-forcegraph';
import SpriteText from 'three-spritetext';
// import { CSS2DRenderer } from './CSS2DRenderer';
import IMG_TXT from '@/assets/images/3@2x.png';
import IMG_BG from '@/assets/images/starfield.jpg';
import { Camera, PerspectiveCamera, Renderer, Scene } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// import * as d3 from 'd3'
// const THREE  = window.THREE

// interface InitNode {
//   name: string;
//   value: number;
//   group?: number;
//   dataType?: string;
// }

type DataType = 'link' | 'node';

// 坐标类型
type CoordinateType = 'x' | 'y' | 'z';

interface Coords {
  x: number;
  y: number;
  z: number;
}

interface ObjectNode {
  group?: number;
  dataType?: DataType;
  x?: number;
  y?: number;
  z?: number;
  label?: string;
  user?: string;
  groupId?: string;
  id?: string;
  __threeObj?: any;
}

interface ChartNode extends ObjectNode {
  name: string;
  // value: number;
  val: number;
}

interface Link<T = string | number> extends ObjectNode {
  source: T;
  target: T;
  dataType?: DataType;
  label?: string;
}

interface ConfigOptions {
  el: string;
  onClick?: Common.Fun;
  onRightClick?: Common.Fun;
  onLinkClick?: Common.Fun;
  onLinkRightClick?: Common.Fun;
  nodes: ChartNode[];
  links: Link<string>[];
  onLinkHover?: Common.Fun;
  linkVal?: number;
  isFlycenter?: boolean;
}

export interface ChartData {
  nodes: ChartNode[];
  links: Link<string>[];
}

const times: NodeJS.Timeout[] = [];
export default class GroupChart {
  public elem: HTMLElement;
  private isStopFly: boolean;
  public data: ChartData;
  public highlightLinks = new Set();
  public graph: ThreeForceGraph;
  public bloomPass!: UnrealBloomPass;
  public scene!: Scene;
  public camera!: Camera;
  public controls!: object;
  public outlinePass!: OutlinePass;
  public renderer!: THREE.WebGLRenderer;
  composer!: EffectComposer;
  clock!: THREE.Clock;
  orbitControls!: OrbitControls;
  constructor({
    el,
    onClick,
    onRightClick,
    nodes,
    links,
    linkVal,
    isFlycenter,
  }: ConfigOptions) {
    this.isStopFly = false;
    this.elem = document.getElementById(el)!;
    this.data = {
      nodes: [...nodes],
      links: [...links],
    };
    console.log(this.data);
    const graph = new ThreeForceGraph()
      .graphData(this.data)
      .nodeVal((params) => {
        // 设置球体大小，默认4
        // return params.value
        return (params as unknown as ChartNode)?.val || 10;
      })
      .nodeVisibility(() => {
        return true;
      })
      .nodeColor(() => {
        //['#FC6102',
        const colors = ['#427fd1', '#7250d2', '#b5596d', '#39bdb4'];
        return colors[Math.ceil(Math.random() * 5)];
      })
      .nodeOpacity(0.75) // 不透明度，默认0.75
      .nodeResolution(8) // 每个节点的几何分辨率，值越高，越光滑，默认8
      .nodeThreeObjectExtend(true) // 是否只是修改节点对象而不是替换，默认false
      .nodeThreeObject((node) => {
        // 节点对象访问器
        (node as unknown as ChartNode).dataType = 'node';
        const spriteText = this.setNodeText(node as ChartNode);
        // let spriteImg = this.setNodeImg()
        // return this.setNode([spriteText, spriteImg]) // 使用图片，放大后依旧会有锯齿
        return spriteText;
        // node.value = node.group *6
      })

      // .enablePointerInteraction(false) // 关闭鼠标悬浮、点击事件
      // .enableNodeDrag(false)
      // .onNodeClick(node =>{})
      // .onNodeClick((node, event) => {
      //   this.isStopFly = true;
      //   console.log(node);
      //   this.callback(onClick!, node, event);
      // })
      // .onNodeRightClick((node, event) => {
      //   this.isStopFly = true;
      //   this.callback(onRightClick!, node, event);
      // })
      .linkResolution(30)
      .linkThreeObjectExtend(true)
      .linkThreeObject((link) => {
        (link as Link).dataType = 'link';
        const sprite = new SpriteText((link as Link).label);
        sprite.color = 'rgba(255,255,255,0.6)';
        sprite.textHeight = 1.5;
        // sprite.scale.set(10,5,0)
        // if(!link.isLabelShow){
        //     sprite.color = "transparent"
        // }
        return sprite;
      })
      .linkPositionUpdate((sprite, { start, end }) => {
        if (!sprite) {
          return false;
        }
        const conf: CoordinateType[] = ['x', 'y', 'z'];
        const middlePos = conf.map((c) => ({
          [c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
        }));

        Object.assign(sprite.position, [...middlePos]);
        return false;
      });
    this.graph = graph;
    this.init();
  }

  init() {
    // setup renderer
    this.renderer = new THREE.WebGL1Renderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.elem.appendChild(this.renderer.domElement);

    // setup scene
    this.scene = new THREE.Scene();
    this.scene.add(this.graph);
    this.scene.add(new THREE.AmbientLight(0xbbbbbb));

    // setup camera
    this.camera = new THREE.PerspectiveCamera(
      1000,
      window.innerWidth / window.innerHeight
    );
    this.camera.lookAt(this.graph.position);
    this.camera.position.z = 3000; //Math.cbrt(1) * 180;

    this.createControls();
    this.createComposer();
    this.setOutlinePass();
    this.aniamte();
  }

  // getOffscreenCanvas() {
  //   const canvas = new OffscreenCanvas(100, 1);
  // }

  aniamte() {
    this.graph?.tickFrame();
    const delta = this.clock.getDelta();
    this.orbitControls.update();
    this.renderer.render(this.scene!, this.camera!);
    this.composer.render(delta);
    requestAnimationFrame(this.aniamte.bind(this));
  }

  createControls() {
    this.clock = new THREE.Clock();
    this.orbitControls = new OrbitControls(this.camera, this.elem);
  }

  createComposer() {
    // 创建renderPass通道
    const renderPass = new RenderPass(this.scene!, this.camera!);

    // 创建效果组合器
    this.composer = new EffectComposer(this.renderer!);
    this.composer.addPass(renderPass);
  }

  /**
   * 添加边缘发光
   */
  setOutlinePass() {
    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene!,
      this.camera!
    ); // UnrealBloomPass(); // OutlinePass
    outlinePass.renderToScreen = true;
    outlinePass.edgeStrength = 8.7;
    outlinePass.edgeGlow = 0;
    outlinePass.edgeThickness = 2.6;
    outlinePass.pulsePeriod = 2;
    outlinePass.usePatternTexture = false;
    outlinePass.visibleEdgeColor.set('#FC6102');
    outlinePass.hiddenEdgeColor.set('#190a05');
    this.composer!.addPass(outlinePass);
    this.outlinePass = outlinePass;
  }

  setNodeText(node: ChartNode) {
    const sprite = new SpriteText(node.label || node.user);
    // sprite.color = '#fff';
    sprite.color = this.colorReverse(node.groupId || '#fff');
    sprite.backgroundColor = 'transparent';
    // sprite.color = '#000'
    sprite.textHeight = 1.5;
    sprite.scale.set(8, 4, 0);
    // sprite.scale.set(8,4,0)
    // console.log(sprite)
    return sprite;
  }

  // 更新数据
  update(data: ChartData) {
    this.data = data ? data : this.data;
    this.graph.graphData(this.data);
    this.graph.refresh();
    if (this.data.nodes.length > 0) {
      // setTimeout(() => {
      //   this.fly(this.data.nodes[0], this.graph);
      // }, 200);
    }
    console.log(this.data);
  }

  /**
   * 判断函数，并执行函数
   * @param { Function } fn
   * @param { unknown } data
   * @param { Event } event
   */
  callback(fn: Common.Fun, data: unknown, event: Event) {
    typeof fn === 'function' ? fn(data, event) : void 0;
  }
  /**
   * 获取鼠标事件获取到的元素
   */
  raycastMeshes(
    callback: Common.Fun,
    raycaster: THREE.Raycaster,
    event: Event
  ) {
    let intersects = [];
    // 获取整个场景
    const theScene = this.scene || new THREE.Scene();
    // 获取鼠标点击点的射线
    const theRaycaster = raycaster || new THREE.Raycaster();
    // 对场景及其子节点遍历
    for (const i in theScene.children) {
      // 如果场景的子节点是Group或者Scene对象
      if (
        theScene.children[i] instanceof THREE.Group ||
        theScene.children[i] instanceof THREE.Scene
      ) {
        // 场景子节点及其后代，被射线穿过的模型的数组集合
        // intersects = theRaycaster.intersectObjects(theScene.children[i].children, true)
        const rayArr = theRaycaster.intersectObjects(
          theScene.children[i].children,
          true
        );
        intersects.push(...rayArr);
      } else if (theScene.children[i] instanceof THREE.Mesh) {
        // 如果场景的子节点是Mesh网格对象，场景子节点被射线穿过的模型的数组集合
        // intersects.push(theRaycaster.intersectObject(theScene.children[i]))
      }
    }
    intersects = this.filtersVisibleFalse(intersects); // 过滤掉不可见的
    // 被射线穿过的模型的数组集合
    if (intersects && intersects.length > 0) {
      return callback(intersects, event);
    } else {
      // this.hiddenDetailDiv()
      return null;
    }
  }
  /**
   * 过滤隐藏的元素
   */
  filtersVisibleFalse(
    arr: {
      object: {
        visible: boolean;
      };
    }[]
  ) {
    let arrList = arr;
    if (arr && arr.length > 0) {
      arrList = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].object.visible) {
          arrList.push(arr[i]);
        }
      }
    }
    return arrList;
  }
  /**
   * 获取拾取到的元素，并执行回调函数
   */
  getNode(
    callback: Common.Fun,
    intersects: {
      object: {
        __data: unknown;
        parent: { __data: unknown };
      };
    }[],
    event: Event
  ) {
    // let selectedObjects = null
    if (intersects[0].object !== undefined) {
      //   console.log(intersects[0].object, '这就是成功点击到的对象了~')

      // 有可能点到线上的文字
      this.callback(
        callback,
        intersects[0].object?.__data || intersects[0].object.parent.__data,
        event
      );
    }
  }

  //颜色取反方法
  colorReverse(oldColorValue: string) {
    const color = Number('0x' + oldColorValue.replace(/#/g, ''));
    const str = '000000' + (0xffffff - color).toString(16);
    return '#' + str.substring(str.length - 6, str.length);
  }
  empty() {
    const elem = this.elem;
    while (elem.lastChild) elem.removeChild(elem.lastChild);
  }
}
