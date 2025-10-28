let table;
let questionBank = []; // 儲存所有從 CSV 讀取的題目
let quizQuestions = []; // 儲存本次測驗的 5 道題目
let currentQuestionIndex = 0;
let score = 0;
let state = 'start'; // 遊戲狀態: 'start', 'quiz', 'result'

// 按鈕的通用設定
let btnW = 400;
let btnH = 50;
let optionY = [220, 280, 340, 400]; // 四個選項按鈕的 Y 座標
let options = ['A', 'B', 'C', 'D']; // 用來比對答案

// 互動效果變數
let particleSystem;

function preload() {
  // 預先載入 CSV 檔案
  // 確保 'questions.csv' 檔案與 sketch.js 在同一個資料夾
  table = loadTable('questions.csv', 'csv'); // 'csv' 參數能讓 p5.js 正確處理帶有引號的欄位
}

function setup() {
  createCanvas(600, 500);
  textFont('Arial');
  
  // 初始化粒子系統 (互動效果)
  particleSystem = new ParticleSystem(createVector(width / 2, height / 2));
  
  // 準備測驗
  setupQuiz();
}

function draw() {
  background(240, 245, 250); // 淺藍色背景
  
  // 根據不同的遊戲狀態，呼叫不同的繪圖函數
  if (state === 'start') {
    drawStartScreen();
  } else if (state === 'quiz') {
    drawQuizScreen();
  } else if (state === 'result') {
    drawResultScreen();
  }
}

// 準備測驗資料
function setupQuiz() {
  // 從 table 物件中取得所有行 (row)
  questionBank = table.getRows();
  
  // 使用 p5.js 的 shuffle() 來隨機排序題庫
  let shuffledBank = shuffle(questionBank);
  
  // 取出前 5 題
  quizQuestions = shuffledBank.slice(0, 5);
  
  // 重設測驗狀態
  currentQuestionIndex = 0;
  score = 0;
  state = 'start';
}

// 繪製開始畫面
function drawStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(50);
  text('p5.js 互動測驗系統', width / 2, height / 2 - 80);
  
  textSize(18);
  text('準備好挑戰 5 道題目了嗎？', width / 2, height / 2 - 30);
  
  // 繪製 "開始" 按鈕並檢查滑鼠是否懸停
  let startHover = drawButton('開始測驗', width / 2, height / 2 + 50, btnW, btnH);
  if(startHover) {
    cursor(HAND); // 滑鼠懸停時變手形
  } else {
    cursor(ARROW);
  }
}

