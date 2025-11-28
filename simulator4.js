// Original Version
// 로봇 제어 로직을 담는 Raccoon 클래스 (이전과 동일)
class Raccoon {
  #minEncoderJoint1 = -30;
  #maxEncoderJoint1 = 180;
  #minEncoderJoint2 = -10;
  #maxEncoderJoint2 = 90;
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

  getAllowedJ2Range(j1) {
    if (j1 <= J1_J2_LIMIT_TABLE[0].j1) {
      return {
        min: J1_J2_LIMIT_TABLE[0].j2min,
        max: J1_J2_LIMIT_TABLE[0].j2max,
      };
    }

    const last = J1_J2_LIMIT_TABLE[J1_J2_LIMIT_TABLE.length - 1];
    if (j1 >= last.j1) {
      return { min: last.j2min, max: last.j2max };
    }

    for (let i = 0; i < J1_J2_LIMIT_TABLE.length - 1; i++) {
      const a = J1_J2_LIMIT_TABLE[i];
      const b = J1_J2_LIMIT_TABLE[i + 1];

      if (j1 >= a.j1 && j1 <= b.j1) {
        const t = (j1 - a.j1) / (b.j1 - a.j1);
        return {
          min: a.j2min + (b.j2min - a.j2min) * t,
          max: a.j2max + (b.j2max - a.j2max) * t,
        };
      }
    }
  }

