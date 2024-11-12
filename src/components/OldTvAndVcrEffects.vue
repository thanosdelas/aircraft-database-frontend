<!-- Orignal creator Karl Saunders -->
<!-- https://codepen.io/Mobius1 -->
<!-- https://codepen.io/Mobius1/pen/ZNgwbr -->
<!-- Modifed by me to work with Vue.js -->
<template>
  <div class="screen-container" ref="container">
    <div class="screen-wrapper" ref="wrapper1">
      <div class="screen-wrapper" ref="wrapper2">
        <div class="screen-wrapper" ref="wrapper3">
          <div id="screenElement" ref="screenElement"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';

  const data = defineProps(['featured_image_url']);

  const container = ref(null);
  const wrapper1 = ref(null);
  const wrapper2 = ref(null);
  const wrapper3 = ref(null);
  const screenElement = ref(null);

  const gui = ref(null);
  const screen = ref(null);

  let f1 = null;
  let f2 = null;
  let f3 = null;
  let f4 = null;
  let f5 = null;

  onMounted(() => {
    console.log(data.featured_image_url);

    screen.value = new ScreenEffect(screenElement.value, {});
    gui.value = new dat.GUI();

    gui.value.hide();

    f1 = gui.value.addFolder("Effects");
    f2 = gui.value.addFolder("Snow");
    f3 = gui.value.addFolder("VCR");
    f4 = gui.value.addFolder("Roll");
    f5 = gui.value.addFolder("Image");
    f1.open();
    f2.open();
    f3.open();
    f4.open();
    f5.open();

    initializeConfigEffects(screen.value);

    // Initially this was inside a timeout
    for ( const prop in config.effects ) {
      if ( !!config.effects[prop].enabled ) {
        screen.value.add(prop, config.effects[prop].options);
      }
    }
  });

  onBeforeUnmount(() => {
    console.log("onBeforeUnmount");
    gui.value.destroy();

    for ( const effect in config.effects ) {
      screen.value.remove(effect);
    }

    screen.value.destroy();
  });

  const config = {
    effects: {
      roll: {
        enabled: false,
        options: {
          speed: 1000
        }
      },
      image: {
        enabled: true,
        options: {
          src: data.featured_image_url,
          blur: 1.2
        }
      },
      vignette: { enabled: true },
      scanlines: { enabled: true },
      vcr: {
        enabled: true,
        options: {
          opacity: 1,
          miny: 220,
          miny2: 220,
          num: 70,
          fps: 60
        }
      },
      wobbley: { enabled: true },
      snow: {
        enabled: true,
        options: {
          opacity: 0.2
        }
      },
    },
  };

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function initializeConfigEffects(screen){
    console.log("\n[*] initializeConfigEffects");

    for ( const effect in config.effects ) {
      const type = config.effects[effect];
      f1.add(type, "enabled").name(effect).onChange(bool => {
        if ( bool ) {
          screen.add(effect, config.effects[effect].options);
        } else {
          screen.remove(effect);
        }
      });

      if ( type.options ) {
        let folder = effect === "vcr" || effect === "video" ? f3 : f2;
        for ( const p in type.options ) {
          if ( p === "speed" ) {
            f4.add(type.options, p).min(100).step(1).max(10000).onChange(val => {
              screen.effects[effect].node.style.animationDuration = `${val}ms`;
            });
          }

          if ( p === "opacity" ) {
            folder.add(type.options, p).name(`${effect} opacity`).min(0).step(0.1).max(1).onChange(val => {
              screen.effects[effect].node.style.opacity = val;
            });
          }

          if ( p === "miny" ) {
            folder.add(type.options, p).name(`tracking`).min(0).step(0.1).max(400).onChange(val => {
              screen.effects[effect].config.miny = val;
              screen.effects[effect].config.miny2 = 400 - val;
            });
          }

          if ( p === "num" ) {
            folder.add(type.options, p).name(`tape age`).min(1).step(0.1).max(100).onChange(val => {
              screen.effects[effect].config.num = val;
            });
          }

          if ( p === "blur" ) {
            f5.add(type.options, p).name(`blur`).min(1).step(0.1).max(5).onChange(val => {
              if ( effect === "vcr" ) {
                screen.effects[effect].config.blur = val;
              } else {
                screen.effects[effect].node.style.filter = `blur(${val}px)`;
              }
            });
          }
        }
      }
    }
  }

  class ScreenEffect {
    constructor(parent, options) {
      this.parent = parent;

      this.config = Object.assign({}, {
        //
      }, options)

      this.effects = {};

      this.events = {
        resize: this.onResize.bind(this)
      };

      this.render();
    }

    destroy() {
      window.removeEventListener("resize", this.events.resize, false);
    }

    render() {
      console.log("[*] render");

      this.nodes = {
        "container": container.value,
        "wrapper1": wrapper1.value,
        "wrapper2": wrapper2.value,
        "wrapper3": wrapper3.value
      };

      this.onResize();
    }

    onResize(e) {
      this.rect = this.parent.getBoundingClientRect();

      if ( this.effects.vcr && !!this.effects.vcr.enabled ) {
        this.generateVCRNoise();
      }
    }

    add(type, options) {
      const config = Object.assign({}, {
        fps: 30,
        blur: 1
      }, options);

      if ( Array.isArray(type) ) {
        for ( const t of type ) {
          this.add(t);
        }

        return this;
      }

      const that = this;

      if ( type === "snow" ) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.classList.add(type);

        canvas.width = this.rect.width / 2;
        canvas.height = this.rect.height / 2;

        this.nodes.wrapper2.appendChild(canvas);

        animate();
        // that.generateSnow(ctx);

        function animate() {
          that.generateSnow(ctx);
          that.snowframe = requestAnimationFrame(animate);
        }

        this.effects[type] = {
          wrapper: this.nodes.wrapper2,
          node: canvas,
          enabled: true,
          config
        };

        return this;
      }

      if ( type === "roll" ) {
        return this.enableRoll();
      }

      if ( type === "vcr" ) {
        const canvas = document.createElement("canvas");
        canvas.classList.add(type);
        this.nodes.wrapper2.appendChild(canvas);

        canvas.width = this.rect.width;
        canvas.height = this.rect.height;

        this.effects[type] = {
          wrapper: this.nodes.wrapper2,
          node: canvas,
          ctx: canvas.getContext("2d"),
          enabled: true,
          config
        };

        this.generateVCRNoise();

        return this;
      }

      let node = false;
      let wrapper = this.nodes.wrapper2;

      switch(type) {
        case "wobblex":
        case "wobbley":
          wrapper.classList.add(type);
          break;
        case "scanlines":
          node = document.createElement("div");
          node.classList.add(type);
          wrapper.appendChild(node);
          break;
        case "vignette":
          wrapper = this.nodes.container;
          node = document.createElement("div");
          node.classList.add(type);
          wrapper.appendChild(node);
          break;
        case "image":
          wrapper = this.parent;
          node = document.createElement('img');
          node.classList.add(type);

          node.src = config.src;

          wrapper.appendChild(node);
          break;
        case "video":
          wrapper = this.parent;
          node = document.createElement('video');
          node.classList.add(type);

          node.src = config.src;
          node.crossOrigin = 'anonymous';
          node.autoplay = true;
          node.muted = true;
          node.loop = true;
          wrapper.appendChild(node);
          break;
      }

      this.effects[type] = {
        wrapper,
        node,
        enabled: true,
        config
      };

      return this;
    }

    remove(type) {

      const obj = this.effects[type];
      if ( type in this.effects && !!obj.enabled ) {
        obj.enabled = false;

        if ( type === "roll" && obj.original ) {
          this.parent.appendChild(obj.original);
        }

        if ( type === "vcr" ) {
          clearInterval(this.vcrInterval);
        }

        if ( type === "snow" ) {
          cancelAnimationFrame(this.snowframe);
        }

        if ( obj.node ) {
          obj.wrapper.removeChild(obj.node);
        } else {
          obj.wrapper.classList.remove(type);
        }
      }

      return this;
    }

    enableRoll() {
      const el = this.parent.firstElementChild;

      if ( el ) {
        const div = document.createElement("div");
        div.classList.add("roller");

        this.parent.appendChild(div);
        div.appendChild(el);
        div.appendChild(el.cloneNode(true));

        // if ( this.effects.vcr.enabled ) {
        //  div.appendChild(this.effects.vcr.node);
        // }

        this.effects.roll = {
          enabled: true,
          wrapper: this.parent,
          node: div,
          original: el
        };
      }
    }

    generateVCRNoise() {
      const canvas = this.effects.vcr.node;
      const config = this.effects.vcr.config;
      const div = this.effects.vcr.node;

      if ( config.fps >= 60 ) {
        cancelAnimationFrame(this.vcrInterval);
        const animate = () => {
          this.renderTrackingNoise();
          this.vcrInterval = requestAnimationFrame(animate);
        };

        animate();
      } else {
        clearInterval(this.vcrInterval);
        this.vcrInterval = setInterval(() => {
          this.renderTrackingNoise();
        }, 1000 / config.fps);
      }
    }

    // Generate CRT noise
    generateSnow(ctx) {
      var w = ctx.canvas.width,
        h = ctx.canvas.height,
        d = ctx.createImageData(w, h),
        b = new Uint32Array(d.data.buffer),
        len = b.length;

      for (var i = 0; i < len; i++) {
        b[i] = ((255 * Math.random()) | 0) << 24;
      }

      ctx.putImageData(d, 0, 0);
    }

    renderTrackingNoise(radius = 2, xmax, ymax) {

      const canvas = this.effects.vcr.node;
      const ctx = this.effects.vcr.ctx;
      const config = this.effects.vcr.config;
      let posy1 = config.miny || 0;
      let posy2 = config.maxy || canvas.height;
      let posy3 = config.miny2 || 0;
      const num = config.num || 20;

      if ( xmax === undefined ) {
        xmax = canvas.width;
      }

      if ( ymax === undefined ) {
        ymax = canvas.height;
      }

      canvas.style.filter = `blur(${config.blur}px)`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `#fff`;

      ctx.beginPath();
      for (var i = 0; i <= num; i++) {
        var x = Math.random(i) * xmax;
        var y1 = getRandomInt(posy1+=3, posy2);
        var y2 = getRandomInt(0, posy3-=3);
        ctx.fillRect(x, y1, radius, radius);
        ctx.fillRect(x, y2, radius, radius);
        ctx.fill();

        this.renderTail(ctx, x, y1, radius);
        this.renderTail(ctx, x, y2, radius);
      }
      ctx.closePath();
    }

    renderTail(ctx, x, y, radius) {
      const n = getRandomInt(1, 50);

      const dirs = [1, -1];
      let rd = radius;
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      for (let i = 0; i < n; i++) {
        const step = 0.01;
        let r = getRandomInt((rd -= step), radius);
        let dx = getRandomInt(1, 4);

        radius -= 0.1;

        dx *= dir;

        ctx.fillRect((x += dx), y, r, r);
        ctx.fill();
      }
    }
  }
