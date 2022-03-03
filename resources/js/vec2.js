/*
 * Copyright (c) 2022, Sergio S.- sergi.ss4@gmail.com http://sergiosoriano.com
 */
export default class Vec2 {

    constructor(x = 0, y = 0) {
        this.set(x, y); 
    }

    set(x, y) {
        if (x instanceof Vec2) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = (y === undefined ? x : y);
        }
        return this;
    }

    add(x, y) {
        if (x instanceof Vec2) {
            this.x += x.x;
            this.y += x.y;
        } else {
            this.x += x;
            this.y += (y === undefined ? x : y);
        }
        return this;
    }

    sub(x, y) {
        if (x instanceof Vec2) {
            this.x -= x.x;
            this.y -= x.y;
        } else {
            this.x -= x;
            this.y -= (y === undefined ? x : y);
        }
        return this;
    }

    div(x, y) {
        if (x instanceof Vec2) {
            this.x /= x.x;
            this.y /= x.y;
        } else {
            this.x /= x;
            this.y /= (y === undefined ? x : y);
        }
        return this;
    }

    scl(x, y) {
        if (x instanceof Vec2) {
            this.x *= x.x;
            this.y *= x.y;
        } else {
            this.x *= x;
            this.y *= (y === undefined ? x : y);
        }
        return this;
    }

    dot(x, y) {
        if (x instanceof Vec2) {
          return this.x * x.x + this.y * x.y;
        }
        return this.x * x + this.y * (y === undefined ? x : y);
    }

    addScl(v, f) {
        this.x += v.x * f;
        this.y += v.y * f;
        return this;
    }

    rotate(sin, cos) {
        if (cos === undefined) {
          cos = Math.cos(sin);
          sin = Math.sin(sin);
        }
        let tmp = this.x;
        this.x = this.x * cos - this.y * sin;
        this.y = tmp * sin + this.y * cos;
        return this;
    }

    getAngle() {
        return Math.atan2(this.y, this.x);
    }
    
    dst2(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if(y === undefined) {
            y = x;
        }
        let dx = x - this.x;
        let dy = y - this.y;
        return dx * dx + dy * dy;
    }
    
    dst(x, y) {
        if (x instanceof Vec2) {
            y = x.y;
            x = x.x;
        } else if(y === undefined) {
            y = x;
        }
        return Math.sqrt(this.dst2(x, y));
    }
    
    len2() {
        return this.x * this.x + this.y * this.y;
    }

    len() {
        return Math.sqrt(this.len2());
    }
    
    nor() {
        let len = this.len2();
        if (len != 0) {
            len = Math.sqrt(len);
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
    
    setZero() {
        this.x = this.y = 0;
        return this;
    }

    isZero() {
        return this.x === 0 && this.y === 0;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
      
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    lerp (target, alpha) {
		const invAlpha = 1.0 - alpha;
		this.x = (this.x * invAlpha) + (target.x * alpha);
		this.y = (this.y * invAlpha) + (target.y * alpha);
		return this;
	}

    setMin(p) {
        this.x = Math.min(this.x, p.x);
        this.y = Math.min(this.y, p.y);
        return this;
    }

    setMax(p) {
        this.x = Math.max(this.x, p.x);
        this.y = Math.max(this.y, p.y);
        return this;
    }
    
    copy() {
        return new Vec2(this.x, this.y);
    }
    
    render(ctx, props = {}) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, props.radius || 25, 0, 2.0 * Math.PI, false);
        if(props.color) ctx.fillStyle = props.color;
        ctx.fill();
    }

}