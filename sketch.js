// 全局变量
let mic;
let vol = 0;
let idleImages = [];
let mainImages = [];
let endImages = [];

// --- 状态控制变量 ---
let currentFrame = 0; // 主动画的当前帧
let isFinished = false; // 主动画是否已播放完毕
let hasStartedBlowing = false; // 用户是否已经开始过吹气交互

// --- 动画速度控制 (数值越大，播放越慢) ---
const idleFrameSpeed = 150; // 待机动画每帧的间隔时间 (毫秒)
const endFrameSpeed = 150; // 结尾动画每帧的间隔时间 (毫秒)

// --- 动画帧和计时器 ---
let idleFrameIndex = 0;
let endFrameIndex = 0;
let lastFrameTime = 0; // 用于控制所有动画的计时器

// --- 麦克风灵敏度控制 ---
const micThreshold = 0.08; // 吹气音量的判定阈值
let activeCount = 0; // 用于检测持续吹气的计数器
const activeThreshold = 5; // 需要持续吹气3帧才算有效开始，防止误触

function preload() {
  
  for (let i = 1; i <= 19; i++) {
    let filename = `first-${String(i).padStart(2, '0')}.png`;
    idleImages.push(loadImage(filename));
  }

  
  for (let i = 1; i <= 15; i++) {
    let filename = `guess-${String(i).padStart(2, '0')}.png`;
    mainImages.push(loadImage(filename));
  }

  // 结尾动画 end-01.png ~ end-10.png
  for (let i = 1; i <= 12; i++) {
    let filename = `end-${String(i).padStart(2, '0')}.png`;
    endImages.push(loadImage(filename));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  mic.start();
  imageMode(CENTER);
  frameRate(30); // 建议固定帧率以保证体验一致
}

function draw() {
  background(255);
  vol = mic.getLevel();
  let now = millis();

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

  // 2. 根据状态更新动画帧
  if (isFinished) {
    // 状态三：播放结尾动画
    if (now - lastFrameTime > endFrameSpeed) {
      endFrameIndex++;
      lastFrameTime = now;
      // 如果结尾动画播放完毕，则重置所有状态
      if (endFrameIndex >= endImages.length) {
        isFinished = false;
        hasStartedBlowing = false;
        currentFrame = 0;
        idleFrameIndex = 0;
        endFrameIndex = 0;
      }
    }
  } else if (hasStartedBlowing) {
    // 状态二：主交互过程
    let speedFactor = map(vol, 0.01, 0.2, 200, 30, true); // 吹得越用力，动画越快
    
    // 吹气时，推进主画
    if (activeCount >= activeThreshold && now - lastFrameTime > speedFactor) {
      currentFrame++;
      lastFrameTime = now;
      // 如果主动画播放完毕，进入结尾状态
      if (currentFrame >= mainImages.length) {
        currentFrame = mainImages.length - 1; // 防止数组越界
        isFinished = true;
        lastFrameTime = now; // 重置计时器，准备播放结尾动画
      }
    }
    
    // 停止吹气时，倒退主动画
    if (activeCount < activeThreshold && now - lastFrameTime > 80) { // 倒退速度固定
      if (currentFrame > 0) {
        currentFrame--;
        lastFrameTime = now;
      }
    }
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
    let scaleFactor = min(width / img.width, height / img.height) 0.98; // 缩放因子，留出边距
    let w = img.width * scaleFactor;
    let h = img.height * scaleFactor;
    image(img, width / 2, height / 2, w, h);
  }
}
