/**
 * ImagePaletteExtractor - Extract color palettes from images
 * Uses median cut algorithm for color quantization
 */

class ImagePaletteExtractor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Load an image and extract its color palette
     * @param {File|Blob|string} source - Image file, blob, or data URL
     * @param {number} colorCount - Number of colors to extract (default: 8)
     * @returns {Promise<{colors: string[], dominant: string}>}
     */
    async extractPalette(source, colorCount = 8) {
        const img = await this.loadImage(source);
        const pixels = this.getPixelData(img);
        const palette = this.medianCut(pixels, colorCount);
        
        // Sort by luminance (dark to light)
        palette.sort((a, b) => this.getLuminance(a) - this.getLuminance(b));
        
        // Find dominant color (most frequent)
        const dominant = this.findDominantColor(pixels, palette);
        
        return {
            colors: palette.map(c => this.rgbToHex(c)),
            dominant: this.rgbToHex(dominant)
        };
    }

    /**
     * Load image from various sources
     */
    loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            
            if (source instanceof File || source instanceof Blob) {
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(source);
            } else {
                img.src = source;
            }
        });
    }

    /**
     * Get pixel data from image (downsampled for performance)
     */
    getPixelData(img) {
        // Downsample large images for performance
        const maxSize = 150;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
            const scale = maxSize / Math.max(width, height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const pixels = [];
        
        // Sample pixels (skip every other for large images)
        const step = width * height > 10000 ? 2 : 1;
        
        for (let i = 0; i < imageData.data.length; i += 4 * step) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Skip near-white and near-black pixels for more interesting palette
            const lum = this.getLuminance([r, g, b]);
            if (lum < 0.03 || lum > 0.97) continue;
            
            pixels.push([r, g, b]);
        }
        
        return pixels;
    }

    /**
     * Median cut color quantization algorithm
     */
    medianCut(pixels, targetColors) {
        if (pixels.length === 0) {
            return [[128, 128, 128]]; // Default gray if no pixels
        }
        
        // Start with one bucket containing all pixels
        let buckets = [pixels];
        
        // Split until we have enough colors
        while (buckets.length < targetColors) {
            // Find the bucket with the widest color range
            let maxRangeIdx = 0;
            let maxRange = 0;
            
            buckets.forEach((bucket, idx) => {
                if (bucket.length < 2) return;
                
                const range = this.getColorRange(bucket);
                if (range.maxRange > maxRange) {
                    maxRange = range.maxRange;
                    maxRangeIdx = idx;
                }
            });
            
            // If no bucket can be split, we're done
            if (maxRange === 0) break;
            
            // Split the bucket with the widest range
            const bucketToSplit = buckets[maxRangeIdx];
            const range = this.getColorRange(bucketToSplit);
            
            // Sort by the channel with the widest range
            bucketToSplit.sort((a, b) => a[range.channel] - b[range.channel]);
            
            // Split in half
            const midpoint = Math.floor(bucketToSplit.length / 2);
            const left = bucketToSplit.slice(0, midpoint);
            const right = bucketToSplit.slice(midpoint);
            
            // Replace original bucket with two new ones
            buckets.splice(maxRangeIdx, 1, left, right);
        }
        
        // Average each bucket to get final colors
        return buckets.map(bucket => this.averageColor(bucket));
    }

    /**
     * Get the color range of a bucket
     */
    getColorRange(bucket) {
        const ranges = [0, 1, 2].map(channel => {
            const values = bucket.map(p => p[channel]);
            return Math.max(...values) - Math.min(...values);
        });
        
        const maxRange = Math.max(...ranges);
        const channel = ranges.indexOf(maxRange);
        
        return { maxRange, channel };
    }

    /**
     * Calculate average color of a bucket
     */
    averageColor(bucket) {
        if (bucket.length === 0) return [128, 128, 128];
        
        const sum = bucket.reduce((acc, pixel) => {
            return [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]];
        }, [0, 0, 0]);
        
        return [
            Math.round(sum[0] / bucket.length),
            Math.round(sum[1] / bucket.length),
            Math.round(sum[2] / bucket.length)
        ];
    }

    /**
     * Find the dominant (most common) color from palette
     */
    findDominantColor(pixels, palette) {
        const counts = palette.map(() => 0);
        
        pixels.forEach(pixel => {
            let minDist = Infinity;
            let minIdx = 0;
            
            palette.forEach((color, idx) => {
                const dist = this.colorDistance(pixel, color);
                if (dist < minDist) {
                    minDist = dist;
                    minIdx = idx;
                }
            });
            
            counts[minIdx]++;
        });
        
        const maxIdx = counts.indexOf(Math.max(...counts));
        return palette[maxIdx];
    }

    /**
     * Calculate squared Euclidean distance between colors
     */
    colorDistance(c1, c2) {
        return (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2;
    }

    /**
     * Get relative luminance (0-1)
     */
    getLuminance(rgb) {
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Convert RGB array to hex string
     */
    rgbToHex(rgb) {
        return '#' + rgb.map(c => {
            const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
            return hex.padStart(2, '0');
        }).join('');
    }

    /**
     * Get resized base64 image for vision API (max 512px)
     */
    getResizedBase64(img, maxSize = 512) {
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
            const scale = maxSize / Math.max(width, height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(img, 0, 0, width, height);
        
        // Return base64 without data URL prefix
        return this.canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    }

    /**
     * Categorize colors for theme generation
     */
    categorizeColors(hexColors) {
        const categorized = {
            dark: [],
            light: [],
            vibrant: [],
            muted: []
        };
        
        hexColors.forEach(hex => {
            const rgb = this.hexToRgb(hex);
            const hsl = this.rgbToHsl(rgb);
            const lum = this.getLuminance(rgb);
            
            // Categorize by luminance
            if (lum < 0.3) {
                categorized.dark.push(hex);
            } else if (lum > 0.7) {
                categorized.light.push(hex);
            }
            
            // Categorize by saturation
            if (hsl.s > 0.5) {
                categorized.vibrant.push(hex);
            } else {
                categorized.muted.push(hex);
            }
        });
        
        return categorized;
    }

    /**
     * Convert hex to RGB array
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    /**
     * Convert RGB to HSL
     */
    rgbToHsl(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        return { h, s, l };
    }

    /**
     * Suggest theme colors based on extracted palette
     */
    suggestThemeColors(palette, baseTheme = 'dark') {
        const colors = palette.colors;
        const categorized = this.categorizeColors(colors);
        
        let background, foreground, accent;
        
        if (baseTheme === 'dark') {
            // For dark theme: use darkest color as background
            background = categorized.dark[0] || colors[0];
            foreground = categorized.light[0] || colors[colors.length - 1];
            accent = categorized.vibrant[0] || colors[Math.floor(colors.length / 2)];
        } else {
            // For light theme: use lightest color as background
            background = categorized.light[0] || colors[colors.length - 1];
            foreground = categorized.dark[0] || colors[0];
            accent = categorized.vibrant[0] || colors[Math.floor(colors.length / 2)];
        }
        
        return {
            background,
            foreground,
            accent,
            allColors: colors
        };
    }
}

// Export
window.ImagePaletteExtractor = ImagePaletteExtractor;

