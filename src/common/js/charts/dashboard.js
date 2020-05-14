import * as d3 from "d3";
import * as util from "../map/util";
<<<<<<< HEAD
=======

function getSplitInfo(total, index, allAngle = 360, offset = 0) {
  const steep = allAngle / total;
  const leftOffset =  steep / 2;
  let angle = 90 - leftOffset - steep * index;
  angle -= offset;
  angle += 360;
  angle %= 360;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  if (angle <= 90) {
    x2 = 1;
    y2 = 1;
  } else if (angle <= 180) {
    const _angle = angle - 90;
    x2 = 1;
    y1 = 1;
  } else if (angle <= 270) {
    const _angle = angle - 180;
    x1 = 1;
    y1 = 1;
  } else if (angle < 360) {
    const _angle = angle - 270;
    x1 = 1;
    y2 = 1;
  }
  return {
    angle,
    x1,
    x2,
    y1,
    y2
  };
}

function textFormat(value) {
  return (value * 100).toFixed(2) + "%";
}
>>>>>>> 1834809b3548f9f83a55c023cc561a0a5e89e670
/**
 *
 * @class
 * @example
 * 默认配置
 *  options = {
 *    name: "Dashboard", //实例名
 *    el: document.body, //容器
 *    options: {
 *      value: 0, // 进度 0 - 1
 *    }
 *   };
 *
 */
class Dashboard {
  _options = {
    name: "dashboard",
    el: document.body,
    options: {
      // 进度 0 - 1
      value: 0,
      splitConut: 5,
      allAngle: 360,
      offsetAngle: 0,
      // 缓动函数
      ease: d3.easeCubic,
      // 动画时间
      duration: 1000,
      // 动画结束
      changeEndCallback: null,

      showScale: true,
      showPointer: true
    }
  };

  color = null;
  el = null;
  container = null;
  defs = null;
  linearList = [];
  scaleList = [];
  textList = [];
  options = {};
  svg = null;
  g = null;
  arc = null;
  circle_1 = null;
  circle_2 = null;
  background = null;
  textDom = null;
  dot = null;

  constructor(options) {
    // 合并参数
    util.extend(true, this._options, options);
    util.extend(true, this, this._options);

    // 加载容器
    if (this.el instanceof d3.selection) {
      this.container = this.el;
    } else {
      if (d3.select(this.el) instanceof d3.selection) {
        this.container = d3.select(this.el);
      } else {
        throw new Error("container unavailable !");
      }
    }

    // 加载svg
    this.svg = this.container.append("svg");

    // 加载uuid
    this.uuid = util.uuid();

    // 检测颜色
    this.color = d3.scaleSequential(
      d3.interpolate(this.options.startColor, this.options.endColor)
    );

    // 初始化内容
    this.init();
  }

  init() {
    const options = this.options;

    // 初始化容器内部
    this.svg.selectAll("*").remove();
    this.scaleList.splice(0);
    this.textList.splice(0);

    // 加载defs
    this.defs = this.svg.append("defs");

    // 初始化并加载g容器
    this.g = this.svg.append("g").attr("class", "g");

    // 设置容器与内容大小，与父级容器兼容
    this.updateSize();

    const count = options.splitConut;

    // 初始化并加载刻度
    if (options.showScale) {
      this.createScale(count);
    }

    // 初始化并加载指针
    if (options.showPointer) {
      this.createPointer();
    }

    // 动画前往对应值
    this.animation(t => {
      this.render(t * options.value);
    });
  }

  // 创建指针
  createPointer() {}

  // 创建刻度
  createScale(count) {
    this.scaleList.length = count - 1;
    this.scaleList = Array.from(this.scaleList).map((_, index) => {
      const scale = this.g.append("path").attr("fill", "#eee");
      return scale;
    });

    this.textList.length = count;
    this.textList = Array.from(this.textList).map((_, index) => {
      const text = this.g
        .append("text")
        .attr("color", "#eee")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle");
      return text;
    });
  }

  render(value) {
    const options = this.options;
    const count = options.splitConut;
    const baseAngle = (Math.PI / 180) * (options.allAngle / (count - 1));
    const offset = (Math.PI / 180) * options.offsetAngle;
    const space = (Math.PI / 180) * 20;
    const borderCenter = options.radius;

    this.scaleList.forEach((scale, index) => {
      const startAngle = baseAngle * index + offset + space / 2;
      scale.attr(
        "d",
        this.arc({
          startAngle,
          endAngle: startAngle + baseAngle - space
        })
      );
    });

    this.textList.forEach((text, index) => {
      const startAngle = baseAngle * index;
      const _text = (index * 1) / (count - 1);
      text
        .text(_text)
        .attr(
          "x",
          Math.sin(startAngle + (options.offsetAngle * Math.PI) / 180) *
            borderCenter
        )
        .attr(
          "y",
          -Math.cos(startAngle + (options.offsetAngle * Math.PI) / 180) *
            borderCenter
        );
    });
  }

  update(newValue) {
    const options = this.options;
    const oldValue = options.value;
    if (Number(newValue) > 1) {
      newValue = 1;
    }
    if (Number(newValue) < 0) {
      newValue = 0;
    }
    const diff = newValue - oldValue;
    this.options.value = Number(newValue);

    // 动画前往新值
    this.animation(t => {
      this.render(oldValue + diff * t);
    });
  }

  setOptions(newOptions = {}) {
    util.extend(true, this.options, newOptions);
    this.render(this.options.value);
  }

  animation(tickCallback) {
    const options = this.options;
    if (this.transition && this.transition.interpolate) {
      this.transition.interrupt();
    }

    this.transition = this.g
      .transition()
      .duration(options.duration)
      .ease(options.ease)
      .tween("_", () => {
        return tickCallback;
      })
      .on("end", () => {
        if (typeof options.changeEndCallback === "function") {
          options.changeEndCallback(options.value);
        }
      });
  }

  destroy() {
    this.g.remove();
    this.g = null;
    this.defs.remove();
    this.defs = null;
    this.arc.remove();
    this.arc = null;
    this.color = null;
    this.svg = null;
    this.options = {};
    this.scaleList.splice(0);
    this.textList.splice(0);

    // 初始化容器内部
    this.container.selectAll("*").remove();
  }

  resize = util.debounce(() => {
    this.updateSize();
    this.render(this.options.value);
  });

  updateSize() {
    const options = this.options;
    const offsetWidth = parseInt(this.container.style("width"));
    const offsetHeight = parseInt(this.container.style("height"));
    const minRadius = Math.min(offsetWidth, offsetHeight);
    this.svg.attr("width", "100%").attr("height", "100%");
    options.radius = minRadius / 2 - 20;
    options.cx = minRadius / 2 - 20;
    options.cy = minRadius / 2 - 20 ;

    // 加载arc
    this.arc = d3
      .arc()
      .innerRadius(this.options.radius - 1)
      .outerRadius(this.options.radius - 3)
      .padAngle(-Math.PI / 180);

    this.svg.attr("viewBox", `0 0 ${minRadius} ${minRadius}`);
    this.g.attr(
      "transform",
      "translate(" + minRadius / 2 + "," + minRadius / 2 + ")"
    );
  }
}

export { Dashboard as default };
