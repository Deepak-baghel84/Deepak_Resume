/**
 * Machine Learning Demos
 * Simple interactive ML demos for the portfolio
 */

// Global variables
let imageClassifierCanvas, imageClassifierCtx;
let isDrawing = false;

// ML demo data
const mlDemoData = {
    imageClasses: [
        'Circle', 'Square', 'Triangle', 'Star', 
        'Heart', 'Arrow', 'Line', 'Smiley Face'
    ],
    textClasses: [
        'Positive', 'Negative', 'Neutral'
    ]
};

// Initialize ML demos when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMlDemos();
});

/**
 * Initialize ML demos
 */
function initMlDemos() {
    // Initialize specific demos
    initImageClassifierDemo();
    initSentimentAnalysisDemo();
}

/**
 * Initialize image classifier demo
 */
function initImageClassifierDemo() {
    const demoContainer = document.getElementById('image-classifier-demo');
    
    if (demoContainer) {
        // Create canvas for drawing
        createDrawingCanvas(demoContainer);
        
        // Create controls
        createClassifierControls(demoContainer);
        
        // Add event listeners
        addDrawingEventListeners();
    }
}

/**
 * Create drawing canvas for image classifier
 * @param {HTMLElement} container - Container element
 */
function createDrawingCanvas(container) {
    // Create canvas wrapper
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'w-full aspect-square bg-dark-bg rounded-lg overflow-hidden border-2 border-dark-border hover:border-accent-purple transition-colors duration-300 mb-4';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'image-classifier-canvas';
    canvas.width = 280;
    canvas.height = 280;
    canvas.className = 'w-full h-full cursor-crosshair';
    canvas.style.touchAction = 'none'; // Prevent scrolling on touch devices
    
    canvasWrapper.appendChild(canvas);
    container.appendChild(canvasWrapper);
    
    // Get canvas context
    imageClassifierCanvas = canvas;
    imageClassifierCtx = canvas.getContext('2d');
    
    // Set canvas background
    imageClassifierCtx.fillStyle = '#1A1F2B';
    imageClassifierCtx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Create controls for image classifier
 * @param {HTMLElement} container - Container element
 */
function createClassifierControls(container) {
    // Create controls wrapper
    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'space-y-4';
    
    // Create buttons
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'flex justify-between space-x-2';
    
    // Clear button
    const clearButton = document.createElement('button');
    clearButton.id = 'clear-canvas';
    clearButton.className = 'flex-1 bg-dark-card hover:bg-accent-purple text-white py-2 px-4 rounded transition-colors';
    clearButton.textContent = 'Clear';
    clearButton.addEventListener('click', clearCanvas);
    
    // Classify button
    const classifyButton = document.createElement('button');
    classifyButton.id = 'classify-image';
    classifyButton.className = 'flex-1 bg-accent-neon hover:bg-accent-purple text-dark-bg hover:text-white font-semibold py-2 px-4 rounded transition-colors';
    classifyButton.textContent = 'Classify';
    classifyButton.addEventListener('click', classifyImage);
    
    buttonsWrapper.appendChild(clearButton);
    buttonsWrapper.appendChild(classifyButton);
    
    // Result container
    const resultContainer = document.createElement('div');
    resultContainer.id = 'classification-result';
    resultContainer.className = 'bg-dark-card p-4 rounded-lg';
    resultContainer.innerHTML = `
        <p class="text-center text-gray-400 mb-2">Draw a simple shape, then click Classify</p>
        <div id="result-placeholder" class="hidden">
            <p class="text-center mb-2">I think you drew:</p>
            <p id="prediction-result" class="text-center text-2xl font-bold text-accent-neon"></p>
        </div>
        <div id="prediction-bars" class="mt-4 space-y-2 hidden"></div>
    `;
    
    // Assemble controls
    controlsWrapper.appendChild(buttonsWrapper);
    controlsWrapper.appendChild(resultContainer);
    container.appendChild(controlsWrapper);
}

/**
 * Add event listeners for drawing
 */
function addDrawingEventListeners() {
    if (!imageClassifierCanvas) return;
    
    // Mouse events
    imageClassifierCanvas.addEventListener('mousedown', startDrawing);
    imageClassifierCanvas.addEventListener('mousemove', draw);
    imageClassifierCanvas.addEventListener('mouseup', stopDrawing);
    imageClassifierCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    imageClassifierCanvas.addEventListener('touchstart', startTouchDrawing);
    imageClassifierCanvas.addEventListener('touchmove', touchDraw);
    imageClassifierCanvas.addEventListener('touchend', stopDrawing);
}

/**
 * Start drawing on mouse down
 * @param {MouseEvent} e - Mouse event
 */
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

/**
 * Handle touch start
 * @param {TouchEvent} e - Touch event
 */
function startTouchDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    touchDraw(e);
}

