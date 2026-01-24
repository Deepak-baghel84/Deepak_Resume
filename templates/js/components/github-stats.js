/**
 * GitHub Integration Component
 * Displays GitHub repositories with stats and visualizations
 */

// Global variables
let githubUsername = 'your-github-username'; // REPLACE_WITH_YOUR_GITHUB_USERNAME
let repoData = [];
let repoStats = {};
let repoLanguages = {};
let loadingRepos = false;
let languageColors = {
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "Java": "#b07219",
    "C++": "#f34b7d",
    "TypeScript": "#2b7489",
    "C#": "#178600",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "Go": "#00ADD8",
    "Swift": "#ffac45",
    "Kotlin": "#F18E33",
    "R": "#198CE7",
    "Dart": "#00B4AB",
    "Rust": "#dea584",
    "Scala": "#c22d40",
    "Jupyter Notebook": "#DA5B0B",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Shell": "#89e051",
    "Other": "#8257e5"
};

// Initialize GitHub integration when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initGitHubStats();
});

/**
 * Initialize GitHub stats
 */
function initGitHubStats() {
    const githubContainer = document.getElementById('github-repos-container');
    
    if (githubContainer) {
        // Check if demo mode or real mode
        const isDemo = githubContainer.getAttribute('data-demo') === 'true';
        
        if (isDemo) {
            // Load demo data
            loadDemoData(githubContainer);
        } else {
            // Load real GitHub data
            loadGitHubData(githubContainer);
        }
    }
}

/**
 * Load GitHub data from API
 * @param {HTMLElement} container - Container element
 */
function loadGitHubData(container) {
    if (loadingRepos) return;
    loadingRepos = true;
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-10">
            <div class="inline-block">
                <i class="fas fa-code-branch text-4xl text-accent-purple mb-4 animate-spin"></i>
            </div>
            <p class="text-gray-400">Loading GitHub repositories...</p>
        </div>
    `;
    
    // Check if username is set
    if (!githubUsername || githubUsername === 'your-github-username') {
        container.innerHTML = `
            <div class="bg-dark-card p-6 rounded-lg text-center">
                <i class="fas fa-exclamation-triangle text-accent-pink text-3xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">GitHub Username Not Set</h3>
                <p class="text-gray-400 mb-4">Please set your GitHub username in the portfolio configuration.</p>
                <div class="bg-dark-bg p-3 rounded text-left mb-4 overflow-x-auto">
                    <code>// In js/components/github-stats.js, replace:<br>
                    let githubUsername = '<span class="text-accent-pink">your-github-username</span>';</code>
                </div>
                <button onclick="loadDemoData(document.getElementById('github-repos-container'))" 
                    class="btn-secondary">
                    Load Demo Data Instead
                </button>
            </div>
        `;
        loadingRepos = false;
        return;
    }
    
    // Fetch repos from GitHub API
    fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            return response.json();
        })
        .then(repos => {
            repoData = repos;
            return Promise.all(repos.map(repo => 
                fetch(`https://api.github.com/repos/${githubUsername}/${repo.name}/languages`)
                    .then(res => res.json())
                    .then(languages => {
                        repoLanguages[repo.name] = languages;
                    })
            ));
        })
        .then(() => {
            renderRepos(container);
            createLanguageChart();
            loadingRepos = false;
        })
        .catch(error => {
            console.error('Error fetching GitHub data:', error);
            
            container.innerHTML = `
                <div class="bg-dark-card p-6 rounded-lg text-center">
                    <i class="fas fa-exclamation-triangle text-accent-pink text-3xl mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Error Loading GitHub Data</h3>
                    <p class="text-gray-400 mb-4">${error.message}</p>
                    <button onclick="loadDemoData(document.getElementById('github-repos-container'))" 
                        class="btn-secondary">
                        Load Demo Data Instead
                    </button>
                </div>
            `;
            
            loadingRepos = false;
        });
}

/**
 * Load demo GitHub data
 * @param {HTMLElement} container - Container element
 */