</script>

<style type="text/css">
/*body {
  margin: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #000;
}*/

canvas {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9998;
  width: 100%;
  height: 100%;
}
canvas.snow {
  background-color: #aaa;
  opacity: 0.2;
}

#screenElement {
  width: 100%;
  height: 100%;
  display: flex;
  min-height: 250px;
  background: transparent linear-gradient(to bottom, #85908c 0%, #323431 100%) repeat scroll 0 0;
  background-size: cover;
}

.screen-container {
  /*width: 640px;*/
  /*height: 360px;*/
  width: 100%;
  min-height: 250px;
  overflow: hidden;
  position: relative;
}

.screen-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.vcr {
  opacity: 0.6;
}

.video {
  filter: blur(1px);
  width: 100%;
  height: 100%;
}

.image {
  width: 100%;
  height: auto;
  filter: blur(1.2px);
}

.vignette {
  background-image: url(crt.png);
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 10000;
}

.scanlines {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9999;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}

.wobblex {
  -webkit-animation: wobblex 100ms infinite;
          animation: wobblex 100ms infinite;
}

.wobbley {
  -webkit-animation: wobbley 100ms infinite;
          animation: wobbley 100ms infinite;
}

.glitch {
  -webkit-animation: 5s ease 2000ms normal none infinite running glitch;
          animation: 5s ease 2000ms normal none infinite running glitch;
}