  moveByAngle(targetAngleJoint1, targetAngleJoint2) {
    // 기본 J1/J2 개별 제한
    targetAngleJoint1 = Math.min(
      this.#maxEncoderJoint1,
      Math.max(this.#minEncoderJoint1, targetAngleJoint1)
    );
    // targetAngleJoint2 = Math.min(
    //   this.#maxEncoderJoint2,
    //   Math.max(this.#minEncoderJoint2, targetAngleJoint2)
    // );

    // J1이 설정된 후, J2의 제한을 테이블로부터 가져옴
    const allowedJ2Range = this.getAllowedJ2Range(targetAngleJoint1);

    // J2의 목표 각도가 허용된 범위를 벗어나지 않도록 조정
    targetAngleJoint2 = Math.min(
      allowedJ2Range.max,
      Math.max(allowedJ2Range.min, targetAngleJoint2)
    );

    this.targetAngleJoint1 = targetAngleJoint1;
    this.targetAngleJoint2 = targetAngleJoint2;
  }
  updateSimulation() {
    let moved = false;

    // Joint1
    if (
      Math.abs(this.encoderJoint1 - this.targetAngleJoint1) > this.angleSpeed
    ) {
      this.encoderJoint1 +=
        (this.encoderJoint1 < this.targetAngleJoint1 ? 1 : -1) *
        this.angleSpeed;
      moved = true;
    } else if (this.encoderJoint1 !== this.targetAngleJoint1) {
      this.encoderJoint1 = this.targetAngleJoint1;
      moved = true;
    }

    // Joint2
    const allowed = this.getAllowedJ2Range(this.encoderJoint1); // 현재 J1 기준
    let targetJ2 = this.targetAngleJoint2;
    targetJ2 = Math.min(allowed.max, Math.max(allowed.min, targetJ2)); // J2 범위 조정

    if (
      Math.abs(this.encoderJoint2 - this.targetAngleJoint2) > this.angleSpeed
    ) {
      this.encoderJoint2 +=
        (this.encoderJoint2 < this.targetAngleJoint2 ? 1 : -1) *
        this.angleSpeed;
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

const J1_J2_LIMIT_TABLE = [
  { j1: -30, j2min: 5, j2max: 90 },
  { j1: -15, j2min: -5, j2max: 90 },
  { j1: 0, j2min: 5, j2max: 90 },
  { j1: 30, j2min: -10, j2max: 90 },
  { j1: 45, j2min: -10, j2max: 90 },
  { j1: 60, j2min: 10, j2max: 90 },
  { j1: 70, j2min: 15, j2max: 90 },
  { j1: 90, j2min: 45, j2max: 90 },
  { j1: 100, j2min: 50, j2max: 90 },
  { j1: 120, j2min: 45, j2max: 90 },
  { j1: 140, j2min: 50, j2max: 90 },
  { j1: 145, j2min: 55, j2max: 90 },
];

const raccoon = new Raccoon(40);

let canvasWidth, canvasHeight;
const SIMULATION_SCALE_FACTOR = 2.5; // (이제 사용되지 않지만 정의는 유지)

// 기존 linkLength 변수 제거 또는 사용 안 함
// const link1Length = 73 * SIMULATION_SCALE_FACTOR;
// const link2Length = 79 * SIMULATION_SCALE_FACTOR;

const IMG_SCALE = 0.2;

// -----------------------------------------------------
// 이미지 크기 픽셀 정보 (스케일 적용)
// -----------------------------------------------------

// Body 이미지
const Top_W = 972 * IMG_SCALE;
const Top_H = 762 * IMG_SCALE;

// UpperArm 이미지
const UpperArm_W = 800 * IMG_SCALE;
const UpperArm_H = 414 * IMG_SCALE;

// ForeArm 이미지
const ForeArm_W = 972 * IMG_SCALE;
const ForeArm_H = 762 * IMG_SCALE;

// -----------------------------------------------------
// 새로 제공된 픽셀 좌표 (스케일 적용)
// -----------------------------------------------------

// UpperArm 픽셀 좌표 (스케일 적용)
const UA_J1_X = 123 * IMG_SCALE; // 24.6
const UA_J1_Y = 295 * IMG_SCALE; // 57.2

const UA_J2_X = 676 * IMG_SCALE; // 135.2
const UA_J2_Y = 128 * IMG_SCALE; // 25.6

// ForeArm 픽셀 좌표 (스케일 적용)
const FA_PEN_X = 190 * IMG_SCALE; // 38.8
const FA_PEN_Y = 310 * IMG_SCALE; // 29.6

const FA_J2_X = 777 * IMG_SCALE; // 155.4
const FA_J2_Y = 535 * IMG_SCALE; // 75.0

// Body 이미지에서의 J1 위치 (이전 값 유지)
const TOP_J1_LOCAL_X = 30; // 렌더링용 오프셋
const TOP_J1_LOCAL_Y = Top_H + 0; // 렌더링용 오프셋

// -----------------------------------------------------
//  렌더링 피벗 (J1, J2 이미지의 (0,0)을 어디에 맞출지)
// -----------------------------------------------------

// UpperArm 이미지의 렌더링 오프셋: (0,0)이 어깨(J1) 좌표에 오도록 조정
const J1_PIVOT_X_IN_UPPERARM = UA_J1_X; // 24.6
const J1_PIVOT_Y_IN_UPPERARM = UA_J1_Y; // 57.2

// ForeArm 이미지의 렌더링 오프셋: (0,0)이 팔꿈치(J2) 좌표에 오도록 조정
const J2_PIVOT_X_IN_FOREARM = FA_J2_X; // 155.4
const J2_PIVOT_Y_IN_FOREARM = FA_J2_Y; // 75.0

// 새로운 기구학적 길이 정의: 이미지의 피벗 거리 사용 (L1, L2 대신)
// L1: UpperArm의 J1 피벗과 J2 피벗 사이의 X 거리
const L1_KINEMATIC = UA_J2_X - UA_J1_X;

// 기구학 길이 변수 L1을 L1_KINEMATIC으로 대체
const L1 = L1_KINEMATIC;
const L2 = 0; // L2는 ForeArm 내부 펜 끝 오프셋 계산에 포함되므로 0으로 설정

let canvasScale = 1.0;
let isPenDown = false;
let pathPoints = [];

let shoulderX, shoulderY;
let topAsset, upperArmAsset, foreArmAsset;

let p5sketch = new p5((p) => {
  p.preload = function () {
    topAsset = p.loadImage("images/Top.png");
    upperArmAsset = p.loadImage("images/UpperArm.png");
    foreArmAsset = p.loadImage("images/ForeArm.png");
  };

  p.setup = function () {
    const container = document.getElementById("p5-canvas");
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    p.createCanvas(canvasWidth, canvasHeight);

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

    const assetsLoaded =
      topAsset.width > 0 && upperArmAsset.width > 0 && foreArmAsset.width > 0;

    p.push();
    p.scale(canvasScale);

    // -------------------------
    // Upper Arm
    // -------------------------
    p.push();
    p.translate(shoulderX, shoulderY);
    p.rotate(-J1_rad);

    if (assetsLoaded) {
      p.image(
        upperArmAsset,
        -J1_PIVOT_X_IN_UPPERARM,
        -J1_PIVOT_Y_IN_UPPERARM,
        UpperArm_W,
        UpperArm_H
      );
    }

    // elbow position
    const elbowX = L1;
    const elbowY = -32;

    // -------------------------
    // Forearm
    // -------------------------
    p.push();
    p.translate(elbowX, elbowY);
    p.rotate(J2_rad);

    if (assetsLoaded) {
      p.image(
        foreArmAsset,
        -J2_PIVOT_X_IN_FOREARM,
        -J2_PIVOT_Y_IN_FOREARM + 32,
        ForeArm_W,
        ForeArm_H
      );
    }

    p.pop();

    p.fill(255, 100, 0);
    // p.ellipse(elbowX, elbowY, 15, 15);

    p.pop();

    // -------------------------
    // End Effector 계산
    // -------------------------
    // const J2_abs_x_relative = L1 * p.cos(-J1_rad);
    // const J2_abs_y_relative = L1 * p.sin(-J1_rad);

    const J2_abs_x_relative =
      elbowX * p.cos(-J1_rad) - elbowY * p.sin(-J1_rad) - 10; // elbowX*cos + (-elbowY)*sin  // 이거 -10 빼봐도 됨
    const J2_abs_y_relative = elbowX * p.sin(-J1_rad) + elbowY * p.cos(-J1_rad); // elbowX*sin + elbowY*cos

    const total_angle_rad = -J1_rad + J2_rad;

    const local_pen_x = FA_PEN_X - FA_J2_X; //  수정: 펜촉 - 팔꿈치 X
    const local_pen_y = FA_PEN_Y - FA_J2_Y; //  수정: 펜촉 - 팔꿈치 Y

    const forearm_offset_x =
      local_pen_x * p.cos(total_angle_rad) -
      local_pen_y * p.sin(total_angle_rad);
    const forearm_offset_y =
      local_pen_x * p.sin(total_angle_rad) +
      local_pen_y * p.cos(total_angle_rad);

    const EE_abs_x_relative = J2_abs_x_relative + forearm_offset_x - 0;
    const EE_abs_y_relative = J2_abs_y_relative + forearm_offset_y + 0;

    // -------------------------
    // End Effector Drawing
    // -------------------------
    p.fill(255, 0, 0);
    /*
    p.ellipse(
      shoulderX + EE_abs_x_relative + 10,
      shoulderY + EE_abs_y_relative,
      15,
      15
    );
*/

    // Path
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

    p.pop();

    // -------------------------
    // BODY
    // -------------------------
    p.push();
    p.translate(shoulderX, shoulderY);
    if (assetsLoaded) {
      p.rotate(p.PI);
      p.image(
        topAsset,
        -TOP_J1_LOCAL_X - 15,
        -TOP_J1_LOCAL_Y + 50,
        Top_W,
        Top_H
      );
    }
    p.fill(50, 50, 150);
    // 남색 공
    // p.ellipse(0, 0, 15, 15);
    p.pop();

    // -------------------------

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
    shoulderX = canvasWidth * 0.55;
    shoulderY = canvasHeight * 0.55;
  };
}, "p5-canvas");
// --- UI 상호 작용 로직 (변경 없음) ---

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
  const clampedVal = Math.min(180, Math.max(-30, numVal));
  slider1.value = clampedVal;
  input1.value = clampedVal;
  raccoon.moveByAngle(clampedVal, raccoon.targetAngleJoint2);
};
slider1.addEventListener("input", (e) => updateJoint1(e.target.value));
input1.addEventListener("input", (e) => updateJoint1(e.target.value));

const updateJoint2 = (value) => {
  const numVal = parseInt(value);
  const clampedVal = Math.min(170, Math.max(-10, numVal)); // 슬라이더 실질 최댓값 제한함
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
