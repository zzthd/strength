let mic;
let vol = 0;

// 存放三组动画的数组
let idleImages = [];
let mainImages = []; // 你的 "guess" 系列动画
let endImages = [];

// --- 状态控制变量 ---
let currentFrame = 0;       // 主动画的当前帧
let isFinished = false;     // 主动画是否已播放完毕
let hasStartedBlowing = false; // 用户是否已经开始过吹气交互

// --- 动画速度和计时器 (数值越大，播放越慢) ---
const idleFrameSpeed = 150; // 待机动画每帧的间隔时间 (毫秒)
const endFrameSpeed = 120;  // 结尾动画每帧的间隔时间 (毫秒)
let idleFrameIndex = 0;
let endFrameIndex = 0;
let lastFrameTime = 0;

// --- 麦克风灵敏度控制 ---
const micThreshold = 0.08; // 吹气音量的判定阈值
let activeCount = 0;       // 用于检测持续吹气的计数器
const activeThreshold = 3; // 需要持续吹气3帧才算有效开始，防止误触

function preload() {
  // 1. 加载待机动画 (假设有10帧)
  for (let i = 1; i <= 19; i++) {
    let filename = `first-${String(i).padStart(2, '0')}.png`;
    idleImages.push(loadImage(filename));
  }

  // 2. 加载你的主动画 (guess-01.png ~ guess-15.png)
  for (let i = 1; i <= 15; i++) {
    let filename = `guess-${String(i).padStart(2, '0')}.png`;
    mainImages.push(loadImage(filename));
  }

  // 3. 加载结尾动画 (假设有10帧)
  for (let i = 1; i <= 10; i++) {
    let filename = `sup-${String(i).padStart(2, '0')}.png`;
    endImages.push(loadImage(filename));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  mic.start();
  imageMode(CENTER);
  frameRate(30);
}

function draw() {
  background(255);
  vol = mic.getLevel();
  let now = millis();

  // --- 状态机逻辑 ---

  // 1. 检测是否为有效的持续吹气
  if (vol > micThreshold) {
    activeCount++;
  } else {
    activeCount = 0;
  }

  // 当第一次有效吹气时，标记交互开始
  if (activeCount >= activeThreshold && !hasStartedBlowing) {
    hasStartedBlowing = true;
  }

  // 2. 根据程序所处的状态，更新动画帧
  if (isFinished) {
    // 状态三：播放结尾动画
    if (now - lastFrameTime > endFrameSpeed) {
      endFrameIndex++;
      lastFrameTime = now;
      // 如果结尾动画播放完毕，则重置所有状态，回到待机
      if (endFrameIndex >= endImages.length) {
        isFinished = false;
        hasStartedBlowing = false;
        currentFrame = 0;
        idleFrameIndex = 0;
        endFrameIndex = 0;
      }
    }
  } else if (hasStartedBlowing) {
    // 状态二：主交互过程 (播放 guess 系列)
    let speedFactor = map(vol, 0.01, 0.2, 200, 30, true); // 吹得越用力，动画越快
    
    // 吹气时，推进主画
    if (activeCount >= activeThreshold && now - lastFrameTime > speedFactor) {
      currentFrame++;
      lastFrameTime = now;
      // 如果主动画播放完毕，进入结尾状态
      if (currentFrame >= mainImages.length) {
        currentFrame = mainImages.length - 1;
        isFinished = true;
        lastFrameTime = now;
      }
    }
    
    // 停止吹气时，不退回，保持在当前帧 (如果你希望它退回，可以加入之前的倒退逻辑)
    // 如果希望不吹的时候回到待机，可以在这里直接重置状态
    if (activeCount < activeThreshold) {
       
  } else {
    // 状态一：播放待机动画
    if (now - lastFrameTime > idleFrameSpeed) {
      idleFrameIndex = (idleFrameIndex + 1) % idleImages.length;
      lastFrameTime = now;
    }
  }

  // 3. 根据计算出的状态，选择并显示最终的图像
  let img;
  if (isFinished) {
    img = endImages[endFrameIndex];
  } else if (hasStartedBlowing) {
    img = mainImages[currentFrame];
  } else {
    img = idleImages[idleFrameIndex];
  }

  // 居中缩放显示图像
  if (img && img.width > 0) {
    let scaleFactor = min(width / img.width, height / img.height) * 0.9;
    let w = img.width * scaleFactor;
    let h = img.height * scaleFactor;
    image(img, width / 2, height / 2, w, h);
  }
}