function loadDemoData(container) {
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-10">
            <div class="inline-block">
                <i class="fas fa-code-branch text-4xl text-accent-purple mb-4 animate-spin"></i>
            </div>
            <p class="text-gray-400">Loading demo repositories...</p>
        </div>
    `;
    
    // Create demo data
    repoData = [
        {
            name: "neural-style-transfer",
            description: "Implementation of neural style transfer using PyTorch.",
            html_url: "#",
            stargazers_count: 124,
            forks_count: 32,
            updated_at: "2023-05-15T12:00:00Z"
        },
        {
            name: "transformer-chatbot",
            description: "A conversational AI chatbot using transformer architecture.",
            html_url: "#",
            stargazers_count: 87,
            forks_count: 21,
            updated_at: "2023-03-10T15:00:00Z"
        },
        {
            name: "object-detection-app",
            description: "Real-time object detection application using YOLO.",
            html_url: "#",
            stargazers_count: 56,
            forks_count: 14,
            updated_at: "2023-01-22T09:00:00Z"
        },
        {
            name: "recommendation-engine",
            description: "Collaborative filtering recommendation system.",
            html_url: "#",
            stargazers_count: 43,
            forks_count: 9,
            updated_at: "2022-11-05T18:00:00Z"
        },
        {
            name: "sentiment-analysis-api",
            description: "RESTful API for sentiment analysis of text.",
            html_url: "#",
            stargazers_count: 32,
            forks_count: 7,
            updated_at: "2022-09-18T13:00:00Z"
        },
        {
            name: "reinforcement-learning-demos",
            description: "Collection of reinforcement learning examples and tutorials.",
            html_url: "#",
            stargazers_count: 28,
            forks_count: 6,
            updated_at: "2022-07-30T10:00:00Z"
        }
    ];
    
    // Demo language data
    repoLanguages = {
        "neural-style-transfer": { "Python": 6540, "Jupyter Notebook": 2140 },
        "transformer-chatbot": { "Python": 4530, "JavaScript": 1240, "HTML": 560 },
        "object-detection-app": { "Python": 3250, "TypeScript": 1870, "CSS": 420 },
        "recommendation-engine": { "Python": 2950, "R": 840 },
        "sentiment-analysis-api": { "Python": 1840, "JavaScript": 750, "TypeScript": 350 },
        "reinforcement-learning-demos": { "Python": 3670, "Jupyter Notebook": 1430 }
    };
    
    // Render repos with demo data
    setTimeout(() => {
        renderRepos(container);
        createLanguageChart();
    }, 800);
}

/**
 * Render repository cards
 * @param {HTMLElement} container - Container element
 */
function renderRepos(container) {
    if (!repoData || repoData.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10">
                <p class="text-gray-400">No repositories found.</p>
            </div>
        `;
        return;
    }
    
    // Create container for repo cards and stats
    container.innerHTML = `
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-4 text-white">GitHub Activity</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-dark-card p-4 rounded-lg">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-code text-accent-neon mr-3"></i>
                        <h4 class="font-semibold">Top Languages</h4>
                    </div>
                    <div id="languages-chart" class="h-40"></div>
                </div>
                <div class="bg-dark-card p-4 rounded-lg">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-star text-accent-purple mr-3"></i>
                        <h4 class="font-semibold">Stars & Forks</h4>
                    </div>
                    <div id="stars-forks-stats" class="flex justify-around">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-accent-neon mb-1">${getTotalStars()}</div>
                            <div class="text-gray-400 text-sm">Stars</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-accent-purple mb-1">${getTotalForks()}</div>
                            <div class="text-gray-400 text-sm">Forks</div>
                        </div>
                    </div>
                </div>
                <div class="bg-dark-card p-4 rounded-lg flex items-center justify-center">
                    <a href="https://github.com/${githubUsername}" target="_blank" rel="noopener noreferrer" 
                       class="flex flex-col items-center hover:text-accent-neon transition-colors">
                        <i class="fab fa-github text-4xl mb-2"></i>
                        <span>View GitHub Profile</span>
                    </a>
                </div>
            </div>
        </div>
        
        <h3 class="text-xl font-bold mb-4 text-white">Recent Repositories</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="repo-cards-container"></div>
    `;
    
    // Render repo cards
    const repoCardsContainer = document.getElementById('repo-cards-container');
    
    repoData.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'bg-dark-card rounded-lg overflow-hidden hover:-translate-y-2 transition-transform duration-300';
        
        // Get repo languages
        const languages = repoLanguages[repo.name] || {};
        const languageKeys = Object.keys(languages);
        const primaryLanguage = languageKeys.length > 0 ? languageKeys[0] : null;
        const languageColor = primaryLanguage ? (languageColors[primaryLanguage] || '#8257e5') : '#8257e5';
        
        // Format date
        const updatedDate = new Date(repo.updated_at);
        const formattedDate = updatedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="p-4">
                <div class="flex items-start mb-2">
                    <i class="fas fa-code-branch text-gray-400 mt-1 mr-3"></i>
                    <div>
                        <h3 class="font-bold">
                            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"
                               class="hover:text-accent-neon transition-colors">
                                ${repo.name}
                            </a>
                        </h3>
                        ${primaryLanguage ? `
                            <div class="flex items-center mt-1">
                                <span class="w-3 h-3 rounded-full mr-1" style="background-color: ${languageColor}"></span>
                                <span class="text-sm text-gray-400">${primaryLanguage}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <p class="text-gray-400 text-sm mb-4 h-12 overflow-hidden">
                    ${repo.description || 'No description provided.'}
                </p>
                <div class="flex justify-between text-sm text-gray-400">
                    <div class="flex items-center">
                        <i class="fas fa-star mr-1"></i>
                        <span>${repo.stargazers_count}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-code-branch mr-1"></i>
                        <span>${repo.forks_count}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-history mr-1"></i>
                        <span>${formattedDate}</span>
                    </div>
                </div>
            </div>
        `;
        
        repoCardsContainer.appendChild(card);
    });
}

