let mic;
let images = [];

function preload() {
  for (let i = 1; i <= 15; i++) {
    let filename = 'guess-' + nf(i, 2) + '.png';
    images.push(loadImage(filename));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  mic.start();
  imageMode(CORNER);
}

function draw() {
  background(255);
 if (vol > micThreshold) {
    activeCount++;
  } else {
    activeCount = 0;
  }

if (vol < 0.1) {
  index = 0;
} else if (vol < 0.2) {
  index = 3;
} else if (vol < 0.3) {
  index = 6;
} else if (vol < 0.4) {
  index = 9;
} else if (vol < 0.5) {
  index = 12;
} else {
  index = 13
}


// 安全处理，避免越界
index = constrain(index, 0, images.length - 1);


  // 调整图像大小以适配画布
  image(images[index], 0, 0, width, height);

  // 可选调试信息
  // text('vol: ' + vol.toFixed(3), 10, height - 20);
}
