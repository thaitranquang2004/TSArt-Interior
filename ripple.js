/*  
 *  FULL OPTIMIZED VERSION WITH INTERSECTION OBSERVER
 *  - Ported from Archinic demo (demo.casethemes.net/archinic/home-02/)
 *  - Fixed duplicate observer instances
 *  - Fixed memory leaks
 *  - Improved CORS handling
 *  - Added error boundaries
 *  - Better cleanup logic
 *  - No double init
 *  - Resize & Swiper safe
 *  - Lazyload safe
 *  - ES5 compatible (IE11+)
 */

(function ($) {
    'use strict';

    var $window = $(window);
    var initLock = false;
    var globalRippleObserver = null;

    // Polyfill endsWith
    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function (suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

    /**
     * Check WebGL support
     */
    function hasWebGLSupport() {
        try {
            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                canvas.remove();
                return false;
            }
            var ok = !!(
                gl.getExtension('OES_texture_float') &&
                gl.getExtension('OES_texture_float_linear')
            );
            canvas.remove();
            return ok;
        } catch (e) {
            return false;
        }
    }

    var supportsWebGL = hasWebGLSupport();

    /**
     * Create WebGL Program
     */
    function createProgram(gl, vertexSource, fragmentSource) {
        function compileSource(type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                var info = gl.getShaderInfoLog(shader) || '';
                gl.deleteShader(shader);
                throw new Error('compile error: ' + info);
            }
            return shader;
        }

        var program = {
            id: gl.createProgram(),
            uniforms: {},
            locations: {}
        };

        var vertexShader = compileSource(gl.VERTEX_SHADER, vertexSource);
        var fragmentShader = compileSource(gl.FRAGMENT_SHADER, fragmentSource);

        gl.attachShader(program.id, vertexShader);
        gl.attachShader(program.id, fragmentShader);
        gl.linkProgram(program.id);

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (!gl.getProgramParameter(program.id, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(program.id) || '';
            gl.deleteProgram(program.id);
            throw new Error('link error: ' + info);
        }

        gl.useProgram(program.id);

        // vertex attribute
        var vertexLocation = gl.getAttribLocation(program.id, 'vertex');
        if (vertexLocation !== -1) {
            program.locations.vertex = vertexLocation;
            gl.enableVertexAttribArray(vertexLocation);
        }

        // uniform extractor
        var regex = /uniform\s+(\w+)\s+(\w+)/g;
        var match;
        var allCode = vertexSource + '\n' + fragmentSource;
        while ((match = regex.exec(allCode)) !== null) {
            program.locations[match[2]] = gl.getUniformLocation(program.id, match[2]);
        }

        return program;
    }

    function bindTexture(gl, texture, unit) {
        gl.activeTexture(gl.TEXTURE0 + (unit || 0));
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    function isPowerOfTwo(x) {
        return (x & (x - 1)) === 0;
    }

    // ======================================
    //              RIPPLE CLASS
    // ======================================

    function Ripples(el, options) {
        this.$el = $(el);
        this.$el.addClass('ripples');
        this._destroyed = false;

        var isMobile =
            /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        if (isMobile) {
            this._failed = true;
            return;
        }

        this._failed = false;
        this._lastDropTime = 0;
        this._minDropInterval = options.minDropInterval || 16;
        this.resolution = options.resolution || 256;
        this.textureDelta = new Float32Array([1 / this.resolution, 1 / this.resolution]);
        this.perturbance = options.perturbance !== undefined ? options.perturbance : Ripples.DEFAULTS.perturbance;
        this.devicePixelRatio = window.devicePixelRatio || 1;

        // get background url
        var backgroundUrl = options.imageUrl;
        if (!backgroundUrl) {
            var cssBg = this.$el.css('background-image') || '';
            var match = /url\(["']?([^"']*)["']?\)/.exec(cssBg);
            if (match && match[1]) {
                backgroundUrl = match[1];
            }
        }

        if (!backgroundUrl) {
            console.warn('Ripples: no imageUrl or background-image.');
            this._failed = true;
            return;
        }

        this.$img = this.$el.find('img').first();

        var display = this._getDisplaySize();
        var cWidth = display.width || 1;
        var cHeight = display.height || 1;

        if (cWidth <= 1 || cHeight <= 1) {
            var dim = this._getImageDimensions();
            cWidth = dim.width || 1;
            cHeight = dim.height || 1;
        }

        var canvas = document.createElement('canvas');
        this.canvas = canvas;

        canvas.width = Math.round(cWidth * this.devicePixelRatio);
        canvas.height = Math.round(cHeight * this.devicePixelRatio);

        $(canvas).css({
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 1
        });

        this.$el.append(canvas);

        var gl;
        try {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        } catch (e) {
            console.warn('WebGL context error:', e);
        }

        if (!gl) {
            console.warn('No WebGL context.');
            this._failed = true;
            canvas.remove();
            return;
        }

        this.gl = gl;

        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear');

        this._resizeTimer = null;
        this._onResize = this._createResizeHandler();
        $window.on('resize.ripples', this._onResize);

        this._setupImageLoadAndResize();

        this.$el.on('mousemove.ripples', $.proxy(this.mousemove, this));
        this.$el.on('mousedown.ripples', $.proxy(this.mousedown, this));

        try {
            this._initWebGLResources();
            this.initShaders();
        } catch (e) {
            console.error('WebGL initialization error:', e);
            this._failed = true;
            this.destroy();
            return;
        }

        this.backgroundTexture = null;
        this.backgroundWidth = 0;
        this.backgroundHeight = 0;
        this._loadBackgroundImage(backgroundUrl);

        this._isVisible = true;
        this._boundaryCache = null;
        this._boundaryCacheTime = 0;
        this._boundaryCacheTimeout = 250;

        // Use global observer instead of creating new one
        this._isObserved = false;

        this._startAnimationLoop();
    }

    Ripples.DEFAULTS = {
        resolution: 256,
        perturbance: 0.035,
        minDropInterval: 16
    };

    // =============================
    //          Prototype
    // =============================

    Ripples.prototype = {

        _getImageDimensions: function () {
            var cw = this.$el.outerWidth();
            var ch = this.$el.outerHeight();

            if (this.$img.length > 0) {
                var img = this.$img[0];
                var w = img.naturalWidth || this.$img.width() || cw;
                var h = img.naturalHeight || this.$img.height() || ch;
                return { width: w, height: h };
            }

            return { width: cw, height: ch };
        },

        _getDisplaySize: function () {
            return {
                width: this.$el.outerWidth(),
                height: this.$el.outerHeight()
            };
        },

        _updateCanvasSize: function (w, h) {
            if (!this.canvas) return;
            var dpr = this.devicePixelRatio;

            var rw = w * dpr;
            var rh = h * dpr;

            if (rw !== this.canvas.width || rh !== this.canvas.height) {
                this.canvas.width = rw;
                this.canvas.height = rh;
                $(this.canvas).css({ width: w + 'px', height: h + 'px' });
                this._boundaryCache = null;
            }
        },

        _createResizeHandler: function () {
            var that = this;
            return function () {
                clearTimeout(that._resizeTimer);
                that._resizeTimer = setTimeout(function () {
                    if (that._destroyed) return;
                    var size = that._getDisplaySize();
                    if (size.width > 0 && size.height > 0) {
                        that._updateCanvasSize(size.width, size.height);
                    }
                }, 150);
            };
        },

        _setupImageLoadAndResize: function () {
            var that = this;

            if (this.$img.length > 0) {
                this.$img.on('load.ripples', function () {
                    var size = that._getDisplaySize();
                    that._updateCanvasSize(size.width, size.height);
                });
            }

            if (window.ResizeObserver) {
                var roTimeout = null;
                this._resizeObserver = new ResizeObserver(function (entries) {
                    clearTimeout(roTimeout);
                    roTimeout = setTimeout(function () {
                        if (that._destroyed) return;
                        for (var i = 0; i < entries.length; i++) {
                            var entry = entries[i];
                            var w = entry.contentRect.width;
                            var h = entry.contentRect.height;
                            if (w > 0 && h > 0) {
                                that._updateCanvasSize(w, h);
                            }
                        }
                    }, 80);
                });
                this._resizeObserver.observe(this.$el[0]);
            }
        },

        _initWebGLResources: function () {
            var gl = this.gl;
            this.textures = [];
            this.framebuffers = [];

            for (var i = 0; i < 2; i++) {
                var tex = gl.createTexture();
                var fb = gl.createFramebuffer();

                gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                fb.width = this.resolution;
                fb.height = this.resolution;

                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.resolution, this.resolution, 0, gl.RGBA, gl.FLOAT, null);

                var rb = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.resolution, this.resolution);

                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
                fb.renderbuffer = rb;

                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                this.textures.push(tex);
                this.framebuffers.push(fb);
            }

            this.quad = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, +1, -1, +1, +1, -1, +1]),
                gl.STATIC_DRAW
            );
        },

        _loadBackgroundImage: function (url) {
            var that = this;
            var img = new Image();
            var corsRetried = false;

            img.crossOrigin = 'anonymous';

            img.onload = function () {
                var gl = that.gl;
                if (!gl || that._destroyed) return;

                try {
                    var wrap = (isPowerOfTwo(img.width) && isPowerOfTwo(img.height)) ? gl.REPEAT : gl.CLAMP_TO_EDGE;

                    that.backgroundWidth = img.width;
                    that.backgroundHeight = img.height;

                    var tex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, tex);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

                    if (that.backgroundTexture) {
                        gl.deleteTexture(that.backgroundTexture);
                    }

                    that.backgroundTexture = tex;
                    that._boundaryCache = null;
                } catch (e) {
                    console.error('Failed to create texture:', e);
                    that._failed = true;
                }
            };

            img.onerror = function () {
                // Retry without CORS if failed and haven't retried yet
                if (!corsRetried && img.crossOrigin) {
                    corsRetried = true;
                    img.crossOrigin = '';
                    img.src = url;
                } else {
                    console.warn('Ripples: Failed to load image:', url);
                    that._failed = true;
                }
            };

            img.src = url;
        },

        _startAnimationLoop: function () {
            var that = this;
            function step() {
                if (!that._destroyed) {
                    if (that._isVisible && that.backgroundTexture) {
                        try {
                            that.update();
                        } catch (e) {
                            console.error('Ripple update error:', e);
                            that.destroy();
                            return;
                        }
                    }
                    that._rafId = requestAnimationFrame(step);
                }
            }
            this._rafId = requestAnimationFrame(step);
        },

        update: function () {
            var gl = this.gl;
            if (!gl || !this.backgroundTexture || this._destroyed) return;
            this.updateTextures();
            this.render();
        },

        _drawQuadWith: function (program) {
            var gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
            var loc = program.locations.vertex || 0;
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        },

        render: function () {
            var gl = this.gl;
            if (!gl || !this.renderProgram) return;

            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.useProgram(this.renderProgram.id);

            bindTexture(gl, this.backgroundTexture, 0);
            bindTexture(gl, this.textures[0], 1);

            gl.uniform2fv(this.renderProgram.locations.topLeft, this.renderProgram.uniforms.topLeft);
            gl.uniform2fv(this.renderProgram.locations.bottomRight, this.renderProgram.uniforms.bottomRight);
            gl.uniform2fv(this.renderProgram.locations.containerRatio, this.renderProgram.uniforms.containerRatio);
            gl.uniform1i(this.renderProgram.locations.samplerBackground, 0);
            gl.uniform1i(this.renderProgram.locations.samplerRipples, 1);

            this._drawQuadWith(this.renderProgram);
        },

        updateTextures: function () {
            var gl = this.gl;

            this.computeTextureBoundaries();
            gl.viewport(0, 0, this.resolution, this.resolution);

            for (var i = 0; i < 2; i++) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[i]);
                bindTexture(gl, this.textures[1 - i], 0);
                gl.useProgram(this.updateProgram[i].id);
                this._drawQuadWith(this.updateProgram[i]);
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        },

        computeTextureBoundaries: function () {
            var now = Date.now();
            if (this._boundaryCache && now - this._boundaryCacheTime < this._boundaryCacheTimeout) {
                var c = this._boundaryCache;
                this.renderProgram.uniforms.topLeft = c.topLeft;
                this.renderProgram.uniforms.bottomRight = c.bottomRight;
                this.renderProgram.uniforms.containerRatio = c.containerRatio;
                return;
            }

            var cw = this.canvas.width;
            var ch = this.canvas.height;
            var bw = this.backgroundWidth || cw;
            var bh = this.backgroundHeight || ch;

            var maxSide = Math.max(cw, ch);
            if (maxSide <= 0) maxSide = 1;

            var car = cw / ch;
            var bar = bw / bh;

            var left = 0, top = 0, right = 1, bottom = 1;
            if (car > bar) {
                // Canvas is wider than image: image covers width, cropped top & bottom
                var scale = bar / car;
                top = (1 - scale) * 0.5;
                bottom = top + scale;
            } else {
                // Canvas is taller than image: image covers height, cropped left & right
                var scale = car / bar;
                left = (1 - scale) * 0.5;
                right = left + scale;
            }

            var topLeft = new Float32Array([left, top]);
            var bottomRight = new Float32Array([right, bottom]);
            var ratio = new Float32Array([cw / maxSide, ch / maxSide]);

            this.renderProgram.uniforms.topLeft = topLeft;
            this.renderProgram.uniforms.bottomRight = bottomRight;
            this.renderProgram.uniforms.containerRatio = ratio;

            this._boundaryCache = { topLeft: topLeft, bottomRight: bottomRight, containerRatio: ratio };
            this._boundaryCacheTime = now;
        },

        // ================
        //     SHADERS
        // ================
        initShaders: function () {
            var gl = this.gl;

            var VERT = [
                'attribute vec2 vertex;',
                'varying vec2 coord;',
                'void main() {',
                '    coord = vertex * 0.5 + 0.5;',
                '    gl_Position = vec4(vertex, 0.0, 1.0);',
                '}'
            ].join('\n');

            // DROP
            this.dropProgram = createProgram(gl, VERT, [
                'precision highp float;',
                'const float PI = 3.141592653589793;',
                'uniform sampler2D texture;',
                'uniform vec2 center;',
                'uniform float radius;',
                'uniform float strength;',
                'varying vec2 coord;',
                'void main() {',
                '    vec4 info = texture2D(texture, coord);',
                '    float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);',
                '    drop = 0.5 - cos(drop * PI) * 0.5;',
                '    info.r += drop * strength;',
                '    gl_FragColor = info;',
                '}'
            ].join('\n'));

            // UPDATE PROGRAMS
            this.updateProgram = [];

            // update 0
            this.updateProgram[0] = createProgram(gl, VERT, [
                'precision highp float;',
                'uniform sampler2D texture;',
                'uniform vec2 delta;',
                'varying vec2 coord;',
                'void main() {',
                '    vec4 info = texture2D(texture, coord);',
                '    vec2 dx = vec2(delta.x, 0.0);',
                '    vec2 dy = vec2(0.0, delta.y);',
                '    float avg = (',
                '        texture2D(texture, coord - dx).r +',
                '        texture2D(texture, coord + dx).r +',
                '        texture2D(texture, coord - dy).r +',
                '        texture2D(texture, coord + dy).r',
                '    ) * 0.25;',
                '    info.g += (avg - info.r) * 2.0;',
                '    info.g *= 0.98;',
                '    info.r += info.g;',
                '    gl_FragColor = info;',
                '}'
            ].join('\n'));
            gl.useProgram(this.updateProgram[0].id);
            gl.uniform2fv(this.updateProgram[0].locations.delta, this.textureDelta);

            // update 1
            this.updateProgram[1] = createProgram(gl, VERT, [
                'precision highp float;',
                'uniform sampler2D texture;',
                'uniform vec2 delta;',
                'varying vec2 coord;',
                'void main() {',
                '    vec4 info = texture2D(texture, coord);',
                '    vec3 dx = vec3(delta.x, texture2D(texture, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);',
                '    vec3 dy = vec3(0.0, texture2D(texture, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y);',
                '    info.ba = normalize(cross(dy, dx)).xz;',
                '    gl_FragColor = info;',
                '}'
            ].join('\n'));
            gl.useProgram(this.updateProgram[1].id);
            gl.uniform2fv(this.updateProgram[1].locations.delta, this.textureDelta);

            // RENDER PROGRAM
            this.renderProgram = createProgram(gl, [
                'precision highp float;',
                'attribute vec2 vertex;',
                'uniform vec2 topLeft;',
                'uniform vec2 bottomRight;',
                'uniform vec2 containerRatio;',
                'varying vec2 ripplesCoord;',
                'varying vec2 backgroundCoord;',
                'void main() {',
                '    backgroundCoord = mix(topLeft, bottomRight, vertex * 0.5 + 0.5);',
                '    backgroundCoord.y = 1.0 - backgroundCoord.y;',
                '    ripplesCoord = vec2(vertex.x, -vertex.y) * containerRatio * 0.5 + 0.5;',
                '    gl_Position = vec4(vertex.x, -vertex.y, 0.0, 1.0);',
                '}'
            ].join('\n'), [
                'precision highp float;',
                'uniform sampler2D samplerBackground;',
                'uniform sampler2D samplerRipples;',
                'uniform float perturbance;',
                'varying vec2 ripplesCoord;',
                'varying vec2 backgroundCoord;',
                'void main() {',
                '    vec2 offset = -texture2D(samplerRipples, ripplesCoord).ba;',
                '    float specular = pow(max(0.0, dot(offset, normalize(vec2(-0.6, 1.0)))), 4.0);',
                '    gl_FragColor = texture2D(samplerBackground, backgroundCoord + offset * perturbance) + specular;',
                '}'
            ].join('\n'));

            gl.useProgram(this.renderProgram.id);
            gl.uniform1f(this.renderProgram.locations.perturbance, this.perturbance);

            this.renderProgram.uniforms.topLeft = new Float32Array([0, 0]);
            this.renderProgram.uniforms.bottomRight = new Float32Array([1, 1]);
            this.renderProgram.uniforms.containerRatio = new Float32Array([1, 1]);
        },

        dropAtMouse: function (e, radius, strength) {
            var gl = this.gl;
            if (!gl || this._destroyed) return;

            var off = this.$el.offset();
            var x = e.pageX - off.left;
            var y = e.pageY - off.top;

            var w = this.$el.outerWidth();
            var h = this.$el.outerHeight();

            var L = Math.max(w, h);
            var pos = new Float32Array([
                (2 * x - w) / L,
                (h - 2 * y) / L
            ]);

            gl.viewport(0, 0, this.resolution, this.resolution);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[0]);
            bindTexture(gl, this.textures[1], 0);

            gl.useProgram(this.dropProgram.id);
            gl.uniform2fv(this.dropProgram.locations.center, pos);
            gl.uniform1f(this.dropProgram.locations.radius, radius);
            gl.uniform1f(this.dropProgram.locations.strength, strength);

            this._drawQuadWith(this.dropProgram);

            // swap
            var fb = this.framebuffers[0];
            this.framebuffers[0] = this.framebuffers[1];
            this.framebuffers[1] = fb;

            var tx = this.textures[0];
            this.textures[0] = this.textures[1];
            this.textures[1] = tx;

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        },

        mousemove: function (e) {
            var now = performance.now ? performance.now() : Date.now();
            if (now - this._lastDropTime < this._minDropInterval) return;
            this._lastDropTime = now;
            this.dropAtMouse(e, 0.03, 0.01);
        },

        mousedown: function (e) {
            this.dropAtMouse(e, 0.09, 0.14);
        },

        setVisible: function (visible) {
            this._isVisible = !!visible;
        },

        destroy: function () {
            if (this._destroyed) return;
            this._destroyed = true;

            // Unobserve from global observer
            if (globalRippleObserver && this.$el[0]) {
                try {
                    globalRippleObserver.unobserve(this.$el[0]);
                } catch (e) {
                    // Ignore if already unobserved
                }
            }

            if (this._rafId) {
                cancelAnimationFrame(this._rafId);
                this._rafId = null;
            }

            if (this._resizeTimer) {
                clearTimeout(this._resizeTimer);
                this._resizeTimer = null;
            }

            $window.off('resize.ripples', this._onResize);
            this.$el.off('.ripples');

            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }

            if (this.gl) {
                var gl = this.gl;
                var i;

                if (this.textures) {
                    for (i = 0; i < this.textures.length; i++) {
                        if (this.textures[i]) gl.deleteTexture(this.textures[i]);
                    }
                }
                if (this.framebuffers) {
                    for (i = 0; i < this.framebuffers.length; i++) {
                        if (this.framebuffers[i]) {
                            if (this.framebuffers[i].renderbuffer) {
                                gl.deleteRenderbuffer(this.framebuffers[i].renderbuffer);
                            }
                            gl.deleteFramebuffer(this.framebuffers[i]);
                        }
                    }
                }

                if (this.backgroundTexture) gl.deleteTexture(this.backgroundTexture);
                if (this.quad) gl.deleteBuffer(this.quad);

                if (this.dropProgram && this.dropProgram.id) gl.deleteProgram(this.dropProgram.id);
                if (this.renderProgram && this.renderProgram.id) gl.deleteProgram(this.renderProgram.id);
                if (this.updateProgram) {
                    for (i = 0; i < this.updateProgram.length; i++) {
                        if (this.updateProgram[i] && this.updateProgram[i].id) {
                            gl.deleteProgram(this.updateProgram[i].id);
                        }
                    }
                }

                var lose = gl.getExtension('WEBGL_lose_context');
                if (lose) {
                    try {
                        lose.loseContext();
                    } catch (e) {
                        // Ignore
                    }
                }

                this.textures = null;
                this.framebuffers = null;
                this.quad = null;
                this.dropProgram = null;
                this.renderProgram = null;
                this.updateProgram = null;
                this.backgroundTexture = null;

                this.gl = null;
            }

            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.canvas = null;

            this.$el.removeClass('ripples');
            this.$el.removeData('ripples');
        }
    };

    // =============================
    //      jQuery plugin
    // =============================

    var old = $.fn.ripples;

    $.fn.ripples = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ripples');

            if (typeof option === 'string') {
                if (data && typeof data[option] === 'function') {
                    data[option].apply(data, args);
                }
                return;
            }

            if (!supportsWebGL) {
                console.warn('WebGL not supported');
                return;
            }

            if (!data) {
                var opts = $.extend({}, Ripples.DEFAULTS, $this.data(), typeof option === 'object' && option);
                var instance = new Ripples(this, opts);
                if (!instance._failed) {
                    $this.data('ripples', instance);
                }
            }
        });
    };

    $.fn.ripples.Constructor = Ripples;

    $.fn.ripples.noConflict = function () {
        $.fn.ripples = old;
        return this;
    };

    // =============================
    //      AUTO INIT + HELPERS
    // =============================

    function destroyRipples($scope, onlyDuplicates) {
        var $target = $scope ? ($scope.is('.hover-imge-ripple') ? $scope : $scope.find('.hover-imge-ripple')) : $('.hover-imge-ripple');
        $target.each(function () {
            var $el = $(this);
            var r = $el.data('ripples');
            if (r && typeof r.destroy === 'function') {
                r.destroy();
            }
        });
    }

    function cleanupInvisibleDuplicates($scope) {
        var $target = $scope ? ($scope.is('.hover-imge-ripple') ? $scope : $scope.find('.hover-imge-ripple')) : $('.hover-imge-ripple');
        $target.each(function () {
            var $el = $(this);
            var $slide = $el.closest('.pxl-swiper-slide, .swiper-slide');

            if ($slide.length &&
                $slide.hasClass('swiper-slide-duplicate') &&
                !$slide.hasClass('swiper-slide-visible')) {

                var r = $el.data('ripples');
                if (r && typeof r.destroy === 'function') {
                    r.destroy();
                }
            }
        });
    }

    // INTERNAL: Actually create the WebGL instance
    function _createRippleInstance($el, forceReinit) {
        var inst = $el.data('ripples');

        if (forceReinit && inst) {
            inst.destroy();
            inst = null;
        }

        if (inst && inst._destroyed) inst = null;

        if (!inst) {
            var url = $el.attr('data-image-url');
            if (!url) {
                var bg = $el.css('background-image') || '';
                var m = /url\(["']?([^"']*)["']?\)/.exec(bg);
                if (m && m[1]) url = m[1];
            }
            if (!url) {
                var $img = $el.find('img').first();
                if ($img.length && $img.attr('src')) {
                    url = $img.attr('src');
                }
            }

            if (url) {
                try {
                    $el.ripples({
                        resolution: 256,
                        perturbance: 0.035,
                        minDropInterval: 16,
                        imageUrl: url
                    });
                } catch (e) {
                    console.warn('Ripples init failed:', e);
                }
            }
        }
    }

    // ================================================
    //  🎯 GLOBAL OBSERVER – Manage Lifecycle
    // ================================================

    if (window.IntersectionObserver) {
        globalRippleObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var $el = $(entry.target);
                var rippleData = $el.data('ripples');

                if (entry.isIntersecting) {
                    // ENTER: Create or resume
                    if (!rippleData || rippleData._destroyed) {
                        _createRippleInstance($el, false);
                    } else if (rippleData && typeof rippleData.setVisible === 'function') {
                        rippleData.setVisible(true);
                    }
                } else {
                    // EXIT: Pause or destroy to save WebGL resources
                    if (rippleData && !rippleData._destroyed) {
                        if (typeof rippleData.setVisible === 'function') {
                            rippleData.setVisible(false);
                        }
                    }
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.01
        });
    }

    // Public init function: Registers elements with the global observer
    function initRipples($scope, forceReinit) {
        var isMobile =
            window.matchMedia ?
                window.matchMedia('(max-width: 767px)').matches :
                (window.innerWidth <= 767);

        if (isMobile) return;

        var $target;
        if ($scope && $scope.length) {
            if ($scope.is('.hover-imge-ripple')) {
                $target = $scope;
            } else {
                $target = $scope.find('.hover-imge-ripple');
            }
        } else {
            $target = $('.hover-imge-ripple');
        }

        $target.each(function () {
            var $el = $(this);

            if (globalRippleObserver) {
                var alreadyObserved = $el.data('ripple-observed');
                if (!alreadyObserved) {
                    globalRippleObserver.observe(this);
                    $el.data('ripple-observed', true);
                }
            } else {
                _createRippleInstance($el, forceReinit);
            }
        });
    }

    // Expose public functions
    window.initRipples = initRipples;
    window.destroyRipples = destroyRipples;
    window.cleanupInvisibleDuplicates = cleanupInvisibleDuplicates;

    // Auto-init on ready
    $(document).ready(function () {
        initRipples();
    });

    // Re-init on load (for lazy images)
    $(window).on('load', function () {
        initRipples();
    });

    // Cleanup on page unload
    $(window).on('beforeunload', function () {
        destroyRipples();
        if (globalRippleObserver) {
            globalRippleObserver.disconnect();
            globalRippleObserver = null;
        }
    });

})(jQuery);
