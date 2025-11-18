import { readFileSync, writeFileSync } from 'fs';

// Read the current index.html
let html = readFileSync('index.html', 'utf-8');

// 1. Add gemini-motion.js script tag
const scriptSection = html.match(/(<!-- Non-critical Resources -->[\s\S]*?<script src="js\/interactive\.js[^>]*><\/script>)/);
if (scriptSection && !html.includes('gemini-motion.js')) {
    const updatedScripts = scriptSection[0].replace(
        '<!-- Non-critical Resources -->',
        '<!-- Non-critical Resources -->\n    <script src="js/gemini-motion.js?v=20250922" defer></script>'
    );
    html = html.replace(scriptSection[0], updatedScripts);
    console.log('✓ Added gemini-motion.js script tag');
} else {
    console.log('⚠ Script tag already exists or section not found');
}

// 2. Add topic selection UI and loading state
const motionGeneratorSection = html.match(/(<div class="card bg-white p-6 md:p-8 space-y-4" id="motion-generator">[\s\S]*?<\/span>\s*<\/div>)([\s\S]*?)(<p class="text-sm uppercase tracking-\[0\.2em\] text-\[var\(--ink-light\)\]" id="motion-topic">)/);

if (motionGeneratorSection && !html.includes('topic-select')) {
    const topicSelectionUI = `
            
            <!-- Topic Selection -->
            <div class="space-y-3">
              <div>
                <label for="topic-select" class="text-xs font-semibold text-[var(--ink-light)] uppercase tracking-wide">Select Topic</label>
                <select id="topic-select" class="w-full mt-1 px-4 py-2 border border-[var(--ink)]/20 rounded-lg bg-white text-[var(--ink)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  <option value="Technology & Society">Technology & Society</option>
                  <option value="Education">Education</option>
                  <option value="Economics">Economics</option>
                  <option value="Ethics">Ethics</option>
                  <option value="Environment">Environment</option>
                  <option value="Geopolitics">Geopolitics</option>
                  <option value="Culture">Culture</option>
                  <option value="Health & Medicine">Health & Medicine</option>
                  <option value="Law & Justice">Law & Justice</option>
                  <option value="Sports & Entertainment">Sports & Entertainment</option>
                  <option value="custom">Custom Topic...</option>
                </select>
              </div>
              
              <div id="custom-topic-container" class="hidden">
                <label for="custom-topic-input" class="text-xs font-semibold text-[var(--ink-light)] uppercase tracking-wide">Custom Topic</label>
                <input 
                  type="text" 
                  id="custom-topic-input" 
                  placeholder="Enter your custom topic..."
                  class="w-full mt-1 px-4 py-2 border border-[var(--ink)]/20 rounded-lg bg-white text-[var(--ink)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>

              <div>
                <label for="format-select" class="text-xs font-semibold text-[var(--ink-light)] uppercase tracking-wide">Debate Format</label>
                <select id="format-select" class="w-full mt-1 px-4 py-2 border border-[var(--ink)]/20 rounded-lg bg-white text-[var(--ink)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
                  <option value="British Parliamentary">British Parliamentary (BP)</option>
                  <option value="Asian Parliamentary">Asian Parliamentary</option>
                  <option value="WUDC">WUDC</option>
                  <option value="Australs">Australs</option>
                  <option value="American Parliamentary">American Parliamentary</option>
                </select>
              </div>
            </div>

            `;

    html = html.replace(motionGeneratorSection[1], motionGeneratorSection[1] + topicSelectionUI);
    console.log('✓ Added topic selection UI');
} else {
    console.log('⚠ Topic selection UI already exists or section not found');
}

// 3. Update motion text section to include loading state
const motionTextSection = html.match(/(<p class="text-lg font-semibold leading-relaxed" id="motion-text">[\s\S]*?<\/p>)/);
if (motionTextSection && !html.includes('motion-loading')) {
    const updatedMotionText = motionTextSection[0].replace(
        'class="text-lg font-semibold leading-relaxed"',
        'class="text-lg font-semibold leading-relaxed min-h-[60px]"'
    );

    const loadingIndicator = `
              <div id="motion-loading" class="absolute inset-0 bg-white/90 hidden items-center justify-center rounded-lg">
                <div class="flex items-center gap-2 text-[var(--primary)]">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="font-medium">Generating motion...</span>
                </div>
              </div>`;

    html = html.replace(
        motionTextSection[0],
        `<div class="relative">\n              ${updatedMotionText}${loadingIndicator}\n            </div>`
    );
    console.log('✓ Added loading indicator');
} else {
    console.log('⚠ Loading indicator already exists or section not found');
}

// Write the updated HTML
writeFileSync('index.html', html, 'utf-8');
console.log('\n✅ index.html has been updated successfully!');
console.log('\nNext steps:');
console.log('1. Copy .env.example to .env and add your GEMINI_API_KEY');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000 in your browser');