@-webkit-keyframes wobblex {
  50% {
    transform: translateX(1px);
  }
  51% {
    transform: translateX(0);
  }
}

@keyframes wobblex {
  50% {
    transform: translateX(1px);
  }
  51% {
    transform: translateX(0);
  }
}
@-webkit-keyframes wobbley {
  0% {
    transform: translateY(1px);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes wobbley {
  0% {
    transform: translateY(1px);
  }
  100% {
    transform: translateY(0);
  }
}
@-webkit-keyframes glitch {
  40% {
    opacity: 1;
    transform: scale(1, 1);
    transform: skew(0, 0);
  }
  41% {
    opacity: 0.8;
    transform: scale(1, 1.2);
    transform: skew(80deg, 0);
  }
  42% {
    opacity: 0.8;
    transform: scale(1, 1.2);
    transform: skew(-50deg, 0);
  }
  43% {
    opacity: 1;
    transform: scale(1, 1);
    transform: skew(0, 0);
  }
}
@keyframes glitch {
  40% {
    opacity: 1;
    transform: scale(1, 1);
    transform: skew(0, 0);
  }
  41% {
    opacity: 0.8;
    transform: scale(1, 1.2);
    transform: skew(80deg, 0);
  }
  42% {
    opacity: 0.8;
    transform: scale(1, 1.2);
    transform: skew(-50deg, 0);
  }
  43% {
    opacity: 1;
    transform: scale(1, 1);
    transform: skew(0, 0);
  }
}
@-webkit-keyframes glitch1 {
  0% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(0);
  }
  31% {
    transform: translateX(10px);
  }
  32% {
    transform: translateX(0);
  }
  98% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(10px);
  }
}
@keyframes glitch1 {
  0% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(0);
  }
  31% {
    transform: translateX(10px);
  }
  32% {
    transform: translateX(0);
  }
  98% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(10px);
  }
}
.text span:nth-child(2) {
  -webkit-animation: glitch2 1s infinite;
          animation: glitch2 1s infinite;
}