// 繪製測驗畫面
function drawQuizScreen() {
  if (currentQuestionIndex >= quizQuestions.length) {
    // 題目都答完了
    state = 'result';
    cursor(ARROW);
    return;
  }
  
  // 取得目前的題目物件
  let q = quizQuestions[currentQuestionIndex];
  
  // 繪製題號
  textAlign(LEFT, TOP);
  textSize(16);
  fill(100);
  text(`第 ${currentQuestionIndex + 1} / 5 題`, 40, 30);
  
  // 繪製題目
  rectMode(CENTER); // 確保文字框相對於其中心點定位
  textAlign(CENTER, CENTER);
  textSize(20);
  fill(0);
  textWrap(WORD); // 自動換行
  text(q.getString(0), width / 2, 120, width - 80); // 題目 (欄位 0)
  
  // 繪製四個選項按鈕
  let anyButtonHovered = false;
  for (let i = 0; i < 4; i++) {
    let optionText = q.getString(i + 1); // 選項 (欄位 1, 2, 3, 4)
    let hover = drawButton(optionText, width / 2, optionY[i], btnW, btnH);
    if(hover) {
      anyButtonHovered = true;
    }
  }
  
  if(anyButtonHovered) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

// 繪製結果畫面
function drawResultScreen() {
  textAlign(CENTER, CENTER);
  
  // 顯示分數
  textSize(48);
  fill(0, 102, 153);
  text(`你的成績: ${score} / 5`, width / 2, height / 2 - 100);
  
  // 顯示回饋用語
  let feedback = '';
  if (score === 5) {
    feedback = '太棒了！你全答對了！';
    // 全對時觸發粒子效果
    particleSystem.addParticles(100); 
  } else if (score >= 3) {
    feedback = '做得不錯！';
    particleSystem.addParticles(30);
  } else {
    feedback = '再接再厲，下次會更好！';
  }
  
  textSize(24);
  fill(50);
  text(feedback, width / 2, height / 2 - 30);
  
  // 更新與繪製粒子
  particleSystem.run();
  
  // 繪製 "重新測驗" 按鈕
  let restartHover = drawButton('重新測驗', width / 2, height / 2 + 80, btnW / 2, btnH);
  if(restartHover) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

// 處理滑鼠點擊事件
function mousePressed() {
  if (state === 'start') {
    // 檢查是否點擊 "開始測驗" 按鈕
    if (isMouseOver(width / 2, height / 2 + 50, btnW, btnH)) {
      state = 'quiz'; // 進入測驗
    }
  } else if (state === 'quiz') {
    // 檢查點擊了哪個選項
    for (let i = 0; i < 4; i++) {
      if (isMouseOver(width / 2, optionY[i], btnW, btnH)) {
        checkAnswer(options[i]); // 檢查答案
        break; // 找到點擊的按鈕後就跳出迴圈
      }
    }
  } else if (state === 'result') {
    // 檢查是否點擊 "重新測驗" 按鈕
    if (isMouseOver(width / 2, height / 2 + 80, btnW / 2, btnH)) {
      setupQuiz(); // 重新開始
    }
  }
}

// 檢查答案
function checkAnswer(selectedOption) {
  let correct = quizQuestions[currentQuestionIndex].getString(5); // 正確答案 (欄位 5)
  
  if (selectedOption === correct) {
    score++; // 答對了，加分
  }
  
  // 換到下一題
  currentQuestionIndex++;
}

// --- 輔助函數 ---

// 繪製按鈕並回傳是否有滑鼠懸停 (hover)
function drawButton(label, x, y, w, h) {
  let hover = isMouseOver(x, y, w, h);
  
  push(); // 保存目前的繪圖設定
  translate(x, y); // 將原點移到按鈕中心
  
  if (hover) {
    fill(200, 220, 255); // 懸停時的顏色
    stroke(0, 50, 150);
  } else {
    fill(255); // 預設顏色
    stroke(150);
  }
  
  strokeWeight(2);
  rectMode(CENTER);
  rect(0, 0, w, h, 10); // 繪製圓角矩形
  
  // 繪製文字
  noStroke();
  fill(hover ? 0 : 50); // 懸停時文字變黑
  textAlign(CENTER, CENTER);
  textSize(16);
  text(label, 0, 0);
  
  pop(); // 恢復原本的繪圖設定
  
  return hover;
}

// 檢查滑鼠是否在按鈕範圍內 (以中心點為準)
function isMouseOver(x, y, w, h) {
  return (mouseX > x - w / 2 &&
          mouseX < x + w / 2 &&
          mouseY > y - h / 2 &&
          mouseY < y + h / 2);
}

// --- 互動效果 (粒子系統) ---

// 粒子物件
class Particle {
  constructor(position) {
    this.acceleration = createVector(0, 0.05); // 模擬重力
    this.velocity = createVector(random(-2, 2), random(-3, -1));
    this.position = position.copy();
    this.lifespan = 255.0; // 生命值
    this.size = random(5, 15);
    this.color = color(random(100, 255), random(150, 255), 0, this.lifespan);
  }

  run() {
    this.update();
    this.display();
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 2.0;
    this.color.setAlpha(this.lifespan); // 更新透明度
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }

  isDead() {
    return this.lifespan < 0.0;
  }
}

// 粒子系統物件
class ParticleSystem {
  constructor(position) {
    this.origin = position.copy();
    this.particles = [];
  }

  addParticles(num) {
    for (let i = 0; i < num; i++) {
      this.particles.push(new Particle(this.origin));
    }
  }

  run() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.run();
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}