/**
 * Draw on canvas with mouse
 * @param {MouseEvent} e - Mouse event
 */
function draw(e) {
    if (!isDrawing) return;
    
    const rect = imageClassifierCanvas.getBoundingClientRect();
    const scaleX = imageClassifierCanvas.width / rect.width;
    const scaleY = imageClassifierCanvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    imageClassifierCtx.lineWidth = 15;
    imageClassifierCtx.lineCap = 'round';
    imageClassifierCtx.strokeStyle = '#FFFFFF';
    
    imageClassifierCtx.lineTo(x, y);
    imageClassifierCtx.stroke();
    imageClassifierCtx.beginPath();
    imageClassifierCtx.moveTo(x, y);
}

/**
 * Draw on canvas with touch
 * @param {TouchEvent} e - Touch event
 */
function touchDraw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = imageClassifierCanvas.getBoundingClientRect();
    const scaleX = imageClassifierCanvas.width / rect.width;
    const scaleY = imageClassifierCanvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    imageClassifierCtx.lineWidth = 15;
    imageClassifierCtx.lineCap = 'round';
    imageClassifierCtx.strokeStyle = '#FFFFFF';
    
    imageClassifierCtx.lineTo(x, y);
    imageClassifierCtx.stroke();
    imageClassifierCtx.beginPath();
    imageClassifierCtx.moveTo(x, y);
}

/**
 * Stop drawing
 */
function stopDrawing() {
    isDrawing = false;
    imageClassifierCtx.beginPath();
}

/**
 * Clear canvas
 */
function clearCanvas() {
    imageClassifierCtx.fillStyle = '#1A1F2B';
    imageClassifierCtx.fillRect(0, 0, imageClassifierCanvas.width, imageClassifierCanvas.height);
    
    // Hide results
    document.getElementById('result-placeholder').classList.add('hidden');
    document.getElementById('prediction-bars').classList.add('hidden');
}

/**
 * Use Gemini API to classify the drawn image
 */
function classifyImage() {
    // Get result elements
    const resultPlaceholder = document.getElementById('result-placeholder');
    const predictionResult = document.getElementById('prediction-result');
    const predictionBars = document.getElementById('prediction-bars');
    
    // Show loading state
    resultPlaceholder.classList.remove('hidden');
    predictionResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    predictionBars.innerHTML = '';
    predictionBars.classList.add('hidden');
    
    // Convert canvas to base64 image data
    const imageData = imageClassifierCanvas.toDataURL('image/png');
    
    // Call the API endpoint
    fetch('/api/classify-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData })
    })
    .then(response => response.json())
    .then(data => {
        // Display top prediction
        const topPrediction = data.predictions[0];
        predictionResult.textContent = topPrediction.label;
        
        // Display all predictions as bars
        predictionBars.innerHTML = '';
        
        data.predictions.forEach(pred => {
            const barContainer = document.createElement('div');
            barContainer.className = 'flex items-center space-x-2';
            
            const label = document.createElement('div');
            label.className = 'w-24 text-right';
            label.textContent = pred.label;
            
            const barWrapper = document.createElement('div');
            barWrapper.className = 'flex-1 bg-dark-border h-4 rounded-full overflow-hidden';
            
            const bar = document.createElement('div');
            bar.className = 'h-full rounded-full';
            bar.style.width = '0%'; // Start at 0% for animation
            
            // Different colors based on position
            if (pred.confidence > 50) {
                bar.className += ' bg-accent-neon';
            } else if (pred.confidence > 20) {
                bar.className += ' bg-accent-purple';
            } else {
                bar.className += ' bg-accent-pink';
            }
            
            // Animate the bar
            bar.style.transition = 'width 0.8s ease-out';
            setTimeout(() => {
                bar.style.width = `${pred.confidence}%`;
            }, 10);
            
            const percentage = document.createElement('div');
            percentage.className = 'w-12 text-right';
            percentage.textContent = `${Math.round(pred.confidence)}%`;
            
            barWrapper.appendChild(bar);
            barContainer.appendChild(label);
            barContainer.appendChild(barWrapper);
            barContainer.appendChild(percentage);
            
            predictionBars.appendChild(barContainer);
        });
        
        predictionBars.classList.remove('hidden');
    })
    .catch(error => {
        predictionResult.innerHTML = 'Error analyzing image';
        console.error('Error:', error);
    });
}

