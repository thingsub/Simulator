// 로봇 제어 로직을 담는 Raccoon 클래스 (이전과 동일)
class Raccoon {
  #minEncoderJoint1 = 0;
  #maxEncoderJoint1 = 150;
  #minEncoderJoint2 = -10;
  #maxEncoderJoint2 = 100;
  #angleSpeedOffset = 10;
  #intervalId = null;

  constructor(initialSpeed = 40) {
    this.encoderJoint1 = 0; // 초기값 수정
    this.encoderJoint2 = 0; // 초기값 수정
    this.targetAngleJoint1 = 0;
    this.targetAngleJoint2 = 0;
    this.angleSpeed = initialSpeed;
    this.startSimulation();
  }

  set angleSpeed(value) {
    this._angleSpeed = value / this.#angleSpeedOffset;
  }

  get angleSpeed() {
    return this._angleSpeed;
  }

  moveByAngle(targetAngleJoint1, targetAngleJoint2) {
    if (targetAngleJoint1 < this.#minEncoderJoint1)
      targetAngleJoint1 = this.#minEncoderJoint1;
    if (targetAngleJoint1 > this.#maxEncoderJoint1)
      targetAngleJoint1 = this.#maxEncoderJoint1;
    if (targetAngleJoint2 < this.#minEncoderJoint2)
      targetAngleJoint2 = this.#minEncoderJoint2;
    if (targetAngleJoint2 > this.#maxEncoderJoint2)
      targetAngleJoint2 = this.#maxEncoderJoint2;

    this.targetAngleJoint1 = targetAngleJoint1;
    this.targetAngleJoint2 = targetAngleJoint2;
  }

  updateSimulation() {
    let moved = false;
    if (
      Math.abs(this.encoderJoint1 - this.targetAngleJoint1) > this.angleSpeed
    ) {
      if (this.encoderJoint1 < this.targetAngleJoint1) {
        this.encoderJoint1 += this.angleSpeed;
      } else {
        this.encoderJoint1 -= this.angleSpeed;
      }
      moved = true;
    } else if (this.encoderJoint1 !== this.targetAngleJoint1) {
      this.encoderJoint1 = this.targetAngleJoint1;
      moved = true;
    }

    if (
      Math.abs(this.encoderJoint2 - this.targetAngleJoint2) > this.angleSpeed
    ) {
      if (this.encoderJoint2 < this.targetAngleJoint2) {
        this.encoderJoint2 += this.angleSpeed;
      } else {
        this.encoderJoint2 -= this.angleSpeed;
      }
      moved = true;
    } else if (this.encoderJoint2 !== this.targetAngleJoint2) {
      this.encoderJoint2 = this.targetAngleJoint2;
      moved = true;
    }

    document.getElementById("currentAngle1_display").textContent =
      this.encoderJoint1.toFixed(1);
    document.getElementById("currentAngle2_display").textContent =
      this.encoderJoint2.toFixed(1);
  }

  startSimulation() {
    if (this.#intervalId === null) {
      this.#intervalId = setInterval(() => this.updateSimulation(), 50);
    }
  }

  stopSimulation() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }
}

const raccoon = new Raccoon(40);

let canvasWidth, canvasHeight;
const SIMULATION_SCALE_FACTOR = 2.5; // 시각적 비율 조정을 위한 배율

const link1Length = 73 * SIMULATION_SCALE_FACTOR; // L1: Joint 1 중심에서 Joint 2 중심까지의 거리 (73mm)
const link2Length = 79 * SIMULATION_SCALE_FACTOR; // L2: Joint 2 중심에서 펜 끝 중심까지의 거리 (79mm) // 이미지 크기 (시각적 비율을 위해 조정)

const Top_W = (200 * SIMULATION_SCALE_FACTOR) / 2.5; // 원본 비율
const Top_H = (150 * SIMULATION_SCALE_FACTOR) / 2.5;
const UpperArm_W = (200 * SIMULATION_SCALE_FACTOR) / 2.5;
const UpperArm_H = (80 * SIMULATION_SCALE_FACTOR) / 2.5;
const ForeArm_W = (250 * SIMULATION_SCALE_FACTOR) / 2.5;
const ForeArm_H = (80 * SIMULATION_SCALE_FACTOR) / 2.5; // [ 수정된 로컬 중심 오프셋] // Top.png: J1 중심 (좌하단 동그라미)을 이미지 기준으로 재추정 (오른팔 로봇이므로, J1은 몸통의 오른쪽 동그라미에 위치해야 합니다.) // body 이미지를 180도 회전해야 합니다. 원본은 왼쪽 아래에 J1 원이 있습니다. // Top.png에서 J1(어깨)는 노란색 몸통의 우측 하단 근처 원입니다.

const TOP_J1_LOCAL_X = 30; // 이미지 좌측에서 J1 중심까지의 픽셀 거리
const TOP_J1_LOCAL_Y = Top_H - 35; // 이미지 상단에서 J1 중심까지의 픽셀 거리 (하단 근처) // UpperArm.png: J1 중심 (왼쪽 끝 원)

const J1_PIVOT_X_IN_UPPERARM = 30;
const J1_PIVOT_Y_IN_UPPERARM = UpperArm_H / 2; // UpperArm.png: J2 중심 (오른쪽 끝 원)

const J2_PIVOT_X_IN_UPPERARM = UpperArm_W - 30;
const J2_PIVOT_Y_IN_UPPERARM = UpperArm_H * 0.5; // ForeArm.png: J2 중심 (오른쪽 끝 원)

const J2_PIVOT_X_IN_FOREARM = ForeArm_W - 30;
const J2_PIVOT_Y_IN_FOREARM = ForeArm_H / 2; // ForeArm.png: 펜 끝 (왼쪽 끝 빨간 원)

const FOREARM_PEN_LOCAL_X = 30; // 이미지 좌측에서 펜 끝 중심까지의 픽셀 거리
const FOREARM_PEN_LOCAL_Y = ForeArm_H / 2; // 실제 기구학적 길이 L1=73mm, L2=79mm의 픽셀 크기

const L1 = link1Length; // UpperArm 이미지 내 J1에서 J2까지의 픽셀 거리
const L2 = link2Length; // ForeArm 이미지 내 J2에서 펜 끝까지의 픽셀 거리

let canvasScale = 1.0;
let isPenDown = false;
let pathPoints = [];

let shoulderX, shoulderY;
let topAsset, upperArmAsset, foreArmAsset; // P5.js 스케치 정의

let p5sketch = new p5((p) => {
  p.preload = function () {
    // ✅ 1. 파일명 수정: 업로드된 파일명(Top.png, UpperArm.png, ForeArm.png)에 맞게 수정
    topAsset = p.loadImage("images/Top.png");
    upperArmAsset = p.loadImage("images/UpperArm.png");
    foreArmAsset = p.loadImage("images/ForeArm.png");
  };

  p.setup = function () {
    const container = document.getElementById("p5-canvas");
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    p.createCanvas(canvasWidth, canvasHeight); // 로봇팔 기준점 (어깨, Joint 1의 중심) 위치를 오른쪽 상단 근처로 조정
    shoulderX = canvasWidth * 0.55;
    shoulderY = canvasHeight * 0.55;
    p.imageMode(p.CORNER);
  };

  p.draw = () => {
    p.background(250);

    const J1_angle_deg = raccoon.encoderJoint1;
    const J2_angle_deg = raccoon.encoderJoint2;

    const J1_rad = p.radians(J1_angle_deg);
    const J2_rad = p.radians(J2_angle_deg);

    let assetsLoaded =
      topAsset.width > 0 && upperArmAsset.width > 0 && foreArmAsset.width > 0;

    p.push();
    p.scale(canvasScale); // 1. 몸통 (Body) 그리기

    p.push();
    p.translate(shoulderX, shoulderY);

    if (assetsLoaded) {
      p.rotate(p.PI); // 180도 회전
      p.imageMode(p.CORNER); // J1 로컬 좌표가 현재 (0,0)에 오도록 이미지 위치 조정
      p.image(
        topAsset,
        -TOP_J1_LOCAL_X - 20,
        -TOP_J1_LOCAL_Y + 15,
        Top_W,
        Top_H
      );
    } else {
      // 이미지 로드 실패 시 임시 도형 사용
      p.fill(50, 50, 100);
      p.noStroke();
      p.rectMode(p.CORNER);
      p.rect(-Top_W * 0.5, -Top_H + 10, Top_W, Top_H, 15);
    }
    p.fill(50, 50, 150);
    p.ellipse(0, 0, 15, 15); // Joint 1 Base 시각화 (남색 점)
    p.pop();

    p.push();
    p.translate(shoulderX, shoulderY);
    p.rotate(-J1_rad); // J1 회전 (p5.js는 CW가 +이므로, CCW인 로봇팔 각도에 - 적용) // 상박 (UpperArm) 그리기

    if (assetsLoaded) {
      p.imageMode(p.CORNER); // J1이 (0,0)에 오도록 이미지를 이동
      p.image(
        upperArmAsset,
        -J1_PIVOT_X_IN_UPPERARM - 10,
        -J1_PIVOT_Y_IN_UPPERARM - 10,
        UpperArm_W,
        UpperArm_H
      );
    } // Joint 2 (팔꿈치) 위치 (기구학적 길이 L1 사용)
    // 여기서 팔꿈치(주황공) 조정하자 !!!
    const elbowX = L1 - 65;
    const elbowY = -10;

    p.push();
    p.translate(elbowX, elbowY); // J2 위치로 이동 (L1, 0)
    p.rotate(J2_rad); // J2 회전 (상박에 대한 상대각도) // 하박 (ForeArm) 그리기

    if (assetsLoaded) {
      p.imageMode(p.CORNER); // J2가 (0,0)에 오도록 이미지를 이동
      p.image(
        foreArmAsset,
        -J2_PIVOT_X_IN_FOREARM + 20,
        -J2_PIVOT_Y_IN_FOREARM + 0,
        ForeArm_W,
        ForeArm_H
      );
    }

    p.pop(); // Joint 2 회전/이동 복구

    p.fill(255, 100, 0); // Joint 2 팔꿈치 : 주황 공 🟠
    p.ellipse(elbowX, elbowY, 15, 15);

    p.pop(); // Joint 1 회전/이동 복구 // 3. End-Effector 절대 좌표 계산 (펜 끝 위치) --- // J2 절대 위치 (어깨 기준 상대 좌표)

    const J2_abs_x_relative = L1 * p.cos(-J1_rad);
    const J2_abs_y_relative = L1 * p.sin(-J1_rad); // 하박의 절대 각도 (ForeArm의 방향)

    const total_angle_rad = -J1_rad + J2_rad; // J1 절대각 + J2 상대각

    const local_pen_x = -(J2_PIVOT_X_IN_FOREARM - FOREARM_PEN_LOCAL_X) - 50; // ForeArm 이미지 내 J2 기준 펜 끝 X 오프셋
    const local_pen_y = -45; // Y 오프셋

    const forearm_offset_x =
      local_pen_x * p.cos(total_angle_rad) -
      local_pen_y * p.sin(total_angle_rad);
    const forearm_offset_y =
      local_pen_x * p.sin(total_angle_rad) +
      local_pen_y * p.cos(total_angle_rad); // End-Effector 절대 좌표 (어깨 기준 상대 좌표)

    const EE_abs_x_relative = (J2_abs_x_relative + forearm_offset_x) * 0.65;
    const EE_abs_y_relative = (J2_abs_y_relative + forearm_offset_y) * 0.65; // End-Effector 팁 (현재 위치 시각화)

    p.fill(255, 0, 0); // 펜 끝: 디버깅용 빨간 공 🔴
    p.ellipse(
      shoulderX + EE_abs_x_relative,
      shoulderY + EE_abs_y_relative,
      15,
      15
    ); // --- 4. 펜 궤적 관리 및 그리기 ---

    if (isPenDown) {
      if (p.frameCount % 5 === 0) {
        pathPoints.push({ x: EE_abs_x_relative, y: EE_abs_y_relative });
      }
    }

    if (pathPoints.length > 1) {
      p.push();
      p.translate(shoulderX, shoulderY);
      p.stroke(0);
      p.strokeWeight(2 / canvasScale);
      p.noFill();

      p.beginShape();
      for (let point of pathPoints) {
        p.vertex(point.x, point.y);
      }
      p.endShape();
      p.pop();
    }

    p.pop(); // 스케일 복구 // End-Effector 좌표를 UI에 표시 (실제 좌표계 기준, Y축 반전)

    document.getElementById("x_end_display").textContent =
      EE_abs_x_relative.toFixed(2);
    document.getElementById("y_end_display").textContent =
      (-EE_abs_y_relative).toFixed(2);
  };

  p.windowResized = function () {
    const container = document.getElementById("p5-canvas");
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    p.resizeCanvas(canvasWidth, canvasHeight);
    shoulderX = canvasWidth * 0.75;
    shoulderY = canvasHeight * 0.25;
  };
}, "p5-canvas"); // --- UI 상호 작용 로직 (변경 없음) ---

const slider1 = document.getElementById("targetAngle1_slider");
const input1 = document.getElementById("targetAngle1_input");
const slider2 = document.getElementById("targetAngle2_slider");
const input2 = document.getElementById("targetAngle2_input");
const speedSlider = document.getElementById("angleSpeed_slider");
const speedDisplay = document.getElementById("angleSpeed_display");
const zoomSlider = document.getElementById("zoom_slider");
const zoomDisplay = document.getElementById("zoom_display");
const penToggle = document.getElementById("pen_toggle");
const penStatus = document.getElementById("pen_status");
const clearButton = document.getElementById("clear_path_button");
const zoomResetButton = document.getElementById("zoom_reset_button"); // 추가된 버튼

const updateJoint1 = (value) => {
  const numVal = parseInt(value);
  const clampedVal = Math.min(150, Math.max(0, numVal));
  slider1.value = clampedVal;
  input1.value = clampedVal;
  raccoon.moveByAngle(clampedVal, raccoon.targetAngleJoint2);
};
slider1.addEventListener("input", (e) => updateJoint1(e.target.value));
input1.addEventListener("input", (e) => updateJoint1(e.target.value));

const updateJoint2 = (value) => {
  const numVal = parseInt(value);
  const clampedVal = Math.min(100, Math.max(-10, numVal));
  slider2.value = clampedVal;
  input2.value = clampedVal;
  raccoon.moveByAngle(raccoon.targetAngleJoint1, clampedVal);
};
slider2.addEventListener("input", (e) => updateJoint2(e.target.value));
input2.addEventListener("input", (e) => updateJoint2(e.target.value));

speedSlider.addEventListener("input", (e) => {
  const speed = parseInt(e.target.value);
  speedDisplay.textContent = speed;
  raccoon.angleSpeed = speed;
});

const updateZoom = (value) => {
  const scaleFactor = parseInt(value) / 100.0;
  zoomDisplay.textContent = `${scaleFactor.toFixed(1)}x`;
  canvasScale = scaleFactor;
  zoomSlider.value = parseInt(value); // 슬라이더 값 동기화
};

zoomSlider.addEventListener("input", (e) => updateZoom(e.target.value));
zoomResetButton.addEventListener("click", () => updateZoom(100)); // 재설정 버튼 추가

penToggle.addEventListener("change", (e) => {
  isPenDown = e.target.checked;
  if (isPenDown) {
    penStatus.textContent = "펜 켜짐 (ON)";
    penStatus.classList.remove("text-gray-700");
    penStatus.classList.add("text-green-700");
  } else {
    penStatus.textContent = "펜 꺼짐 (OFF)";
    penStatus.classList.remove("text-green-700");
    penStatus.classList.add("text-gray-700");
  }
});

clearButton.addEventListener("click", () => {
  pathPoints = [];
}); // 초기 각도 설정

raccoon.moveByAngle(0, 0);
