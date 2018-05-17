
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
  private arrow;

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
      var mat = new THREE.MeshLambertMaterial({
        color: 0x094beb,
        emissive: 0x7f145f
      });
      var group = new THREE.Mesh(geometry, mat);

      console.log(geometry);

      // for (var f = 0, f1 = geometry.faces.length; f < f1; f++) {
      //   var face = geometry.faces[f];
      //   var centroid = new THREE.Vector3(0, 0, 0);

      //   centroid.add(geometry.vertices[face.a]);
      //   centroid.add(geometry.vertices[face.b]);
      //   centroid.add(geometry.vertices[face.c]);
      //   centroid.divideScalar(3);
      //   var arrow= new THREE.ArrowHelper(face.normal,centroid,2,0x3333ff,0.5,0.5);
      //   scene.add(arrow);
      // }

      scene.add(group);
    });
    loader1.load('../../assets/model/die1.stl', function (geometry) {
      scene.add(new THREE.Mesh(geometry));
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
    var ambiColor = "#1c1c1c";
    var ambientLight = new THREE.AmbientLight(ambiColor);
    this.scene.add(ambientLight);



    var pointColor = "#ffffff";
    var directionalLight = new THREE.DirectionalLight(pointColor);
    directionalLight.position.set(-400, 600, -100);
    directionalLight.castShadow = true;
    directionalLight.shadowCameraNear = 2;
    directionalLight.shadowCameraFar = 200;
    directionalLight.shadowCameraLeft = -50;
    directionalLight.shadowCameraRight = 50;
    directionalLight.shadowCameraTop = 50;
    directionalLight.shadowCameraBottom = -50;

    directionalLight.intensity = 0.5;
    directionalLight.shadowMapHeight = 1024;
    directionalLight.shadowMapWidth = 1024;


    this.scene.add(directionalLight);

    //add spotlight for the shadows
    var spotLight = new THREE.DirectionalLight(0xff5808);
    spotLight.position.set(-800, 800, 900);
    // spotLight.castShadow = true;
    // spotLight.target = new THREE.Object3D(){};
    this.scene.add(spotLight);

    // var light = new THREE.PointLight(0xffffff);
    // light.position.set(150, 150, 150);
    // light.castShadow = true;
    // this.scene.add(light);
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
    // window.requestAnimationFrame(_ => this.startRendering());

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 1);
    //this.renderer.setClearColor(new THREE.Color(0x000, 1.0, 1.0));
    this.renderer.shadowMapEnabled = true;
    this.renderer.autoClear = true;

    let component: LoadStlComponent = this;

    // find intersections
    //  this.raycaster.setFromCamera( this.mouse, this.camera );
    // var intersects = this.raycaster.intersectObjects( this.scene.children );
    // if ( intersects.length > 0 ) {
    //   if ( INTERSECTED != intersects[ 0 ].object ) {
    //     if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    //     INTERSECTED = intersects[ 0 ].object;
    //     INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
    //     INTERSECTED.material.emissive.setHex( 0xff0000 );
    //   }
    // } else {
    //   if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    //   INTERSECTED = null;
    // }


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
    alert('aa');
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    // console.log(this.mouse);

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

    //新建一个三维单位向量 假设z方向就是0.5
    //根据照相机，把这个向量转换到视点坐标系
    var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera);
    //在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
    var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

    //射线和模型求交，选中一系列直线
    var intersects = raycaster.intersectObjects(this.scene.children);
    if (intersects.length > 0) {
      //选中第一个射线相交的物体  
      if (this.lastSelectObj != intersects[0].object) {
        //选中的物体颜色
        var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000088 });
        if (this.lastSelectObj && this.lastSelectObj_material)
          this.lastSelectObj.material = this.lastSelectObj_material;//恢复上一个选中物体颜色
        this.lastSelectObj = intersects[0].object;
        this.lastSelectObj_material = this.lastSelectObj.material;
         this.lastSelectObj.material = cubeMaterial;//修改当前选中物体颜色
      }

      //射线和模型求交，选中一系列直线  
      var face = this.lastSelectObj.geometry.faces[0];
       console.log("selected face:");
      console.log(face);
      // face.material= new THREE.MeshBasicMaterial({ color: 0x000088 }); 

      // var material_line = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 2, transparent: true });
      // this.line = new THREE.Line(this.lastSelectObj.geometry, material_line);
      // this.scene.add(this.line);

      // var linePosition = this.line.geometry.attributes.position;
      // alert(88);
      // console.log(linePosition);

      this.scene.remove(this.arrow);
      var centroid = new THREE.Vector3(0, 0, 0);
      console.log(this.lastSelectObj.geometry);
      centroid.add(this.lastSelectObj.geometry.vertices[face.a]);
      centroid.add(this.lastSelectObj.geometry.vertices[face.b]);
      centroid.add(this.lastSelectObj.geometry.vertices[face.c]);
      centroid.divideScalar(3);
 
       this.arrow = new THREE.ArrowHelper(face.normal, centroid, 20, 0xffff66, 5, 5);
      this.scene.add(this.arrow);
      console.log("arrow:");  
      console.log(this.arrow);  

    }
    else {
      if (this.lastSelectObj)
        this.lastSelectObj.material = this.lastSelectObj.material;
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