/**
 * Generate random predictions for demo purposes
 * @returns {Array} Array of prediction objects
 */
function generateRandomPredictions() {
    const classes = [...mlDemoData.imageClasses];
    const predictions = [];
    
    // Pick a "winner" with high confidence
    const winnerIndex = Math.floor(Math.random() * classes.length);
    const winner = classes[winnerIndex];
    
    predictions.push({
        label: winner,
        confidence: 70 + Math.random() * 25 // 70-95%
    });
    
    // Remove winner from classes
    classes.splice(winnerIndex, 1);
    
    // Shuffle remaining classes
    const shuffled = classes.sort(() => 0.5 - Math.random());
    
    // Take top 3 from shuffled
    for (let i = 0; i < 3; i++) {
        if (i < shuffled.length) {
            // Lower confidence for other classes
            let confidence;
            if (i === 0) {
                confidence = 10 + Math.random() * 20; // 10-30%
            } else if (i === 1) {
                confidence = 5 + Math.random() * 10; // 5-15%
            } else {
                confidence = Math.random() * 5; // 0-5%
            }
            
            predictions.push({
                label: shuffled[i],
                confidence: confidence
            });
        }
    }
    
    return predictions;
}

/**
 * Initialize sentiment analysis demo
 */
function initSentimentAnalysisDemo() {
    const demoContainer = document.getElementById('sentiment-analysis-demo');
    
    if (demoContainer) {
        // Create input area
        const inputArea = document.createElement('div');
        inputArea.className = 'mb-4';
        inputArea.innerHTML = `
            <label for="sentiment-input" class="block text-white mb-2">Enter text to analyze:</label>
            <textarea id="sentiment-input" class="w-full bg-dark-bg text-white border-2 border-dark-border hover:border-accent-purple transition-colors rounded-lg p-3 min-h-[120px]" placeholder="Type a sentence to analyze its sentiment..."></textarea>
        `;
        
        // Create analyze button
        const analyzeButton = document.createElement('button');
        analyzeButton.id = 'analyze-sentiment';
        analyzeButton.className = 'w-full bg-accent-purple hover:bg-accent-pink text-white font-semibold py-2 px-4 rounded transition-colors mb-4';
        analyzeButton.textContent = 'Analyze Sentiment';
        analyzeButton.addEventListener('click', analyzeSentiment);
        
        // Create result container
        const resultContainer = document.createElement('div');
        resultContainer.id = 'sentiment-result';
        resultContainer.className = 'bg-dark-card p-4 rounded-lg hidden';
        
        // Add everything to container
        demoContainer.appendChild(inputArea);
        demoContainer.appendChild(analyzeButton);
        demoContainer.appendChild(resultContainer);
    }
}

/**
 * Analyze sentiment of input text using Gemini API
 */
