
import { AfterViewInit, Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';

import "./js/STLLoader";
import "./js/Yan";
import { Sphere } from 'three';
import { equal } from 'assert';

@Component({
  selector: 'app-load-stl',
  templateUrl: './load-stl.component.html',
  styleUrls: ['./load-stl.component.css']
})
export class LoadStlComponent {

  private renderer: THREE.WebGLRenderer;
  // create a camera, which defines where we're looking at.
  private camera: THREE.PerspectiveCamera;
  public group: THREE.Mesh;
  public plane: THREE.Mesh
  private scene: THREE.Scene;

  public fieldOfView: number = 80;
  public nearClippingPane: number = 0.1;
  public farClippingPane: number = 1900;
  private raycaster;
  private lastSelectObj;
  private mouse = new THREE.Vector2();
  // private INTERSECTED;
  public aycaster = new THREE.Raycaster();
  private sphere;

  public controls: THREE.OrbitControls;

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  constructor() {
    this.render = this.render.bind(this);
    this.onModelLoadingCompleted = this.onModelLoadingCompleted.bind(this);
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxisHelper(100));

    var planeGeometry = new THREE.PlaneGeometry(600, 200, 200, 200);
    var planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.receiveShadow = true;

    // rotate and position the plane
    this.plane.rotation.x = -0.5 * Math.PI;
    this.plane.position.x = 15;
    this.plane.position.y = 0;
    this.plane.position.z = 0;
    // this.scene.add(this.plane);
    /**
     * size 网格总边长
     * step 网格个数
     * colorCenterLine  网格中心线颜色
     * colorGrid    网格其他线颜色
     */
    var gridHelper = new THREE.GridHelper(2000, 50, 0xff0000, 0xA9A9A9);
    gridHelper.position.y = -100;
    gridHelper.position.x = 0;
    this.scene.add(gridHelper);


    var loader = new THREE.ColladaLoader();
    loader.load('assets/model/multimaterial.dae', this.onModelLoadingCompleted);
    var group = this.group;
    var scene = this.scene;
    //var p=Hello();
    var loader1 = new THREE.STLLoader();
    loader1.load('../../assets/model/cast.stl', function (geometry) {
      var material = new THREE.MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 200 });
      var mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(2, 2, 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      var group = new THREE.Mesh(geometry, material);
      console.log(geometry);
      scene.add(group);
    });

    loader1.load('../../assets/model/die1.stl', function (geometry) {
      var material = new THREE.MeshPhongMaterial({ color: 0xAAAAAA, specular: 0x111111, shininess: 200 });
      var mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(2, 2, 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      var die = new THREE.Mesh(geometry, material);
      scene.add(die);
    });

  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  private onModelLoadingCompleted(collada) {
    var modelScene = collada.scene;
    this.scene.add(modelScene);
    this.render();
  }


  private createLight() {

    this.scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
    //add spotlight for the shadows
    var spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position.set(-800, 800, 900);
    this.scene.add(spotLight);
  }

  private createCamera() {
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );

    // Set position and look at
    this.camera.position.x = 500;//150;
    this.camera.position.y = 500;//150;
    this.camera.position.z = 500;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private getAspectRatio(): number {
    let height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private startRendering() {
    // if (this.group) {
    //   this.group.rotation.z += 0.006;
    //   //  group.rotation.x+=0.006;
    // }
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMapEnabled = true;
    this.renderer.autoClear = true;

    let component: LoadStlComponent = this;

    (function render() {
      //requestAnimationFrame(render);
      component.render();
    }());
  }

  public addControls() {
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.addEventListener('change', this.render);

  }

  public onDocumentMouseMove(event: MouseEvent) {
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    this.aycaster.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster.intersectObjects(this.scene.children);
    console.log(intersects);
    if (intersects.length > 0) {
      if (this.lastSelectObj != intersects[0].object) {
        if (this.lastSelectObj) this.lastSelectObj.material.emissive.setHex(this.lastSelectObj.currentHex);
        this.lastSelectObj = intersects[0].object;
        this.lastSelectObj.currentHex = this.lastSelectObj.material.emissive.getHex();
        this.lastSelectObj.material.emissive.setHex(0xff0000);
      }
    }
    else {
      if (this.lastSelectObj)
        this.lastSelectObj.material.emissive.setHex(this.lastSelectObj.currentHex);
      this.lastSelectObj = null;
    }
  }

  private findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
    // NOTE: Better to keep separate array of selected objects
    if (parent.children.length > 0) {
      parent.children.forEach((i) => {
        pred.push(i);
        this.findAllObjects(pred, i);
      });
    }
  }

  public onMouseUp(event: MouseEvent) {
    console.log("onMouseUp");
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    console.log("onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight);

    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.render();
  }

  @HostListener('document:keypress', ['$event'])
  public onKeyPress(event: KeyboardEvent) {
    console.log("onKeyPress: " + event.key);
  }

  private lastSelectObj_material;
  //点击事件
  @HostListener('mousedown', ['$event']) onMousedown(event) {
    console.log("onMouseDown");
    event.preventDefault();

    // Example of mesh selection/pick:
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    //射线和模型求交，选中一系列直线
    var intersects = this.raycaster.intersectObjects(this.scene.children);
    if (intersects.length > 0) {
      //选中第一个射线相交的物体  
      if (this.lastSelectObj != intersects[0].object) {
        // //选中的物体颜色
        // var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000088 });
        // if (this.lastSelectObj && this.lastSelectObj_material)
        //   this.lastSelectObj.material = this.lastSelectObj_material;//恢复上一个选中物体颜色
        this.lastSelectObj = intersects[0].object;
        // this.lastSelectObj_material = this.lastSelectObj.material;
        // this.lastSelectObj.material = cubeMaterial;//修改当前选中物体颜色
      }


      console.log(intersects[0]);
      alert(444);
      var material = new THREE.LineBasicMaterial({ opacity: 1.0, linewidth: 5, vertexColors: THREE.VertexColors });
      alert(555);
      this.lastSelectObj.material.add(material);
      //射线和模型求交，选中一系列直线 
      var face = intersects[0].face;
      intersects[0].face.materialIndex = 1;
      // intersects[0].face.color.setHex(Math.random() * 0xffffff);
      console.log("selected face:");
      console.log(face);

      this.scene.remove(this.sphere);
      this.sphere = new THREE.Mesh(
        new THREE.SphereGeometry(2, 2),                //width,height,depth
        new THREE.MeshLambertMaterial({ color: 0xff0000 }), //材质设定 
      );

      this.sphere.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
      this.scene.add(this.sphere);
      //this.arrow = new THREE.ArrowHelper(face.normal, intersects[0].point, 20, 0xffff66, 5, 5);
      //this.scene.add(this.arrow);

    }
    else {
      // if (this.lastSelectObj)
      //   this.lastSelectObj.material = this.lastSelectObj_material;
      this.lastSelectObj = null;
    }
    this.startRendering();
  }

  /* LIFECYCLE */
  ngAfterViewInit() {
    this.createScene();
    this.createLight();
    this.createCamera();
    this.startRendering();
    this.addControls();
  }

}