/**
 * Create language distribution chart
 */
function createLanguageChart() {
    const canvas = document.getElementById('languages-chart');
    
    if (!canvas) return;
    
    // Get language stats
    const languageStats = getLanguageStats();
    const languages = Object.keys(languageStats).slice(0, 5); // Top 5 languages
    
    // Create canvas context
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw pie chart
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    
    let startAngle = 0;
    const total = languages.reduce((sum, lang) => sum + languageStats[lang], 0);
    
    // Draw pie slices
    languages.forEach((language, index) => {
        const value = languageStats[language];
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = languageColors[language] || languageColors.Other;
        ctx.fill();
        
        startAngle += sliceAngle;
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1F2B';
    ctx.fill();
    
    // Draw legend
    const legendX = 10;
    let legendY = 10;
    
    ctx.font = '10px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    languages.forEach(language => {
        const percentage = Math.round((languageStats[language] / total) * 100);
        
        // Draw color box
        ctx.fillStyle = languageColors[language] || languageColors.Other;
        ctx.fillRect(legendX, legendY, 10, 10);
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.fillText(`${language} (${percentage}%)`, legendX + 15, legendY + 5);
        
        legendY += 18;
    });
}

/**
 * Get total stars across all repositories
 * @returns {Number} Total stars
 */
function getTotalStars() {
    return repoData.reduce((total, repo) => total + repo.stargazers_count, 0);
}

/**
 * Get total forks across all repositories
 * @returns {Number} Total forks
 */
function getTotalForks() {
    return repoData.reduce((total, repo) => total + repo.forks_count, 0);
}

/**
 * Get language statistics across all repositories
 * @returns {Object} Language statistics
 */
function getLanguageStats() {
    const stats = {};
    
    Object.values(repoLanguages).forEach(languages => {
        Object.entries(languages).forEach(([language, bytes]) => {
            if (!stats[language]) {
                stats[language] = 0;
            }
            stats[language] += bytes;
        });
    });
    
    // Sort by byte count
    const sortedStats = {};
    Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([language, bytes]) => {
            sortedStats[language] = bytes;
        });
    
    return sortedStats;
}