function analyzeSentiment() {
    const inputField = document.getElementById('sentiment-input');
    const resultContainer = document.getElementById('sentiment-result');
    
    if (inputField && resultContainer) {
        const text = inputField.value.trim();
        
        if (text === '') {
            alert('Please enter some text to analyze.');
            return;
        }
        
        // Show loading state
        resultContainer.classList.remove('hidden');
        resultContainer.innerHTML = `
            <div class="flex justify-center">
                <i class="fas fa-spinner fa-spin text-2xl text-accent-purple"></i>
            </div>
            <p class="text-center mt-2">Analyzing sentiment...</p>
        `;
        
        // Call the API endpoint
        fetch('/api/analyze-sentiment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        })
        .then(response => response.json())
        .then(result => {
            // Display result
            resultContainer.innerHTML = `
                <div class="text-center mb-4">
                    <div class="text-4xl mb-2">
                        ${result.emoji}
                    </div>
                    <div class="text-2xl font-bold mb-1" style="color: ${result.color}">
                        ${result.label}
                    </div>
                    <div class="text-gray-400">
                        Confidence: ${result.confidence}%
                    </div>
                </div>
                
                <div class="w-full bg-dark-border h-6 rounded-full overflow-hidden mt-4">
                    <div class="h-full flex">
                        <div style="width: ${result.distribution.negative}%; background-color: #FF5555"></div>
                        <div style="width: ${result.distribution.neutral}%; background-color: #AAAAAA"></div>
                        <div style="width: ${result.distribution.positive}%; background-color: #55FF55"></div>
                    </div>
                </div>
                
                <div class="flex justify-between text-sm mt-1">
                    <span>Negative</span>
                    <span>Neutral</span>
                    <span>Positive</span>
                </div>
                
                <div class="mt-4 pt-4 border-t border-dark-border">
                    <p class="text-gray-400">Key phrases detected:</p>
                    <ul class="list-disc pl-5 mt-2 space-y-1">
                        ${result.keyPhrases.map(phrase => `<li>${phrase}</li>`).join('')}
                    </ul>
                </div>
            `;
        })
        .catch(error => {
            resultContainer.innerHTML = `
                <div class="text-center text-red-500">
                    <p>Error analyzing text. Please try again.</p>
                </div>
            `;
            console.error('Error:', error);
        });
    }
}

/**
 * Simulate sentiment analysis (for demo purposes)
 * @param {String} text - Text to analyze
 * @returns {Object} Analysis result
 */
function simulateSentimentAnalysis(text) {
    // This is a very simple rule-based simulation
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'love', 'like', 'best', 'wonderful', 'beautiful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'hate', 'dislike', 'worst', 'poor', 'ugly'];
    
    // Count word occurrences
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Convert text to lowercase
    const lowerText = text.toLowerCase();
    
    // Check for positive words
    positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
            positiveCount += matches.length;
        }
    });
    
    // Check for negative words
    negativeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
            negativeCount += matches.length;
        }
    });
    
    // Extract key phrases (words > 4 chars)
    const words = lowerText.match(/\b[a-z]{5,}\b/g) || [];
    const keyPhrases = [...new Set(words)].slice(0, 3);
    
    // If no key phrases found, add some generic ones
    if (keyPhrases.length === 0) {
        keyPhrases.push('No significant keywords found');
    }
    
    // Calculate baseline sentiment
    let sentimentValue;
    
    if (positiveCount > negativeCount) {
        sentimentValue = 0.5 + (Math.min(positiveCount, 5) / 10);
    } else if (negativeCount > positiveCount) {
        sentimentValue = 0.5 - (Math.min(negativeCount, 5) / 10);
    } else {
        sentimentValue = 0.45 + (Math.random() * 0.1);
    }
    
    // Add some randomness for demo purposes
    sentimentValue += (Math.random() * 0.2 - 0.1);
    sentimentValue = Math.max(0, Math.min(1, sentimentValue));
    
    // Determine sentiment label
    let label, emoji, color;
    
    if (sentimentValue > 0.65) {
        label = 'Positive';
        emoji = '😃';
        color = '#55FF55';
    } else if (sentimentValue < 0.35) {
        label = 'Negative';
        emoji = '😞';
        color = '#FF5555';
    } else {
        label = 'Neutral';
        emoji = '😐';
        color = '#AAAAAA';
    }
    
    // Calculate distribution
    const positive = Math.round(sentimentValue * 100);
    const negative = Math.round((1 - sentimentValue) * 60);
    const neutral = 100 - positive - negative;
    
    return {
        label,
        emoji,
        color,
        confidence: Math.round(Math.abs(sentimentValue - 0.5) * 2 * 70 + 30),
        distribution: {
            positive,
            neutral,
            negative
        },
        keyPhrases
    };
}