@-webkit-keyframes glitch2 {
  0% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(0);
  }
  31% {
    transform: translateX(-10px);
  }
  32% {
    transform: translateX(0);
  }
  98% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-10px);
  }
}

@keyframes glitch2 {
  0% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(0);
  }
  31% {
    transform: translateX(-10px);
  }
  32% {
    transform: translateX(0);
  }
  98% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-10px);
  }
}
.overlay .text {
  -webkit-animation: 5s ease 2000ms normal none infinite running glitch;
          animation: 5s ease 2000ms normal none infinite running glitch;
}

.on > .screen-wrapper {
  -webkit-animation: 3000ms linear 0ms normal forwards 1 running on;
          animation: 3000ms linear 0ms normal forwards 1 running on;
}

.off > .screen-wrapper {
  -webkit-animation: 750ms cubic-bezier(0.23, 1, 0.32, 1) 0ms normal forwards 1 running off;
          animation: 750ms cubic-bezier(0.23, 1, 0.32, 1) 0ms normal forwards 1 running off;
}

@-webkit-keyframes on {
  0% {
    transform: scale(1, 0.8) translate3d(0, 0, 0);
    filter: brightness(4);
    opacity: 1;
  }
  3.5% {
    transform: scale(1, 0.8) translate3d(0, 100%, 0);
  }
  3.6% {
    transform: scale(1, 0.8) translate3d(0, -100%, 0);
    opacity: 1;
  }
  9% {
    transform: scale(1.3, 0.6) translate3d(0, 100%, 0);
    filter: brightness(4);
    opacity: 0;
  }
  11% {
    transform: scale(1, 1) translate3d(0, 0, 0);
    filter: contrast(0) brightness(0);
    opacity: 0;
  }
  100% {
    transform: scale(1, 1) translate3d(0, 0, 0);
    filter: contrast(1) brightness(1.2) saturate(1.3);
    opacity: 1;
  }
}

@keyframes on {
  0% {
    transform: scale(1, 0.8) translate3d(0, 0, 0);
    filter: brightness(4);
    opacity: 1;
  }
  3.5% {
    transform: scale(1, 0.8) translate3d(0, 100%, 0);
  }
  3.6% {
    transform: scale(1, 0.8) translate3d(0, -100%, 0);
    opacity: 1;
  }
  9% {
    transform: scale(1.3, 0.6) translate3d(0, 100%, 0);
    filter: brightness(4);
    opacity: 0;
  }
  11% {
    transform: scale(1, 1) translate3d(0, 0, 0);
    filter: contrast(0) brightness(0);
    opacity: 0;
  }
  100% {
    transform: scale(1, 1) translate3d(0, 0, 0);
    filter: contrast(1) brightness(1.2) saturate(1.3);
    opacity: 1;
  }
}
@-webkit-keyframes off {
  0% {
    transform: scale(1, 1);
    filter: brightness(1);
  }
  40% {
    transform: scale(1, 0.005);
    filter: brightness(100);
  }
  70% {
    transform: scale(1, 0.005);
  }
  90% {
    transform: scale(0.005, 0.005);
  }
  100% {
    transform: scale(0, 0);
  }
}
@keyframes off {
  0% {
    transform: scale(1, 1);
    filter: brightness(1);
  }
  40% {
    transform: scale(1, 0.005);
    filter: brightness(100);
  }
  70% {
    transform: scale(1, 0.005);
  }
  90% {
    transform: scale(0.005, 0.005);
  }
  100% {
    transform: scale(0, 0);
  }
}
.roller {
  position: relative;
  -webkit-animation: 2000ms linear 0ms forwards infinite roll;
          animation: 2000ms linear 0ms forwards infinite roll;
}

@-webkit-keyframes roll {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, -50%, 0);
  }
}

@keyframes roll {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, -50%, 0);
  }
}
.dg.ac {
  z-index: 10000 !important;
}
</style>
