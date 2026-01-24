/**
 * Particle Text Effects Component
 * Creates interactive particle effects for text elements
 */

// Global variables
let particleTextInstances = [];
let animationFrameId;

// Particle colors
const particleColors = [
    '#39FF14', // Neon green
    '#7B4DFF', // Purple
    '#FF00FF', // Pink
    '#00F5FF'  // Teal
];

// Initialize particle text effects when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initParticleTextEffects();
});

/**
 * Initialize particle text effects
 */
function initParticleTextEffects() {
    // Find elements to apply effect to
    const particleElements = document.querySelectorAll('.particle-text');
    
    if (particleElements.length > 0) {
        // Apply effect to each element
        particleElements.forEach(element => {
            applyParticleEffect(element);
        });
    }
}

/**
 * Particle Text class
 */
class ParticleText {
    /**
     * Create a particle text effect
     * @param {HTMLElement} element - The element to apply effect to
     */
    constructor(element) {
        this.element = element;
        this.text = element.textContent;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.isActive = false;
        this.canvas = null;
        this.ctx = null;
        this.rect = null;
        this.fontSize = parseInt(window.getComputedStyle(element).fontSize);
        
        // Replace text with canvas and add to particle text instances
        this.init();
        particleTextInstances.push(this);
    }
    
    /**
     * Initialize the particle text
     */
    init() {
        // Save original text and clear element
        const originalText = this.element.textContent;
        this.element.textContent = '';
        
        // Create and add canvas
        this.setupCanvas();
        
        // Create particles
        this.createParticles();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Set up canvas element
     */
    setupCanvas() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-text-canvas';
        this.element.appendChild(this.canvas);
        
        // Get context
        this.ctx = this.canvas.getContext('2d');
        
        // Set dimensions
        this.resize();
        
        // Draw initial text
        this.drawText();
    }
    
    /**
     * Resize canvas
     */
    resize() {
        // Get element dimensions
        this.rect = this.element.getBoundingClientRect();
        
        // Set canvas dimensions with higher resolution for retina displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.rect.width * dpr;
        this.canvas.height = this.rect.height * dpr;
        
        // Set canvas CSS dimensions
        this.canvas.style.width = `${this.rect.width}px`;
        this.canvas.style.height = `${this.rect.height}px`;
        
        // Scale context for retina displays
        this.ctx.scale(dpr, dpr);
    }
    
    /**
     * Draw text on canvas
     */
    drawText() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set text properties
        this.ctx.font = window.getComputedStyle(this.element).font;
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw text
        this.ctx.fillText(
            this.text,
            this.rect.width / 2,
            this.rect.height / 2
        );
    }
    
    /**
     * Create particles from text
     */
    createParticles() {
        // Clear existing particles
        this.particles = [];
        
        // Draw text for pixel data
        this.drawText();
        
        // Get pixel data
        const imageData = this.ctx.getImageData(
            0, 0,
            this.rect.width,
            this.rect.height
        );
        
        const data = imageData.data;
        const particles = [];
        
        // Sample pixels to create particles - use a larger sample rate for cleaner text
        const sampleRate = Math.max(2, Math.floor(this.fontSize / 4));
        
        for (let y = 0; y < this.rect.height; y += sampleRate) {
            for (let x = 0; x < this.rect.width; x += sampleRate) {
                const index = (y * this.rect.width + x) * 4;
                const alpha = data[index + 3];
                
                // If pixel is opaque enough (part of text)
                if (alpha > 200) { // Increased threshold for more defined particles
                    // Use more consistent particle sizes for cleaner appearance
                    const size = 2.0; // Fixed size for better readability
                    
                    this.particles.push({
                        x: x,
                        y: y,
                        originX: x,
                        originY: y,
                        color: this.getRandomColor(),
                        size: size,
                        velocity: {
                            x: 0,
                            y: 0
                        },
                        friction: 0.94, // Reduced for smoother movement
                        springFactor: 0.08 // Increased for quicker return to position
                    });
                }
            }
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Get a random color from the theme
     * @returns {String} CSS color string
     */
    getRandomColor() {
        return particleColors[Math.floor(Math.random() * particleColors.length)];
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        // Mouse move
        this.element.addEventListener('mousemove', (e) => {
            this.rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - this.rect.left;
            this.mouse.y = e.clientY - this.rect.top;
        });
        
        // Mouse enter
        this.element.addEventListener('mouseenter', () => {
            this.isActive = true;
            
            // Start animation if not already running
            if (!animationFrameId) {
                animate();
            }
        });
        
        // Mouse leave
        this.element.addEventListener('mouseleave', () => {
            this.isActive = false;
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
    }
    
    /**
     * Update particles
     */
    update() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle glow effect for better visibility
        this.ctx.shadowColor = 'rgba(100, 220, 255, 0.5)';
        this.ctx.shadowBlur = 10;
        
        // Draw and update particles
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // Calculate distance to mouse
            if (this.isActive && this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = Math.min(100, 1200 / (distance * distance));
                
                if (distance < 150) { // Increased interaction radius
                    // Add repelling force
                    particle.velocity.x -= dx * force / 800;
                    particle.velocity.y -= dy * force / 800;
                }
            }
            
            // Spring effect toward original position
            const dx = particle.originX - particle.x;
            const dy = particle.originY - particle.y;
            
            particle.velocity.x += dx * particle.springFactor;
            particle.velocity.y += dy * particle.springFactor;
            
            // Apply friction
            particle.velocity.x *= particle.friction;
            particle.velocity.y *= particle.friction;
            
            // Update position
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            
            // Draw particle
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw subtle connection lines between nearby particles for a more coherent look
            if (i < this.particles.length - 1) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const otherParticle = this.particles[j];
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 15) { // Only connect very close particles
                        this.ctx.strokeStyle = `rgba(100, 220, 255, ${0.15 * (1 - distance / 15)})`; // Fade by distance
                        this.ctx.lineWidth = 0.5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(otherParticle.x, otherParticle.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
        
        // Reset shadow for performance
        this.ctx.shadowBlur = 0;
    }
}

/**
 * Apply particle effect to an element
 * @param {HTMLElement} element - The element to apply effect to
 */
function applyParticleEffect(element) {
    new ParticleText(element);
}

/**
 * Animate all particle text instances
 */
function animate() {
    // Update each instance
    let isAnyActive = false;
    
    particleTextInstances.forEach(instance => {
        instance.update();
        
        if (instance.isActive) {
            isAnyActive = true;
        }
    });
    
    // Continue animation if any instance is active
    if (isAnyActive) {
        animationFrameId = requestAnimationFrame(animate);
    } else {
        animationFrameId = null;
    }
}